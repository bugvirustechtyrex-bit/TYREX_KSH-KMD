const { cmd } = require('../momy');
const config = require('../config');
const { igdl } = require("ruhend-scraper");

// Command Instagram - Simple Media Download
cmd({
    pattern: "ig",
    alias: ["insta", "instagram", "reels", "igdl"],
    desc: "Download Instagram video/reel/image",
    category: "download",
    react: "📸"
},
async(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply, myquoted }) => {
    try {
        // Check if Instagram link is provided
        if (!q) {
            return reply(`❌ *Please provide an Instagram link*\n\nUsage: ${config.PREFIX}ig *Instagram URL*`);
        }

        // Validate URL
        if (!q.includes("instagram.com") && !q.includes("instagr.am")) {
            return reply('❌ *Please provide a valid Instagram link*');
        }

        // Send typing indicator
        await conn.sendPresenceUpdate('composing', from);
        
        // Random reaction for style
        const reactions = ['📸', '📹', '⬇️', '🔽', '✨', '⚡', '🔥'];
        const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
        
        await conn.sendMessage(from, {
            react: { text: randomReact, key: mek.key }
        });

        // Fetch media
        const downloadData = await igdl(q);
        
        if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
            return reply('❌ *No media found. Make sure the link is public*');
        }

        // Get the first media only (simplified)
        const media = downloadData.data[0];
        
        // Determine if it's video or image
        const isVideo = /\.(mp4|mov|avi|mkv|webm)/i.test(media.url) || 
                       media.type === 'video' || 
                       q.includes('/reel/') || 
                       q.includes('/tv/');

        // Send media with styled caption
        const mediaType = isVideo ? "video" : "image";
        const caption = `╭━━【 JAMALI MD 】━━━━━━━━╮
│ *Instagram ${isVideo ? 'video' : 'image'}*
│ *Downloaded: ✓*
╰━━━━━━━━━━━━━━━━━━━━╯

${config.BOT_FOOTER || '> 🔥 Powered by JAMALI TECH TZ'}`;

        await conn.sendMessage(from, {
            [mediaType]: { url: media.url },
            caption: caption,
            mimetype: isVideo ? "video/mp4" : undefined
        }, { quoted: myquoted });

        // Final reaction
        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

    } catch (e) {
        console.error('Instagram Command Error:', e);
        reply(`❌ *Failed to download media*\nError: ${e.message}`);
    }
});
