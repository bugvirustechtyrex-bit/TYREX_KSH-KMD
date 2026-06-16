const { cmd } = require('../momy');
const config = require('../config');
const getFBInfo = require("@xaviabot/fb-downloader");

// Command Facebook - Simple HD Video Download
cmd({
    pattern: "fb",
    alias: ["facebook", "fbdl", "fbvideo"],
    desc: "Download Facebook video in HD",
    category: "download",
    react: "📽️"
},
async(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply, myquoted }) => {
    try {
        // Check if Facebook link is provided
        if (!q) {
            return reply(`❌ *Please provide a Facebook video link*\n\nUsage: ${config.PREFIX}fb *Facebook URL*`);
        }

        // Validate URL
        if (!q.includes("facebook.com") && !q.includes("fb.watch")) {
            return reply('❌ *Please provide a valid Facebook video link*');
        }

        // Send typing indicator
        await conn.sendPresenceUpdate('composing', from);
        
        // Random reaction for style
        const reactions = ['📽️', '🎬', '⬇️', '🔽', '⚡', '🔥'];
        const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
        
        await conn.sendMessage(from, {
            react: { text: randomReact, key: mek.key }
        });

        // Fetch video info
        const videoData = await getFBInfo(q);

        if (!videoData || !videoData.sd) {
            return reply('❌ *Failed to fetch video. The link might be private or invalid*');
        }

        // Use HD if available, otherwise use SD
        const videoUrl = videoData.hd || videoData.sd;
        const videoQuality = videoData.hd ? 'HD' : 'SD';
        const title = videoData.title || 'Facebook Video';

        // Send video directly with styled caption
        await conn.sendMessage(from, { 
            video: { url: videoUrl },
            caption: `╭━━【 JAMALI MD 】━━━━━━━━╮
│ *Facebook video*
│ *Quality:* ${videoQuality}
│ *Title:* ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}
╰━━━━━━━━━━━━━━━━━━━━╯

${config.BOT_FOOTER || '> 🔥 Powered by JAMALI TECH TZ'}`
        }, { quoted: myquoted });

    } catch (error) {
        console.error('FB Command Error:', error);
        reply(`❌ *Failed to download video*\nError: ${error.message}`);
    }
});
