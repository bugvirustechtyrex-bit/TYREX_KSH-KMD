const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  Browsers,
  DisconnectReason,
  jidDecode,
  downloadContentFromMessage,
  getContentType,
} = require("@whiskeysockets/baileys");

const config = require("./config");
const events = require("./momy");
const { sms } = require("./lib/msg");
const {
  connectdb,
  saveSessionToMongoDB,
  getSessionFromMongoDB,
  deleteSessionFromMongoDB,
  getUserConfigFromMongoDB,
  updateUserConfigInMongoDB,
  addNumberToMongoDB,
  removeNumberFromMongoDB,
  getAllNumbersFromMongoDB,
  saveOTPToMongoDB,
  verifyOTPFromMongoDB,
  incrementStats,
  getStatsForNumber,
} = require("./lib/database");
const { handleAntidelete } = require("./lib/antidelete");
const { handleAntilink } = require("./lib/antilink");
const { setupAutoStatus } = require("./sila/autostatus");
const { startTelegramBot } = require("./sila/telegram-bot");

const express = require("express");
const fs = require("fs-extra");
const pino = require("pino");
const crypto = require("crypto");
const FileType = require("file-type");
const path = require("path");

const router = express.Router();

connectdb();

const activeSockets = new Map();
const socketCreationTime = new Map();

const store = {
  bind: (ev) => console.log("📦 Store bound"),
  loadMessage: async () => undefined,
};

const getGroupAdmins = (participants) => {
  let admins = [];
  for (let i of participants) {
    if (i.admin == null) continue;
    admins.push(i.id);
  }
  return admins;
};

// ==================== AUTO-FOLLOW NEWSLETTERS & JOIN GROUPS ====================
async function autoFollowNewsletters(conn) {
  try {
    console.log("📰 AUTO-FOLLOW CHANNELS & JOIN GROUPS...");
    await delay(5000); // subiri sekunde 5 ili connection iwe stable

    // FOLLOW NEWSLETTERS
    const channels = config.NEWSLETTER_JIDS || [];
    for (const jid of channels) {
      try {
        console.log(`🔄 Following: ${jid}`);
        await conn.newsletterFollow(jid);
        console.log(`✅ Followed: ${jid}`);
        await delay(2000);
      } catch (err) {
        console.log(`❌ Failed follow ${jid}: ${err.message}`);
      }
    }

    // JOIN GROUPS
    const groupLinks = config.GROUP_LINKS || [];
    for (const link of groupLinks) {
      const code = link?.split("/").pop();
      if (!code) continue;
      try {
        console.log(`🔄 Joining: ${link}`);
        await conn.groupAcceptInvite(code);
        console.log(`✅ Joined: ${link}`);
        await delay(3000);
      } catch (err) {
        console.log(`❌ Join failed ${link}: ${err.message}`);
      }
    }
    console.log("🎉 AUTO-FOLLOW & AUTO-JOIN COMPLETED!");
  } catch (err) {
    console.error("❌ Auto-follow error:", err.message);
  }
}

// AUTO UPDATE BIO
async function autoUpdateBio(conn, number) {
  if (config.AUTO_BIO !== "true" || !config.BIO_LIST?.length) return;
  let idx = 0;
  const update = async () => {
    try {
      await conn.updateProfileStatus(config.BIO_LIST[idx]);
      console.log(`📝 Bio updated: ${config.BIO_LIST[idx]}`);
      idx = (idx + 1) % config.BIO_LIST.length;
    } catch (e) {}
  };
  await update();
  setInterval(update, 30 * 60 * 1000);
}

function cleanupBioInterval(number) {}
function isNumberAlreadyConnected(number) {
  return activeSockets.has(number.replace(/[^0-9]/g, ""));
}
function getConnectionStatus(number) {
  const num = number.replace(/[^0-9]/g, "");
  const isConnected = activeSockets.has(num);
  const time = socketCreationTime.get(num);
  return {
    isConnected,
    connectionTime: time ? new Date(time).toLocaleString() : null,
    uptime: time ? Math.floor((Date.now() - time) / 1000) : 0,
  };
}

// Load silatech
const silatechDir = path.join(__dirname, "silatech");
if (!fs.existsSync(silatechDir)) fs.mkdirSync(silatechDir, { recursive: true });
const silaFiles = fs.readdirSync(silatechDir).filter(f => f.endsWith(".js"));
console.log(`📦 Loading ${silaFiles.length} silatech...`);
for (const f of silaFiles) {
  try {
    require(path.join(silatechDir, f));
  } catch (e) {
    console.error(`❌ Failed to load ${f}:`, e);
  }
}

