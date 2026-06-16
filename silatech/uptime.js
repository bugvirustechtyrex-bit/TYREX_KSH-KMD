const config = require('../config');
const { cmd } = require('../momy');
const os = require('os');

cmd({
  pattern: "uptime",
  alias: ["runtime", "status", "host"],
  desc: "Check bot status and real hosting platform",
  category: "main",
  react: "👑",
  filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {

  try {
    // Uptime Calculation
    const getUptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let mn = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}H ${mn}M ${s}S`;
    };

    // Real Host Detection Logic
    let platform = "LINUX VPS / PANEL";
    if (process.env.HEROKU_APP_NAME) platform = "HEROKU CLOUD";
    else if (process.env.KOYEB_PROJECT_ID) platform = "KOYEB PAAS";
    else if (process.env.RENDER_SERVICE_ID) platform = "RENDER CLOUD";
    else if (process.env.REPL_ID) platform = "REPLIT";
    
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

    let status = `╭━━━〔 *UPTIME* 〕━━━┈⊷
┃
┃ 👑 *STATUS:* ONLINE
┃ 👑 *UPTIME:* ${getUptime()}
┃ 👑 *HOST:* ${platform.toUpperCase()}
┃ 👑 *RAM:* ${ram}MB / ${totalRam}GB
┃ 👑 *PLATFORM:* ${os.platform().toUpperCase()}
┃
╰━━━━━━━━━━━━━━━┈⊷

*POWERED BY JAMALI MD* 👑`;

    await conn.sendMessage(from, {
      image: { url: config.IMAGE_PATH || 'https://files.catbox.moe/0e3rok.jpg' },
      caption: status,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363425061263455@newsletter',
          newsletterName: 'JAMALI MD',
          serverMessageId: 143
        }
      }
    }, { quoted: m });

  } catch (e) {
    reply(`❌ ERROR: ${e.message.toUpperCase()}`);
  }

});
