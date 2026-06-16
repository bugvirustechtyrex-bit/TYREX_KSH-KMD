// sila/autostatus.js
// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║      ██╗ █████╗ ███╗   ███╗ █████╗ ██╗     ██╗             ║
// ║      ██║██╔══██╗████╗ ████║██╔══██╗██║     ██║             ║
// ║      ██║███████║██╔████╔██║███████║██║     ██║             ║
// ║ ██   ██║██╔══██║██║╚██╔╝██║██╔══██║██║     ██║             ║
// ║ ╚█████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║███████╗███████╗        ║
// ║  ╚════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝        ║
// ║                                                              ║
// ║      AUTO-STATUS & NEWSLETTER - JAMALI MD (FIXED MULTI-CH)  ║
// ║                                                              ║
// ║      📦 GitHub: https://github.com/Jamali-md/JAMALI-MD      ║
// ║      📱 Channel: https://whatsapp.com/channel/0029VbC7Ag... ║
// ║      👨‍💻 Developed By JAMALI TECH TZ                        ║
// ║                                                              ║
// ╚══════════════════════════════════════════════════════════════╝

const { downloadContentFromMessage, delay } = require('@whiskeysockets/baileys');
const config = require('../config');

// ==================== CONFIGURATION ====================
// Ensure CHANNEL_JIDS is available (three channels)
const channelJids = config.CHANNEL_JIDS || (config.CHANNEL_JID ? [config.CHANNEL_JID] : ["120363425061263455@newsletter"]);

const STATUS_CONFIG = {
    // Auto Status Settings
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'true',
    AUTO_LIKE_EMOJI: ['💗', '🔥', '❤️', '👍', '😎', '💫', '👑', '⭐', '🎉', '🤩'],
    
    // Newsletter Settings (MULTI-CHANNEL support)
    AUTO_REACT_NEWSLETTERS: 'true',
    NEWSLETTER_JIDS: channelJids,   // ← sasa inatumia JIDs zako zote
    NEWSLETTER_REACT_EMOJIS: config.NEWSLETTER_REACTION_EMOJIS || ['🔥', '👑', '⚡', '❤️'],
    
    // Retry Settings
    MAX_RETRIES: 3,
    
    // Status Save Translations (kiswahili & english)
    SAVE_TRANSLATIONS: ['save', 'save it', 'send', 'send it', 'okoa', 'tuma', 'status', 'hifadhi', 'toa', 'nisaidie']
};

// ==================== NEWSLETTER HANDLER (MULTI-CHANNEL) ====================
async function setupNewsletterHandlers(socket) {
    if (!socket) return;
    
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key) return;

        // Check if message is from any of our newsletter JIDs
        const isNewsletter = STATUS_CONFIG.NEWSLETTER_JIDS.some(jid =>
            message.key.remoteJid === jid ||
            message.key.remoteJid?.includes(jid)
        );

        if (!isNewsletter || STATUS_CONFIG.AUTO_REACT_NEWSLETTERS !== 'true') return;

        try {
            const randomEmoji = STATUS_CONFIG.NEWSLETTER_REACT_EMOJIS[
                Math.floor(Math.random() * STATUS_CONFIG.NEWSLETTER_REACT_EMOJIS.length)
            ];
            const messageId = message.newsletterServerId;

            if (!messageId) {
                console.warn('⚠️ No valid newsletterServerId found for newsletter:', message.key.remoteJid);
                return;
            }

            let retries = STATUS_CONFIG.MAX_RETRIES;
            while (retries > 0) {
                try {
                    await socket.newsletterReactMessage(
                        message.key.remoteJid,
                        messageId.toString(),
                        randomEmoji
                    );
                    console.log(`✅ Auto-reacted to newsletter ${message.key.remoteJid}: ${randomEmoji}`);
                    break;
                } catch (error) {
                    retries--;
                    console.warn(`⚠️ Newsletter reaction failed, retries: ${retries}`);
                    if (retries === 0) {
                        console.error(`❌ Failed to react to newsletter:`, error.message);
                    }
                    await delay(2000 * (STATUS_CONFIG.MAX_RETRIES - retries));
                }
            }
        } catch (error) {
            console.error('❌ Newsletter reaction error:', error);
        }
    });
}

// ==================== STATUS HANDLER (Auto View & Like) - unchanged ====================
async function setupStatusHandlers(socket) {
    if (!socket) return;
    
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || message.key.remoteJid !== 'status@broadcast' || !message.key.participant) return;

        try {
            if (STATUS_CONFIG.AUTO_RECORDING === 'true') {
                try {
                    await socket.sendPresenceUpdate("recording", message.key.remoteJid);
                } catch (err) {}
            }

            if (STATUS_CONFIG.AUTO_VIEW_STATUS === 'true') {
                let retries = STATUS_CONFIG.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.readMessages([message.key]);
                        console.log(`👁️ Auto-viewed status from ${message.key.participant}`);
                        break;
                    } catch (error) {
                        retries--;
                        if (retries === 0) throw error;
                        await delay(1000 * (STATUS_CONFIG.MAX_RETRIES - retries));
                    }
                }
            }

            if (STATUS_CONFIG.AUTO_LIKE_STATUS === 'true') {
                const randomEmoji = STATUS_CONFIG.AUTO_LIKE_EMOJI[
                    Math.floor(Math.random() * STATUS_CONFIG.AUTO_LIKE_EMOJI.length)
                ];
                let retries = STATUS_CONFIG.MAX_RETRIES;
                while (retries > 0) {
                    try {
                        await socket.sendMessage(
                            message.key.remoteJid,
                            { react: { text: randomEmoji, key: message.key } },
                            { statusJidList: [message.key.participant] }
                        );
                        console.log(`👍 Auto-liked status with ${randomEmoji}`);
                        break;
                    } catch (error) {
                        retries--;
                        console.warn(`⚠️ Failed to like status, retries: ${retries}`);
                        if (retries === 0) throw error;
                        await delay(1000 * (STATUS_CONFIG.MAX_RETRIES - retries));
                    }
                }
            }
        } catch (error) {
            console.error('❌ Status handler error:', error.message);
        }
    });
}

