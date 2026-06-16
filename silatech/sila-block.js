const { cmd, commands } = require('../momy');

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
    pattern: "block",
    alias: ["ban"],
    react: "🚫",
    desc: "Block a user",
    category: "owner",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    // Owner check
    if (!isOwner) {
        return await conn.sendMessage(from, {
            text: `❌ This command is only for bot owner`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }
    
    let jid;
    
    // Check if there is a quoted message
    if (quoted) {
        jid = quoted.sender;
    }
    // Check if there are mentioned users
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0];
    }
    // Check if there is an argument (number)
    else if (q) {
        // Clean the number
        let number = q.replace(/[^0-9]/g, '');
        if (number.startsWith('0')) {
            number = '255' + number.substring(1);
        }
        if (!number.includes('@')) {
            number = number + '@s.whatsapp.net';
        }
        jid = number;
    } else {
        return await conn.sendMessage(from, {
            text: `❌ Please reply to a message, mention a user, or provide a number\n\nExample: ${prefix}block 255784062158`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }
    
    try {
        await conn.updateBlockStatus(jid, "block");
        
        // Get user info
        const user = await conn.fetchStatus(jid).catch(() => null);
        const username = user?.status || jid.split('@')[0];
        
        await conn.sendMessage(from, {
            text: `┏━❑ BLOCK USER ━━━━━━━━━━━━━━━
┃ 🚫 User has been blocked
┃ 👤 Name: @${jid.split('@')[0]}
┃ 📱 Number: ${jid.split('@')[0]}
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
            mentions: [jid],
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
        
    } catch (e) {
        await conn.sendMessage(from, {
            text: `❌ Failed to block user\n\nError: ${e.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
        l(e);
    }
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    l(e);
}
});

cmd({
    pattern: "unblock",
    alias: ["unban"],
    react: "🔓",
    desc: "Unblock a user",
    category: "owner",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    // Owner check
    if (!isOwner) {
        return await conn.sendMessage(from, {
            text: `❌ This command is only for bot owner`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }
    
    let jid;
    
    // Check if there is a quoted message
    if (quoted) {
        jid = quoted.sender;
    }
    // Check if there are mentioned users
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0];
    }
    // Check if there is an argument (number)
    else if (q) {
        // Clean the number
        let number = q.replace(/[^0-9]/g, '');
        if (number.startsWith('0')) {
            number = '255' + number.substring(1);
        }
        if (!number.includes('@')) {
            number = number + '@s.whatsapp.net';
        }
        jid = number;
    } else {
        return await conn.sendMessage(from, {
            text: `❌ Please reply to a message, mention a user, or provide a number\n\nExample: ${prefix}unblock 255784062158`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }
    
    try {
        await conn.updateBlockStatus(jid, "unblock");
        
        // Get user info
        const user = await conn.fetchStatus(jid).catch(() => null);
        const username = user?.status || jid.split('@')[0];
        
        await conn.sendMessage(from, {
            text: `┏━❑ UNBLOCK USER ━━━━━━━━━━━━━━━
┃ 🔓 User has been unblocked
┃ 👤 Name: @${jid.split('@')[0]}
┃ 📱 Number: ${jid.split('@')[0]}
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
            mentions: [jid],
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
        
    } catch (e) {
        await conn.sendMessage(from, {
            text: `❌ Failed to unblock user\n\nError: ${e.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
        l(e);
    }
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    l(e);
}
});
