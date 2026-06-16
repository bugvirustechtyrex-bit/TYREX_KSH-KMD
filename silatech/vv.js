const { cmd } = require('../momy');
const config = require('../config');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Command View Once - Reveal view-once media
cmd({
    pattern: "vv",
    alias: ["viewonce", "reveal", "vo"],
    desc: "Reveal view-once image or video",
    category: "tools",
    react: "👁️"
},
async(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply, myquoted }) => {
    try {
        // Check if there's a quoted message
        if (!mek.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            return reply(`❌ *Reply to a view-once image or video*\n\nUsage: ${config.PREFIX}vv *reply to view-once media*`);
        }

        const quotedMsg = mek.message.extendedTextMessage.contextInfo.quotedMessage;
        
        // Handle view-once wrapper
        const viewOnceMsg = quotedMsg.viewOnceMessageV2 || quotedMsg.viewOnceMessage || null;
        
        const mediaMessage = viewOnceMsg?.message?.imageMessage ||
            viewOnceMsg?.message?.videoMessage ||
            quotedMsg.imageMessage ||
            quotedMsg.videoMessage;

        if (!mediaMessage) {
            return reply('❌ *Unsupported message type*\n\nPlease reply to a view-once image or video');
        }

        // Check if it's actually a view-once media
        if (!mediaMessage.viewOnce) {
            return reply('❌ *This is not a view-once media*');
        }

        const isImage = !!mediaMessage.imageMessage || mediaMessage.mimetype?.startsWith("image");
        const isVideo = !!mediaMessage.videoMessage || mediaMessage.mimetype?.startsWith("video");

        // Random reaction for style
        const reactions = ['👁️', '🔓', '📸', '🎥', '✨', '⚡', '🔥'];
        const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
        
        await conn.sendMessage(from, {
            react: { text: randomReact, key: mek.key }
        });

        // Download the media
        const stream = await downloadContentFromMessage(
            mediaMessage,
            isImage ? "image" : "video"
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Send the revealed media with styled caption
        const mediaType = isImage ? "image" : "video";
        const caption = `╭━━【 JAMALI MD BOT 】━━━━━━━━╮
│ *view-once revealed*
│ *type:* ${isImage ? '🖼️ image' : '🎥 video'}
╰━━━━━━━━━━━━━━━━━━━━╯

${config.BOT_FOOTER || '> 🔥 Powered by JAMALI TECH TZ'}`;

        await conn.sendMessage(from, {
            [mediaType]: buffer,
            caption: caption,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: myquoted });

    } catch (e) {
        console.error('VV Command Error:', e);
        reply(`❌ *Failed to reveal view-once media*\nError: ${e.message}`);
    }
});
