const { cmd } = require('../momy');
const config = require('../config');

// Command To Status - Group compatible
cmd({
    pattern: "tostatus2",
    alias: ["gstatus2", "status2", "story2"],
    desc: "Post to WhatsApp Status (works in groups)",
    category: "general",
    react: "📢"
},
async(conn, mek, m, { from, quoted, q, reply, myquoted, sender, senderNumber }) => {
    try {
        // Check content
        if (!q && !quoted) {
            return reply(`❌ *Usage:*\n${config.PREFIX}tostatus *text*\nOr reply to image/video\n\n> 🔥 Powered by JAMALI TECH TZ`);
        }

        // Reaction
        await conn.sendMessage(from, { react: { text: "📤", key: mek.key } });

        // Handle media reply
        if (quoted) {
            const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (quotedMsg?.imageMessage) {
                const media = await conn.downloadAndSaveMediaMessage(quoted);
                await conn.sendMessage("status@broadcast", { 
                    image: { url: media }, 
                    caption: q || `Posted by: @${senderNumber}`,
                    mentions: [sender]
                });
                reply(`✅ *Image posted to status*\n\n> 🔥 Powered by JAMALI TECH TZ`);
                
            } else if (quotedMsg?.videoMessage) {
                const media = await conn.downloadAndSaveMediaMessage(quoted);
                await conn.sendMessage("status@broadcast", { 
                    video: { url: media }, 
                    caption: q || `Posted by: @${senderNumber}`,
                    mentions: [sender]
                });
                reply(`✅ *Video posted to status*\n\n> 🔥 Powered by JAMALI TECH TZ`);
                
            } else {
                reply(`❌ *Unsupported media*\n\n> 🔥 Powered by JAMALI TECH TZ`);
            }
        } 
        // Handle text
        else if (q) {
            await conn.sendMessage("status@broadcast", { text: q });
            reply(`✅ *Text posted to status*\n\n> 🔥 Powered by JAMALI TECH TZ`);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        reply(`❌ *Error:* ${e.message}\n\n> 🔥 Powered by JAMALI TECH TZ`);
    }
});