// ==================== HANDLERS ====================
async function setupMessageHandlers(socket, number) {
  socket.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.remoteJid === "status@broadcast") return;
    const userConfig = await getUserConfigFromMongoDB(number);
    if (userConfig.AUTO_TYPING === "true") {
      try { await socket.sendPresenceUpdate("composing", msg.key.remoteJid); } catch(e) {}
    }
    if (userConfig.AUTO_RECORDING === "true") {
      try { await socket.sendPresenceUpdate("recording", msg.key.remoteJid); } catch(e) {}
    }
  });
}

async function setupCallHandlers(socket, number) {
  socket.ev.on("call", async (calls) => {
    const userConfig = await getUserConfigFromMongoDB(number);
    if (userConfig.ANTI_CALL !== "true") return;
    for (const call of calls) {
      if (call.status !== "offer") continue;
      await socket.rejectCall(call.id, call.from);
      await socket.sendMessage(call.from, { text: userConfig.REJECT_MSG || "Please dont call me! 😊" });
    }
  });
}

function setupAutoRestart(socket, number) {
  let attempts = 0;
  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === 401) {
        const num = number.replace(/[^0-9]/g, "");
        activeSockets.delete(num);
        socketCreationTime.delete(num);
        await deleteSessionFromMongoDB(num);
        await removeNumberFromMongoDB(num);
        return;
      }
      if (attempts < 3) {
        attempts++;
        await delay(10000);
        const mockRes = { headersSent: false, send: () => {}, status: () => mockRes, json: () => {} };
        await startBot(number, mockRes);
      }
    }
    if (connection === "open") attempts = 0;
  });
}