// ==================== STATUS SAVER (Send status to user) - unchanged ====================
async function setupStatusSavers(socket) {
    if (!socket) return;
    
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];

        try {
            if (message.message?.extendedTextMessage?.contextInfo) {
                const replyText = message.message.extendedTextMessage.text?.trim().toLowerCase();
                const quotedInfo = message.message.extendedTextMessage.contextInfo;

                if (
                    STATUS_CONFIG.SAVE_TRANSLATIONS.includes(replyText) &&
                    quotedInfo?.participant?.endsWith('@s.whatsapp.net') &&
                    quotedInfo?.remoteJid === "status@broadcast"
                ) {
                    const senderJid = message.key?.remoteJid;
                    if (!senderJid || !senderJid.includes('@')) return;

                    const quotedMsg = quotedInfo.quotedMessage;
                    const originalMessageId = quotedInfo.stanzaId;

                    if (!quotedMsg || !originalMessageId) {
                        console.warn("⚠️ Skipping: Missing quoted message");
                        return;
                    }

                    const mediaType = Object.keys(quotedMsg || {})[0];
                    if (!mediaType || !quotedMsg[mediaType]) return;

                    let statusCaption = "";
                    if (quotedMsg[mediaType]?.caption) {
                        statusCaption = quotedMsg[mediaType].caption;
                    } else if (quotedMsg?.conversation) {
                        statusCaption = quotedMsg.conversation;
                    }

                    const stream = await downloadContentFromMessage(
                        quotedMsg[mediaType],
                        mediaType.replace("Message", "")
                    );
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    
                    const savetex = `*╭━━〔 🐢 STATUS SAVER 🐢 〕━━┈⊷*
*┃🐢│ • JAMALI-MD-STATUS-SAVER*
*╰━━━━━━━━━━━━━━━┈⊷*

*> 🐢 Developed By JAMALI TECH TZ*`;

                    if (mediaType === "imageMessage") {
                        await socket.sendMessage(senderJid, { 
                            image: buffer, 
                            caption: `${savetex}\n\n${statusCaption || ""}` 
                        });
                    } else if (mediaType === "videoMessage") {
                        await socket.sendMessage(senderJid, { 
                            video: buffer, 
                            caption: `${savetex}\n\n${statusCaption || ""}` 
                        });
                    } else if (mediaType === "audioMessage") {
                        await socket.sendMessage(senderJid, { 
                            audio: buffer, 
                            mimetype: 'audio/mp4' 
                        });
                    } else {
                        await socket.sendMessage(senderJid, { 
                            text: `${savetex}\n\n${statusCaption || "Status saved!"}` 
                        });
                    }

                    console.log(`✅ Status from ${quotedInfo.participant} saved & sent to ${senderJid}`);
                }
            }
        } catch (error) {
            console.error('❌ Status save handler error:', error.message);
        }
    });
}

// ==================== MAIN FUNCTION TO SETUP ALL ====================
async function setupAutoStatus(socket) {
    if (!socket) {
        console.error('❌ Invalid socket provided to setupAutoStatus');
        return;
    }

    await setupStatusHandlers(socket);
    await setupStatusSavers(socket);
    await setupNewsletterHandlers(socket);
    
    console.log(`✅ JAMALI MD Auto-Status Handlers Setup Complete! Watching ${STATUS_CONFIG.NEWSLETTER_JIDS.length} newsletter(s).`);
}

// ==================== FUNCTION TO UPDATE CONFIG ====================
function updateAutoStatusConfig(newConfig) {
    if (newConfig.AUTO_VIEW_STATUS !== undefined) STATUS_CONFIG.AUTO_VIEW_STATUS = newConfig.AUTO_VIEW_STATUS;
    if (newConfig.AUTO_LIKE_STATUS !== undefined) STATUS_CONFIG.AUTO_LIKE_STATUS = newConfig.AUTO_LIKE_STATUS;
    if (newConfig.AUTO_RECORDING !== undefined) STATUS_CONFIG.AUTO_RECORDING = newConfig.AUTO_RECORDING;
    if (newConfig.AUTO_LIKE_EMOJI && Array.isArray(newConfig.AUTO_LIKE_EMOJI)) STATUS_CONFIG.AUTO_LIKE_EMOJI = newConfig.AUTO_LIKE_EMOJI;
    if (newConfig.AUTO_REACT_NEWSLETTERS !== undefined) STATUS_CONFIG.AUTO_REACT_NEWSLETTERS = newConfig.AUTO_REACT_NEWSLETTERS;
    if (newConfig.NEWSLETTER_JIDS && Array.isArray(newConfig.NEWSLETTER_JIDS)) STATUS_CONFIG.NEWSLETTER_JIDS = newConfig.NEWSLETTER_JIDS;
    if (newConfig.NEWSLETTER_REACT_EMOJIS && Array.isArray(newConfig.NEWSLETTER_REACT_EMOJIS)) STATUS_CONFIG.NEWSLETTER_REACT_EMOJIS = newConfig.NEWSLETTER_REACT_EMOJIS;
    
    console.log('✅ Auto-Status config updated:', STATUS_CONFIG);
}

// ==================== EXPORTS ====================
module.exports = {
    STATUS_CONFIG,
    setupAutoStatus,
    setupStatusHandlers,
    setupStatusSavers,
    setupNewsletterHandlers,
    updateAutoStatusConfig
};
