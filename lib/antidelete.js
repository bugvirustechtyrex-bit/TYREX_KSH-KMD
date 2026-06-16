const { getAntideleteStatus } = require('../data/Antidelete');
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Track deleted messages to prevent duplicate alerts
const processedDeletes = new Set();
const MAX_PROCESSED_SIZE = 1000; // Maximum entries to keep in memory

async function handleAntidelete(conn, updates, store) {
    try {
        if (!updates || !Array.isArray(updates)) return;

        for (const update of updates) {
            // Skip if update key is missing
            if (!update.key) continue;
            
            const chatId = update.key.remoteJid;
            const messageId = update.key.id;
            
            // Skip bot's own messages
            if (update.key.fromMe) continue;

            // Create unique identifier for this deletion event
            const deleteKey = `${chatId}:${messageId}`;
            
            // Skip if already processed (prevent duplicate alerts)
            if (processedDeletes.has(deleteKey)) {
                continue;
            }

            // Check if it's a message deletion
            const isRevoke = update.update.messageStubType === 68 || 
                            (update.update.message && 
                             update.update.message.protocolMessage && 
                             update.update.message.protocolMessage.type === 0);

            if (isRevoke) {
                // Add to processed set
                processedDeletes.add(deleteKey);
                
                // Clean up old entries if set gets too large
                if (processedDeletes.size > MAX_PROCESSED_SIZE) {
                    const firstKey = Array.from(processedDeletes)[0];
                    processedDeletes.delete(firstKey);
                }

                const participant = update.key.participant || chatId;
                const senderNumber = participant.split('@')[0];

                // Check if antidelete is enabled for this chat
                const isEnabled = await getAntideleteStatus(chatId);
                if (!isEnabled) {
                    console.log(`🔕 Anti-delete disabled for ${chatId}`);
                    continue;
                }

                // Get the deleted message from store
                if (!store || !store.messages || !store.messages[chatId]) {
                    console.log(`📭 No message found for ${messageId} in ${chatId}`);
                    continue;
                }

                let msg;
                try {
                    msg = await store.loadMessage(chatId, messageId);
                } catch (loadError) {
                    console.log(`❌ Failed to load message ${messageId}:`, loadError.message);
                    continue;
                }

                if (!msg || !msg.message) {
                    console.log(`📭 Message ${messageId} not found in store`);
                    continue;
                }

                // Get message type
                const messageType = Object.keys(msg.message)[0];
                const isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(messageType);
                const isText = messageType === 'conversation' || messageType === 'extendedTextMessage';
                
                // Prepare alert message with better formatting
                const currentTime = new Date().toLocaleString('en-US', {
                    timeZone: 'Africa/Dar_es_Salaam',
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });

                const alertText = `
╔═══════════════════════╗
       🚫 *ANTI-DELETE ACTIVATED* 🚫
╚═══════════════════════╝

📊 *DETAILS:*
├─ 👤 *User:* @${senderNumber}
├─ 📅 *Time:* ${currentTime}
├─ 💬 *Type:* ${getMessageType(messageType)}
├─ 🔍 *Message ID:* ${messageId.slice(0, 8)}...

╔═══════════════════════╗
        📝 *DELETED CONTENT*
╚═══════════════════════╝

${getMessagePreview(msg, messageType)}

╔═══════════════════════╗
    🔐 *SECURITY SYSTEM*
╚═══════════════════════╝

⚠️ *Note:* Message deletion detected and recorded.

${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}
`;

                try {
                    // Send alert message
                    await conn.sendMessage(chatId, { 
                        text: alertText, 
                        mentions: [participant]
                    });

                    // Forward the deleted message
                    const forwardOptions = {
                        contextInfo: { 
                            isForwarded: false,
                            forwardedNewsletterMessageInfo: undefined
                        }
                    };

                    // For text messages, send as quote
                    if (isText) {
                        const textContent = msg.message[messageType]?.text || 
                                           msg.message.conversation || 
                                           '[Text message]';
                        
                        await conn.sendMessage(chatId, {
                            text: `📝 *Original Message:*\n${textContent}`,
                            mentions: [participant]
                        }, { quoted: msg });
                    } 
                    // For media messages, try to forward
                    else if (isMedia && msg.message[messageType]) {
                        try {
                            await conn.sendMessage(chatId, {
                                forward: msg,
                                contextInfo: {
                                    isForwarded: false,
                                    participant: participant,
                                    quotedMessage: msg.message
                                }
                            }, forwardOptions);
                        } catch (forwardError) {
                            console.log('Media forward failed, sending as text:', forwardError.message);
                            await conn.sendMessage(chatId, {
                                text: `📁 *Media Message Deleted*\nType: ${getMessageType(messageType)}`
                            }, { quoted: msg });
                        }
                    }

                    // Log the deletion
                    logDeletion({
                        chatId,
                        messageId,
                        sender: senderNumber,
                        messageType,
                        timestamp: new Date().toISOString(),
                        contentPreview: getContentPreview(msg, messageType)
                    });

                    console.log(`✅ Anti-delete triggered for ${senderNumber} in ${chatId}`);

                    // Small delay to prevent rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));

                } catch (sendError) {
                    console.error('❌ Failed to send anti-delete alert:', sendError.message);
                    
                    // Try fallback simple message
                    try {
                        await conn.sendMessage(chatId, {
                            text: `⚠️ Message deleted by @${senderNumber} (Anti-delete system)`,
                            mentions: [participant]
                        });
                    } catch (fallbackError) {
                        console.error('❌ Fallback also failed:', fallbackError.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error("🔥 Anti-delete System Error:", error.message);
        console.error("Stack:", error.stack);
    }
}

// Helper function to get message type description
function getMessageType(type) {
    const typeMap = {
        'conversation': '📝 Text',
        'extendedTextMessage': '📝 Text',
        'imageMessage': '🖼️ Image',
        'videoMessage': '🎥 Video',
        'audioMessage': '🎵 Audio',
        'documentMessage': '📄 Document',
        'stickerMessage': '✨ Sticker',
        'contactMessage': '👤 Contact',
        'locationMessage': '📍 Location',
        'liveLocationMessage': '📍 Live Location',
        'buttonsMessage': '🔘 Buttons',
        'templateMessage': '📋 Template',
        'listMessage': '📋 List',
        'viewOnceMessage': '👁️ View Once',
        'ephemeralMessage': '⏳ Ephemeral'
    };
    return typeMap[type] || `❓ ${type}`;
}

// Helper function to get message preview
function getMessagePreview(msg, messageType) {
    if (!msg.message) return '📭 Message content unavailable';
    
    switch (messageType) {
        case 'conversation':
        case 'extendedTextMessage':
            const text = msg.message[messageType]?.text || 
                        msg.message.conversation || 
                        '[Empty text]';
            return text.length > 200 ? text.substring(0, 200) + '...' : text;
            
        case 'imageMessage':
            return '🖼️ Image with caption: ' + (msg.message[messageType]?.caption || '[No caption]');
            
        case 'videoMessage':
            return '🎥 Video with caption: ' + (msg.message[messageType]?.caption || '[No caption]');
            
        case 'audioMessage':
            return '🎵 Audio message' + (msg.message[messageType]?.ptt ? ' (Voice note)' : '');
            
        case 'documentMessage':
            const docName = msg.message[messageType]?.fileName || 'Unknown file';
            return `📄 Document: ${docName}`;
            
        case 'stickerMessage':
            return '✨ Sticker';
            
        case 'contactMessage':
            return '👤 Contact card';
            
        case 'locationMessage':
            return '📍 Location shared';
            
        default:
            return `📦 ${getMessageType(messageType)} message`;
    }
}

// Helper function to get content preview for logging
function getContentPreview(msg, messageType) {
    try {
        if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
            const text = msg.message[messageType]?.text || msg.message.conversation || '';
            return text.substring(0, 100);
        }
        
        if (messageType === 'imageMessage' || messageType === 'videoMessage') {
            return msg.message[messageType]?.caption?.substring(0, 100) || 'Media without caption';
        }
        
        return getMessageType(messageType);
    } catch (error) {
        return 'Error extracting content';
    }
}

// Log deletion to file
function logDeletion(data) {
    try {
        const logFile = path.join(logsDir, 'antidelete.log');
        const logEntry = `${new Date().toISOString()} | ${data.chatId} | ${data.sender} | ${data.messageType} | ${data.contentPreview}\n`;
        
        fs.appendFileSync(logFile, logEntry, 'utf8');
    } catch (error) {
        console.error('Failed to log deletion:', error.message);
    }
}

// Function to clear old processed deletes periodically
setInterval(() => {
    if (processedDeletes.size > MAX_PROCESSED_SIZE * 0.8) {
        const entries = Array.from(processedDeletes);
        const toRemove = Math.floor(entries.length * 0.3); // Remove 30% oldest entries
        for (let i = 0; i < toRemove; i++) {
            processedDeletes.delete(entries[i]);
        }
        console.log(`🧹 Cleaned ${toRemove} old anti-delete entries`);
    }
}, 600000); // Every 10 minutes

module.exports = { handleAntidelete };
