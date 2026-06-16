const { cmd } = require('../momy');
const axios = require('axios');
const yts = require('yt-search');

const VIDEO_IMAGE = 'https://files.catbox.moe/36vahk.png';

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

cmd({
    pattern: "video",
    alias: ["ytmp4", "mp4", "ytv", "jamalivideo"],
    desc: "Download videos from YouTube",
    category: "downloader",
    react: "🎥",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, q }) => {
    try {
        if (!q) {
            return reply(`┏━❑ JAMALI MD VIDEO DOWNLOADER ━━━━━━━━━
┃ 🎥 DO YOU WANT TO DOWNLOAD VIDEO 🥺
┃
┃ TYPE: .video YOUR VIDEO NAME
┃
┃ Example:
┃ .video Cristiano Ronaldo Goal
┗━━━━━━━━━━━━━━━━━━━━`);
        }

        const search = await yts(q);
        if (!search.videos.length) {
            return reply(`┏━❑ JAMALI MD VIDEO SEARCH ━━━━━━━━━
┃ ❌ Can't Find Any Video
┃ 😭 SORRY 🥺❤️
┗━━━━━━━━━━━━━━━━━━━━`);
        }

        const data = search.videos[0];
        const ytUrl = data.url;

        const api = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=APIKEY&url=${encodeURIComponent(ytUrl)}`;
        const { data: apiRes } = await axios.get(api);

        if (!apiRes?.status || !apiRes.result?.media?.video_url) {
            return reply(`┏━❑ JAMALI MD VIDEO ERROR ━━━━━━━━━
┃ ❌ Video Download Failed
┃ 🥺 Please Try Again ☺️
┗━━━━━━━━━━━━━━━━━━━━`);
        }

        const result = apiRes.result.media;
        const caption = `┏━❑ JAMALI MD VIDEO PLAYER ━━━━━━━━━
┃ 🎬 Title: ${data.title}
┃
┃ 🔗 Link: ${data.url}
┃ 👀 Views: ${data.views}
┃ ⏱️ Time: ${data.timestamp}
┃
┃ 📝 CHOOSE YOUR VERSION:
┃ 
┃ ❮1❯ SIMPLE VIDEO
┃ ❮2❯ FILE VIDEO
┗━━━━━━━━━━━━━━━━━━━━`;

        const sentMsg = await conn.sendMessage(from, { 
            image: { url: result.thumbnail }, 
            caption: caption 
        }, { quoted: fakevCard });
        
        const messageID = sentMsg.key.id;

        // Store handler for this specific message
        const messageHandler = async (msgData) => {
            if (!msgData.messages) return;
            
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
            const senderID = receivedMsg.key.remoteJid;

            if (isReplyToBot && senderID === from) {
                const choice = receivedText.trim();
                
                try {
                    if (choice === "1") {
                        // Send as simple video
                        await conn.sendMessage(senderID, { 
                            video: { url: result.video_url }, 
                            mimetype: "video/mp4",
                            caption: `*Video: ${data.title}*\n\n*Downloaded by JAMALI MD*`
                        }, { quoted: fakevCard });
                    } else if (choice === "2") {
                        // Send as document
                        await conn.sendMessage(senderID, { 
                            document: { url: result.video_url }, 
                            mimetype: "video/mp4", 
                            fileName: `${data.title}.mp4`,
                            caption: `*Video: ${data.title}*\n\n*Downloaded by JAMALI MD*`
                        }, { quoted: fakevCard });
                    } else {
                        await conn.sendMessage(senderID, { 
                            text: `┏━❑ JAMALI MD SELECTION ━━━━━━━━━
┃ ❌ Please Reply With ❮1❯ or ❮2❯
┗━━━━━━━━━━━━━━━━━━━━` 
                        }, { quoted: fakevCard });
                    }
                } catch (err) {
                    console.error("Video send error:", err.message);
                    await conn.sendMessage(senderID, { 
                        text: `┏━❑ JAMALI MD SEND ERROR ━━━━━━━━━
┃ ❌ Failed to send video 📹
┗━━━━━━━━━━━━━━━━━━━━` 
                    }, { quoted: fakevCard });
                }
                
                // Remove listener
                conn.ev.off('messages.upsert', messageHandler);
            }
        };

        // Add listener
        conn.ev.on('messages.upsert', messageHandler);
        
        // Auto remove after 60 seconds
        setTimeout(() => {
            conn.ev.off('messages.upsert', messageHandler);
        }, 60000);

    } catch (error) {
        console.error('Video Error:', error.message);
        reply(`┏━❑ JAMALI MD DOWNLOAD FAILED ━━━━━━━━━
┃ 😔 Video download failed!
┗━━━━━━━━━━━━━━━━━━━━`);
    }
});
