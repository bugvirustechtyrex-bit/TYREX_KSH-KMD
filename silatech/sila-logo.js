// JAMALI MD - Text Effects Maker (ephoto360)

const { cmd, commands } = require('../momy');
const mumaker = require('mumaker');

// Define combined fakevCard (JAMALI MD)
const fakevCard = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "© JAMALI MD",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:JAMALI MD BOT\nORG:JAMALI TECH TZ;\nTEL;type=CELL;type=VOICE;waid=255784062158:+255784062158\nEND:VCARD`
    }
  }
};

const getContextInfo = (sender) => {
    return {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425061263455@newsletter',
            newsletterName: 'JAMALI MD',
            serverMessageId: 143,
        },
    };
};

const textEffects = {
    'metallic': 'https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html',
    'ice': 'https://en.ephoto360.com/ice-text-effect-online-101.html',
    'snow': 'https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html',
    'impressive': 'https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html',
    'matrix': 'https://en.ephoto360.com/matrix-text-effect-154.html',
    'light': 'https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html',
    'neon': 'https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html',
    'devil': 'https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html',
    'purple': 'https://en.ephoto360.com/purple-text-effect-online-100.html',
    'thunder': 'https://en.ephoto360.com/thunder-text-effect-online-97.html',
    'leaves': 'https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html',
    '1917': 'https://en.ephoto360.com/1917-style-text-effect-523.html',
    'arena': 'https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html',
    'hacker': 'https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html',
    'sand': 'https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html',
    'blackpink': 'https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html',
    'glitch': 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    'fire': 'https://en.ephoto360.com/flame-lettering-effect-372.html'
};

const textCommands = Object.keys(textEffects);

textCommands.forEach(effect => {
    cmd({
        pattern: effect,
        desc: `Create ${effect} text effect`,
        category: "textmaker",
        react: "✨",
        filename: __filename
    },
    async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
    try{
        if (!q) {
            return await conn.sendMessage(from, {
                text: `❌ Please provide text\nExample: .${effect} JAMALI`,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });
        }
        
        await conn.sendMessage(from, {
            text: `⏳ Creating ${effect} text...`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
        
        const result = await mumaker.ephoto(textEffects[effect], q);
        
        if (!result || !result.image) {
            return await conn.sendMessage(from, {
                text: `❌ Failed to create ${effect} text`,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });
        }
        
        await conn.sendMessage(
            from,
            {
                image: { url: result.image },
                caption: `┏━❑ TEXT EFFECT ━━━━━━━━━━━━━━━
┃ ✨ Effect: ${effect}
┃ 🔤 Text: ${q}
┗━━━━━━━━━━━━━━━━━━━━━━━━\n\n> 🔥 Powered by JAMALI TECH TZ`,
                contextInfo: getContextInfo(sender)
            },
            { quoted: fakevCard }
        );
        
    } catch (e) {
        await conn.sendMessage(from, {
            text: `❌ Failed to create ${effect} text`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
        l(e);
    }
    });
});

// List all text effects
cmd({
    pattern: "textmaker",
    alias: ["textfx", "textlist"],
    desc: "List all text effects",
    category: "textmaker",
    react: "📝",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    const effectsList = textCommands.map(effect => `• ${prefix}${effect} <text>`).join('\n');
    
    await conn.sendMessage(from, {
        text: `┏━❑ TEXT EFFECTS ━━━━━━━━━━━━━━━
┃ 📝 Available text effects:
┃ ━━━━━━━━━━━━━━━━━━━━━━
${effectsList}
┃ ━━━━━━━━━━━━━━━━━━━━━━
┃ Example: .metallic JAMALI
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    l(e);
}
});
