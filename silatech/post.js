const { cmd } = require('../momy');
const config = require('../config');

// Command To Status - Works in groups too
cmd({
    pattern: "tostatus",
    alias: ["gstatus", "status", "story", "uploadstory", "sendstatus"],
    desc: "Send message/image/video to WhatsApp Status",
    category: "general",
    react: "📢"
},
async(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply, myquoted }) => {
    try {
        // Check if there's content to post
        if (!q && !quoted) {
            return reply(`❌ *Please provide content to post on status*\n\nUsage:\n${config.PREFIX}tostatus *text message*\nOr reply to image/video with ${config.PREFIX}tostatus`);
        }

        // Send typing indicator
        await conn.sendPresenceUpdate('composing', from);
        
        // Reaction
        await conn.sendMessage(from, {
            react: { text: "📤", key: mek.key }
        });

        // Prepare status options
        const statusOptions = {
            backgroundColor: "#000000",
            font: 0
        };

        // Case 1: Replying to media (image/video)
        if (quoted) {
            const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (quotedMsg?.imageMessage) {
                // Handle image
                const imageUrl = await conn.downloadAndSaveMediaMessage(quoted);
                await conn.sendMessage("status@broadcast", {
                    image: { url: imageUrl },
                    caption: q || `Posted by: @${senderNumber}`,
                    mentions: [sender],
                    backgroundColor: statusOptions.backgroundColor,
                    font: statusOptions.font
                });
                
                reply(`✅ *Image posted to status successfully*\n\n> 🔥 Powered by JAMALI TECH TZ`);
                
            } else if (quotedMsg?.videoMessage) {
                // Handle video
                const videoUrl = await conn.downloadAndSaveMediaMessage(quoted);
                await conn.sendMessage("status@broadcast", {
                    video: { url: videoUrl },
                    caption: q || `Posted by: @${senderNumber}`,
                    mentions: [sender],
                    backgroundColor: statusOptions.backgroundColor
                });
                
                reply(`✅ *Video posted to status successfully*\n\n> 🔥 Powered by JAMALI TECH TZ`);
                
            } else if (quotedMsg?.audioMessage || quotedMsg?.ptvMessage) {
                // Handle audio/voice
                const audioUrl = await conn.downloadAndSaveMediaMessage(quoted);
                await conn.sendMessage("status@broadcast", {
                    audio: { url: audioUrl },
                    mimetype: "audio/mpeg",
                    ptt: quotedMsg?.ptvMessage ? true : false,
                    caption: q || `Posted by: @${senderNumber}`,
                    mentions: [sender]
                });
                
                reply(`✅ *Audio posted to status successfully*\n\n> 🔥 Powered by JAMALI TECH TZ`);
                
            } else {
                reply(`❌ *Unsupported media type*\n\n> 🔥 Powered by JAMALI TECH TZ`);
            }
            
        // Case 2: Just text status
        } else if (q) {
            await conn.sendMessage("status@broadcast", {
                text: q,
                backgroundColor: statusOptions.backgroundColor,
                font: statusOptions.font
            });
            
            reply(`✅ *Text posted to status successfully*\n\n> 🔥 Powered by JAMALI TECH TZ`);
        }

        // Final reaction
        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

    } catch (e) {
        console.error('Status Command Error:', e);
        reply(`❌ *Failed to post to status*\nError: ${e.message}\n\n> 🔥 Powered by JAMALI TECH TZ`);
    }
});
