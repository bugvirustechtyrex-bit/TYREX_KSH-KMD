// JAMALI MD - Group Commands (Add, Hidetag, Tag, Tagadmin, Groupjid, Listadmin)

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

const getContextInfo = (sender) => {
    return {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425061263455@newsletter',
            newsletterName: 'JAMALI MD',
            serverMessageId: 143,
        },
    };
};

// ADD command
cmd({
    pattern: "add",
    alias: ["adduser"],
    react: "➕",
    desc: "Add user to group",
    category: "group",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!isGroup) {
        return await conn.sendMessage(from, {
            text: `❌ This command is only for groups`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    if (!isAdmins) {
        return await conn.sendMessage(from, {
            text: `❌ You need to be an admin`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    if (!q && !m.mentionedJid) {
        return await conn.sendMessage(from, {
            text: `❌ Please mention or provide a number`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    let users = [];
    if (m.mentionedJid) {
        users = m.mentionedJid;
    } else {
        const numbers = q.split(' ').map(num => num.replace(/[^0-9]/g, '')).filter(num => num.length > 0);
        for (let number of numbers) {
            if (number.startsWith('0')) {
                number = '255' + number.substring(1);
            }
            users.push(number + '@s.whatsapp.net');
        }
    }
    
    if (users.length === 0) {
        return await conn.sendMessage(from, {
            text: `❌ No valid users found`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    const added = [];
    const failed = [];
    
    for (let user of users) {
        try {
            await conn.groupParticipantsUpdate(from, [user], "add");
            added.push(user.split('@')[0]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
            failed.push(user.split('@')[0]);
        }
    }
    
    let result = `┏━❑ ADD USER ━━━━━━━━━━━━━━━
┃ ✅ Users added: ${added.length}
┃ ❌ Failed: ${failed.length}
┗━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    if (added.length > 0) {
        result = `┏━❑ ADD USER ━━━━━━━━━━━━━━━
┃ ✅ Successfully added:
┃ ${added.map(num => `┃ • ${num}`).join('\n')}
┗━━━━━━━━━━━━━━━━━━━━━━━━`;
    }
    
    await conn.sendMessage(from, {
        text: result,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    l(e);
}
});

// HIDETAG command
cmd({
    pattern: "hidetag",
    alias: ["htag"],
    react: "🏷️",
    desc: "Tag all members invisibly",
    category: "group",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!isGroup) {
        return await conn.sendMessage(from, {
            text: `❌ This command is only for groups`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    if (!isAdmins) {
        return await conn.sendMessage(from, {
            text: `❌ You need to be an admin`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    const message = q || "📢 Attention all members!";
    const mentions = participants.map(p => p.id);
    
    await conn.sendMessage(from, {
        text: message,
        mentions: mentions
    }, { quoted: fakevCard });
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    l(e);
}
});

// TAG command
cmd({
    pattern: "tag",
    react: "👥",
    desc: "Tag all members",
    category: "group",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!isGroup) {
        return await conn.sendMessage(from, {
            text: `❌ This command is only for groups`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    if (!isAdmins) {
        return await conn.sendMessage(from, {
            text: `❌ You need to be an admin`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    let message = q || "📢 Attention!";
    const mentions = participants.map(p => p.id);
    
    let tagMessage = `┏━❑ GROUP TAG ━━━━━━━━━━━━━━━
┃ ${message}
┃ ━━━━━━━━━━━━━━━━━━━━━━
┃ 👥 Members: ${participants.length}`;
    
    for (let i = 0; i < Math.min(10, participants.length); i++) {
        tagMessage += `\n┃ @${participants[i].id.split('@')[0]}`;
    }
    
    if (participants.length > 10) {
        tagMessage += `\n┃ ... and ${participants.length - 10} more`;
    }
    
    tagMessage += `\n┗━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    await conn.sendMessage(from, {
        text: tagMessage,
        mentions: mentions
    }, { quoted: fakevCard });
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    l(e);
}
});

// TAGADMIN command
cmd({
    pattern: "tagadmin",
    alias: ["tadmin", "admintag"],
    react: "👑",
    desc: "Tag all admins",
    category: "group",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!isGroup) {
        return await conn.sendMessage(from, {
            text: `❌ This command is only for groups`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    if (!isAdmins) {
        return await conn.sendMessage(from, {
            text: `❌ You need to be an admin`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    const adminList = groupAdmins.map(admin => `@${admin.split('@')[0]}`).join(' ');
    const message = q || "📢 Attention admins!";
    
    await conn.sendMessage(from, {
        text: `┏━❑ ADMIN TAG ━━━━━━━━━━━━━━━
┃ ${message}
┃ ━━━━━━━━━━━━━━━━━━━━━━
┃ 👑 Admins:
┃ ${adminList}
┗━━━━━━━━━━━━━━━━━━━━━━━━`,
        mentions: groupAdmins
    }, { quoted: fakevCard });
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    l(e);
}
});

// GROUPJID command
cmd({
    pattern: "groupjid",
    alias: ["gcid"],
    react: "🆔",
    desc: "Get group ID",
    category: "group",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!isGroup) {
        return await conn.sendMessage(from, {
            text: `❌ This command is only for groups`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    await conn.sendMessage(from, {
        text: `┏━❑ GROUP ID ━━━━━━━━━━━━━━━
┃ 🏷️ Name: ${groupName}
┃ 🆔 JID: ${from}
┃ 👥 Members: ${participants.length}
┃ 👑 Admins: ${groupAdmins.length}
┗━━━━━━━━━━━━━━━━━━━━━━━━`,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    l(e);
}
});

// LISTADMIN command
cmd({
    pattern: "listadmin",
    alias: ["admins"],
    react: "📋",
    desc: "List all admins",
    category: "group",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!isGroup) {
        return await conn.sendMessage(from, {
            text: `❌ This command is only for groups`,
            contextInfo: getContextInfo(sender)
        }, { quoted: fakevCard });
    }
    
    let adminList = "┏━❑ GROUP ADMINS ━━━━━━━━━━━━━━━\n";
    
    for (let i = 0; i < groupAdmins.length; i++) {
        try {
            const adminInfo = await conn.fetchStatus(groupAdmins[i]).catch(() => null);
            const adminName = adminInfo?.status || `@${groupAdmins[i].split('@')[0]}`;
            adminList += `┃ ${i + 1}. ${adminName}\n`;
        } catch {
            adminList += `┃ ${i + 1}. @${groupAdmins[i].split('@')[0]}\n`;
        }
    }
    
    adminList += `┃ ━━━━━━━━━━━━━━━━━━━━━━\n`;
    adminList += `┃ 👑 Total Admins: ${groupAdmins.length}\n`;
    adminList += `┗━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    await conn.sendMessage(from, {
        text: adminList,
        mentions: groupAdmins,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo(sender)
    }, { quoted: fakevCard });
    l(e);
}
});