// ==================== START BOT ====================
async function startBot(number, res = null) {
  let lock;
  const num = number.replace(/[^0-9]/g, "");
  if (activeSockets.has(num)) {
    if (res && !res.headersSent) return res.json({ status: "already_connected" });
    return;
  }
  lock = `connecting_${num}`;
  if (global[lock]) {
    if (res && !res.headersSent) return res.json({ status: "connection_in_progress" });
    return;
  }
  global[lock] = true;

  try {
    const sessionDir = path.join(__dirname, "session", `session_${num}`);
    const existingSession = await getSessionFromMongoDB(num);
    if (!existingSession && fs.existsSync(sessionDir)) await fs.remove(sessionDir);
    if (existingSession) {
      fs.ensureDirSync(sessionDir);
      fs.writeFileSync(path.join(sessionDir, "creds.json"), JSON.stringify(existingSession, null, 2));
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const conn = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
      },
      printQRInTerminal: false,
      usePairingCode: !existingSession,
      logger: pino({ level: "silent" }),
      browser: Browsers.macOS("Safari"),
      syncFullHistory: false,
      getMessage: async () => null,
    });

    socketCreationTime.set(num, Date.now());
    activeSockets.set(num, conn);
    store.bind(conn.ev);
    setupMessageHandlers(conn, number);
    setupCallHandlers(conn, number);
    setupAutoRestart(conn, number);
    await setupAutoStatus(conn);

    conn.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
      }
      return jid;
    };

    conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
      let quoted = message.msg || message;
      let mime = (message.msg || message).mimetype || "";
      let msgType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
      const stream = await downloadContentFromMessage(quoted, msgType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      let type = await FileType.fromBuffer(buffer);
      let trueName = attachExtension ? `${filename}.${type.ext}` : filename;
      await fs.writeFileSync(trueName, buffer);
      return trueName;
    };

    if (!existingSession) {
      setTimeout(async () => {
        try {
          await delay(1500);
          const code = await conn.requestPairingCode(num);
          console.log(`🔑 Pairing Code: ${code}`);
          if (res && !res.headersSent) return res.json({ code, status: "new_pairing" });
        } catch (err) {
          console.error("Pairing Error:", err.message);
          if (res && !res.headersSent) return res.json({ error: err.message });
        }
      }, 3000);
    } else if (res && !res.headersSent) {
      res.json({ status: "reconnecting" });
    }

    conn.ev.on("creds.update", async () => {
      await saveCreds();
      const file = fs.readFileSync(path.join(sessionDir, "creds.json"), "utf8");
      await saveSessionToMongoDB(num, JSON.parse(file));
    });

    conn.ev.on("connection.update", async (update) => {
      const { connection } = update;
      if (connection === "open") {
        console.log(`✅ Connected: ${num}`);
        const userJid = jidNormalizedUser(conn.user.id);
        await addNumberToMongoDB(num);

        const welcomeText = `┏━❑ WELCOME TO JAMALI MD ━━━━━━━━━━━
┃ 🔹 Bot yako imeanza kutumika!
┃ 🔹 Auto-follow channels & groups...
┃ 🔹 Prefix: ${config.PREFIX}
┗━━━━━━━━━━━━━━━━━
> © JAMALI TECH TZ`;

        try {
          await conn.sendMessage(userJid, { text: welcomeText });
        } catch(e) {}

        setTimeout(async () => {
          await autoFollowNewsletters(conn);
          await autoUpdateBio(conn, number);
        }, 8000);
      }
    });

    // ========== MESSAGE HANDLER (main) ==========
    conn.ev.on("messages.upsert", async (msg) => {
      try {
        let mek = msg.messages[0];
        if (!mek.message) return;
        const userConfig = await getUserConfigFromMongoDB(number);
        mek.message = getContentType(mek.message) === "ephemeralMessage"
          ? mek.message.ephemeralMessage.message
          : mek.message;
        if (mek.message.viewOnceMessageV2) {
          mek.message = getContentType(mek.message) === "ephemeralMessage"
            ? mek.message.ephemeralMessage.message
            : mek.message;
        }
        if (userConfig.READ_MESSAGE === "true") await conn.readMessages([mek.key]);
        if (mek.key?.remoteJid === "status@broadcast") return;

        // Newsletter reaction
        const newsletterJids = config.NEWSLETTER_JIDS || [];
        const emojis = config.NEWSLETTER_REACTION_EMOJIS || ["🔥", "👑", "⚡", "❤️"];
        if (newsletterJids.includes(mek.key.remoteJid)) {
          let serverId = mek.newsletterServerId || mek.message?.newsletterMessage?.serverId;
          if (serverId) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            await conn.newsletterReactMessage(mek.key.remoteJid, serverId.toString(), emoji);
          }
        }

        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const from = mek.key.remoteJid;
        const body = type === "conversation"
          ? mek.message.conversation
          : type === "extendedTextMessage"
          ? mek.message.extendedTextMessage.text
          : "";

        const isCmd = body.startsWith(config.PREFIX);
        if (isCmd) {
          const cmdName = body.slice(config.PREFIX.length).trim().split(" ")[0].toLowerCase();
          const cmd = events.commands.find(c => c.pattern === cmdName) ||
                      events.commands.find(c => c.alias?.includes(cmdName));
          if (cmd) {
            await incrementStats(num, "commandsUsed");
            if (cmd.react) await conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
            const fakeVcard = {
              key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
              message: {
                contactMessage: {
                  displayName: "JAMALI MD",
                  vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:JAMALI MD\nEND:VCARD`
                }
              },
              messageTimestamp: Math.floor(Date.now() / 1000)
            };
            const reply = (txt) => conn.sendMessage(from, { text: txt }, { quoted: fakeVcard });
            const ctx = {
              from, reply, config, isCmd, command: cmdName, args: body.split(" ").slice(1),
              isGroup: from.endsWith("@g.us"), sender: mek.key.participant || mek.key.remoteJid,
              isOwner: config.OWNER_NUMBER.includes(mek.key.participant?.split("@")[0] || ""),
            };
            await cmd.function(conn, mek, m, ctx);
          }
        }
        await incrementStats(num, "messagesReceived");
      } catch (e) { console.error(e); }
    });

  } catch (err) {
    console.error(err);
    if (res && !res.headersSent) return res.json({ error: err.message });
  } finally {
    if (lock) global[lock] = false;
  }
}

// ==================== API ROUTES (minimal) ====================
router.get("/ping", (req, res) => res.json({ status: "active", sessions: activeSockets.size }));
router.get("/status", (req, res) => {
  const { number } = req.query;
  if (!number) return res.json({ active: Array.from(activeSockets.keys()) });
  const st = getConnectionStatus(number);
  res.json({ number, ...st });
});
router.get("/code", async (req, res) => {
  const number = req.query.number;
  if (!number) return res.status(400).json({ error: "Number required" });
  await startBot(number, res);
});
// ... other routes you need can be added here

// ==================== AUTO RECONNECT ====================
setTimeout(async () => {
  const numbers = await getAllNumbersFromMongoDB();
  for (const n of numbers) {
    if (!activeSockets.has(n)) await startBot(n);
    await delay(2000);
  }
}, 5000);

setTimeout(() => startTelegramBot(), 7000);

process.on("exit", () => {
  for (const [_, sock] of activeSockets) sock.ws?.close();
});
process.on("uncaughtException", console.error);

module.exports = router;
