const { cmd } = require('../momy');
const config = require('../config');
const axios = require("axios");

// Command TikTok - Simple HD Video Download
cmd({
    pattern: "tiktok",
    alias: ["tt", "tiktokdl", "tiktokvideo", "tiktoknowm"],
    desc: "Download TikTok video without watermark",
    category: "download",
    react: "🎵"
},
async(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply, myquoted }) => {
    try {
        // Check if TikTok link is provided
        if (!q) {
            return reply(`❌ *Please provide a TikTok video link*\n\nUsage: ${config.PREFIX}tiktok *TikTok URL*`);
        }

        // Validate URL
        if (!q.includes('tiktok.com')) {
            return reply('❌ *Please provide a valid TikTok video link*');
        }

        // Send typing indicator
        await conn.sendPresenceUpdate('composing', from);
        
        // Random reaction for style
        const reactions = ['🎵', '🎬', '⬇️', '📱', '🎥', '⚡', '🔥'];
        const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
        
        await conn.sendMessage(from, {
            react: { text: randomReact, key: mek.key }
        });

        // Clean URL
        const tiktokUrl = q.trim();

        // API request
        const apiUrl = `https://api.bk9.dev/download/tiktok3?url=${encodeURIComponent(tiktokUrl)}`;
        const response = await axios.get(apiUrl);
        
        if (!response.data || !response.data.status) {
            return reply(`❌ *Failed to fetch video*\nReason: ${response.data?.message || 'Invalid URL or video not found'}`);
        }

        const tiktokData = response.data.BK9;
        
        // Get the best quality video (HD No Watermark)
        const videoFormat = tiktokData.formats.find(f => f.quality === 'hd_no_watermark') || 
                           tiktokData.formats.find(f => f.quality === 'no_watermark') ||
                           tiktokData.formats[0];
        
        const videoUrl = videoFormat.url;
        const quality = videoFormat.quality === 'hd_no_watermark' ? 'HD' : 'SD';
        const title = tiktokData.title || 'TikTok Video';
        const author = tiktokData.author || 'Unknown';

        // Send video with styled caption
        await conn.sendMessage(from, { 
            video: { url: videoUrl },
            caption: `╭━━【 JAMALI MD 】━━━━━━━━╮
│ *TikTok Video*
│ *Quality:* ${quality} (No Watermark)
│ *Author:* @${author}
│ *Title:* ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}
╰━━━━━━━━━━━━━━━━━━━━╯

${config.BOT_FOOTER || '> 🔥 Powered by JAMALI TECH TZ'}`
        }, { quoted: myquoted });

        // Final reaction
        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

    } catch (e) {
        console.error('TikTok Command Error:', e);
        
        let errorMessage = e.message;
        if (e.response?.status === 404) {
            errorMessage = "Video not found. Make sure the URL is correct.";
        } else if (e.code === 'ECONNREFUSED') {
            errorMessage = "Connection to API server failed.";
        }

        reply(`❌ *Failed to download video*\nError: ${errorMessage}`);
    }
});
