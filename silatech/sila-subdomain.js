const { cmd, commands } = require('../momy');
const axios = require('axios');

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
    pattern: "subdomains",
    alias: ["subdomain", "subs", "domains"],
    react: "🔍",
    desc: "Find subdomains for a domain",
    category: "tools",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    
    if (!q || !q.trim()) {
        return await conn.sendMessage(from, {
            text: `❌ Please provide a domain\n\nExample: .subdomains gmail.com`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Show typing indicator
    await conn.sendPresenceUpdate('composing', from);

    // Call Subdomains API
    const response = await axios.get(`https://api.siputzx.my.id/api/tools/subdomains?domain=${encodeURIComponent(q.trim())}`);
    
    if (!response.data) {
        throw new Error('No response from API');
    }

    let result = response.data.subdomains || response.data.data || response.data;

    // Format subdomains
    let formattedResult = '';
    
    if (Array.isArray(result)) {
        if (result.length === 0) {
            formattedResult = 'No subdomains found';
        } else {
            formattedResult = result.slice(0, 50).map((sub, i) => `${i + 1}. ${sub}`).join('\n');
            if (result.length > 50) {
                formattedResult += `\n... and ${result.length - 50} more`;
            }
        }
    } else if (typeof result === 'object') {
        formattedResult = JSON.stringify(result, null, 2);
    } else {
        formattedResult = String(result);
    }

    // Truncate if too long
    if (formattedResult.length > 4096) {
        formattedResult = formattedResult.substring(0, 4090) + '...';
    }

    await conn.sendPresenceUpdate('paused', from);

    await conn.sendMessage(from, {
        text: `┏━❑ SUBDOMAINS ━━━━━━━━\n┃ 🔍 Domain: ${q.trim()}\n┃\n┃ ${formattedResult}\n┗━━━━━━━━━━━━━━━━━━━━\n\n> 🔥 Powered by JAMALI TECH TZ`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });

} catch (e) {
    await conn.sendPresenceUpdate('paused', from);
    
    let errorMsg = '❌ Error fetching subdomains';
    
    if (e.response?.status === 429) {
        errorMsg = '❌ Rate limited. Try again later';
    } else if (e.response?.status === 500) {
        errorMsg = '❌ API server error';
    } else if (e.code === 'ECONNABORTED') {
        errorMsg = '❌ Request timeout';
    }

    await conn.sendMessage(from, {
        text: errorMsg,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    l(e);
}
});
