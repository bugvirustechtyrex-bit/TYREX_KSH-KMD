const { cmd } = require('../momy');
const config = require('../config');
const axios = require('axios');
const yts = require('yt-search');

// Command Song - Simplified Version
cmd({
    pattern: "song",
    alias: ["mp3", "play", "music", "ytaudio", "ytmp3", "audio", "download"],
    desc: "Download song from YouTube",
    category: "download",
    react: "🎵"
},
async(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply, myquoted }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, { 
                text: `✳️ *Usage:* ${config.PREFIX}song *song name or YouTube link*` 
            }, { quoted: myquoted });
        }

        // Search for the song
        let videoData = null;
        
        if (q.includes('youtube.com') || q.includes('youtu.be')) {
            // Direct URL
            const videoId = q.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (!videoId) {
                return reply('❌ Invalid YouTube link');
            }
            const search = await yts({ videoId: videoId });
            if (search) videoData = search;
        } else {
            // Search query
            const search = await yts(q);
            if (!search || !search.all || search.all.length === 0) {
                return reply(`❌ No results found for "${q}"`);
            }
            videoData = search.all[0];
        }

        if (!videoData) {
            return reply('❌ Could not get video information');
        }

        const videoUrl = videoData.url;
        const title = videoData.title || 'Unknown Title';
        const thumbnail = videoData.thumbnail || videoData.image;

        // Try to download audio
        try {
            // Using the working API
            const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });
            
            if (response.data?.status && response.data.audio) {
                // Send combined message with image and audio
                await conn.sendMessage(from, { 
                    image: { url: thumbnail },
                    caption: `╭━━【 JAMALI MD 】━━━━━━━━╮
│ *Song:* ${title}
╰━━━━━━━━━━━━━━━━━━━━╯

${config.BOT_FOOTER || '> 🔥 Powered by JAMALI TECH TZ'}`,
                    audio: { url: response.data.audio },
                    mimetype: "audio/mpeg"
                }, { quoted: myquoted });
            } else {
                reply('❌ Failed to download audio');
            }
        } catch (error) {
            console.error('Download error:', error);
            reply(`❌ Download failed: ${error.message}`);
        }

    } catch (e) {
        console.log(e);
        reply(`❌ error: ${e.message}`);
    }
});
