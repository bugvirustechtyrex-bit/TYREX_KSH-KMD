// JAMALI MD - Chatbot Control & Auto AI Reply

const { cmd } = require('../momy');
const axios = require('axios');

// State storage for chatbot settings
let chatbotState = {
    enabled: true,
    mode: 'both' // 'both', 'group', 'inbox'
};

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

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425061263455@newsletter',
            newsletterName: 'JAMALI MD',
            serverMessageId: 143,
        },
    };
};

cmd({
    pattern: "chatbot",
    alias: ["ai", "bot"],
    react: "🤖",
    desc: "Chatbot control settings",
    category: "ai",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!args[0]) {
        return await conn.sendMessage(from, {
            text: `┏━❑ CHATBOT SETTINGS ━━━━━━━━
┃ 🟢 Status: ${chatbotState.enabled ? 'ON' : 'OFF'}
┃ 🌐 Mode: ${chatbotState.mode.toUpperCase()}
┃ ━━━━━━━━━━━━━━━━━━━━━━
┃ Usage:
┃ • ${prefix}chatbot on - Enable chatbot
┃ • ${prefix}chatbot off - Disable chatbot
┃ • ${prefix}chatbot group - Groups only
┃ • ${prefix}chatbot inbox - Inbox only
┃ • ${prefix}chatbot both - Groups & Inbox
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }
    
    const action = args[0].toLowerCase();
    
    switch(action) {
        case 'on':
            chatbotState.enabled = true;
            await conn.sendMessage(from, {
                text: `┏━❑ CHATBOT ━━━━━━━━━━━━━━━
┃ ✅ Chatbot has been ENABLED
┃ Mode: ${chatbotState.mode.toUpperCase()}
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
            break;
            
        case 'off':
            chatbotState.enabled = false;
            await conn.sendMessage(from, {
                text: `┏━❑ CHATBOT ━━━━━━━━━━━━━━━
┃ 🔴 Chatbot has been DISABLED
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
            break;
            
        case 'group':
            chatbotState.mode = 'group';
            await conn.sendMessage(from, {
                text: `┏━❑ CHATBOT ━━━━━━━━━━━━━━━
┃ 📱 Mode set to GROUPS ONLY
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
            break;
            
        case 'inbox':
            chatbotState.mode = 'inbox';
            await conn.sendMessage(from, {
                text: `┏━❑ CHATBOT ━━━━━━━━━━━━━━━
┃ 💬 Mode set to INBOX ONLY
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
            break;
            
        case 'both':
            chatbotState.mode = 'both';
            await conn.sendMessage(from, {
                text: `┏━❑ CHATBOT ━━━━━━━━━━━━━━━
┃ 🌐 Mode set to GROUPS & INBOX
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
            break;
            
        default:
            await conn.sendMessage(from, {
                text: `❌ Invalid option. Use:\n• on\n• off\n• group\n• inbox\n• both\n\n> 🔥 Powered by JAMALI TECH TZ`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
    }
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed\n\n> 🔥 Powered by JAMALI TECH TZ`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    l(e);
}
});

// Auto-reply handler for normal conversation (not commands)
// This should be placed in your main event handler
module.exports.chatbotHandler = async (conn, message) => {
    try {
        const { from, body, isGroup, sender } = message;
        
        // Check if not a command (doesn't start with prefix)
        if (body.startsWith('.')) return;
        
        // Check if chatbot is enabled
        if (!chatbotState.enabled) return;
        
        // Check mode
        if (chatbotState.mode === 'group' && !isGroup) return;
        if (chatbotState.mode === 'inbox' && isGroup) return;
        
        // Trim message
        const userMessage = body.trim();
        if (!userMessage) return;
        
        // Ignore certain words (links)
        const ignoreWords = ['http://', 'https://', 'www.', '.com', '.net', '.org'];
        if (ignoreWords.some(word => userMessage.toLowerCase().includes(word))) return;
        
        // Call GPT API
        const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(userMessage)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.result) {
            // Send reply normally
            await conn.sendMessage(from, { 
                text: data.result + '\n\n> 🔥 Powered by JAMALI TECH TZ'
            }, { 
                quoted: message 
            });
        }
        
    } catch (error) {
        console.error('Chatbot error:', error);
        // Don't send error message to user
    }
};

// Export state for access from other files
module.exports.chatbotState = chatbotState;
