const { cmd } = require('../momy');
const axios = require('axios');

const REPO_IMAGE = 'https://files.catbox.moe/0e3rok.jpg';
const REPO_LINK = 'https://jamalimdfree-8dca5161caab.herokuapp.com/pair';

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

// Utility function for formatted messages
function jamaliMessage(text) {
  return {
    text: text,
    contextInfo: {
      externalAdReply: {
        title: 'JAMALI MD',
        body: 'GitHub Repository ‧ Verified',
        thumbnailUrl: REPO_IMAGE,
        sourceUrl: REPO_LINK,
        mediaUrl: REPO_IMAGE,
        renderLargerThumbnail: true,
        mediaType: 1
      },
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363425061263455@newsletter',
        newsletterName: 'JAMALI MD',
        serverMessageId: Math.floor(Math.random() * 1000000)
      },
      isForwarded: true,
      forwardingScore: 999
    }
  };
}

cmd({
    pattern: "repo",
    alias: ["repository", "github"],
    desc: "Get bot repository link",
    category: "main",
    react: "📦",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        // Fetch GitHub stats
        let stars = '⭐';
        let forks = '🔀';
        
        try {
            const response = await axios.get('https://api.github.com/repos/jamalitechempire/jamali-bot');
            stars = response.data.stargazers_count || '⭐';
            forks = response.data.forks_count || '🔀';
        } catch (err) {
            console.log('Could not fetch GitHub stats');
        }
        
        const repoMessage = 
`┏━❑ JAMALI MD PAIR SITE ━━━━━━━━━
┃ 📦 PAIR DASBOARD BOT: https://jamalimdfree-8dca5161caab.herokuapp.com/
┃ 👨‍💻 Developer: JAMALI TECH TZ
┃ 🔗 Link: ${REPO_LINK}
┃
┃ ⭐ pair: ${stars}
┃ 🔀 njoy: ${forks}
┃
┃ 🛠️ Open Source WhatsApp Bot
┃ 💚 Made with ❤️ by JAMALI TECH TZ
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`;

        const messageData = jamaliMessage(repoMessage);
        
        await conn.sendMessage(from, messageData, { quoted: fakevCard });
        
    } catch (e) {
        reply("❌ Error: " + e.message);
    }
});
