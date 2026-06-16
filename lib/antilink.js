// lib/antilink.js
const fs = require('fs');
const path = require('path');

// Path for antilink warnings
const antilinkWarningsPath = path.join(__dirname, '..', 'database', 'antilink_warnings.json');

// Ensure directory exists
const antilinkDir = path.dirname(antilinkWarningsPath);
if (!fs.existsSync(antilinkDir)) {
    fs.mkdirSync(antilinkDir, { recursive: true });
}

// Initialize warnings file if not exists
if (!fs.existsSync(antilinkWarningsPath)) {
    fs.writeFileSync(antilinkWarningsPath, JSON.stringify({}, null, 2));
}

// Load warnings
const loadWarnings = () => {
    try {
        if (fs.existsSync(antilinkWarningsPath)) {
            return JSON.parse(fs.readFileSync(antilinkWarningsPath, 'utf8'));
        }
        return {};
    } catch (err) {
        return {};
    }
};

// Save warnings
const saveWarnings = (data) => {
    fs.writeFileSync(antilinkWarningsPath, JSON.stringify(data, null, 2));
};

// Check if message contains link
const containsLink = (text) => {
    if (!text) return false;
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|gov|edu|co|tz|uk|us|info|xyz|me|io|app|dev|site|online|tech|link|live|club|space|website|web|blog|news|media|tv|video|photo|image|file|download|music|movie|game|shop|store|market|buy|sell|deal|coupon|offer|promo|code|link|url|http|https))/gi;
    return linkRegex.test(text);
};

// Check if link is whitelisted
const isWhitelistedLink = (text, config) => {
    if (!text) return false;
    const whitelist = config.LINK_WHITELIST ? config.LINK_WHITELIST.split(',') : ['whatsapp.com', 'chat.whatsapp.com', 'youtube.com', 'youtu.be'];
    for (const domain of whitelist) {
        if (text.toLowerCase().includes(domain.toLowerCase())) {
            return true;
        }
    }
    return false;
};

// Get warning count for user in group
const getWarnCount = (groupId, userId) => {
    const warnings = loadWarnings();
    const key = `${groupId}|${userId}`;
    return warnings[key] || 0;
};

// Increase warning count
const addWarn = (groupId, userId) => {
    const warnings = loadWarnings();
    const key = `${groupId}|${userId}`;
    const current = warnings[key] || 0;
    warnings[key] = current + 1;
    saveWarnings(warnings);
    return current + 1;
};

// Reset warning count
const resetWarn = (groupId, userId) => {
    const warnings = loadWarnings();
    const key = `${groupId}|${userId}`;
    delete warnings[key];
    saveWarnings(warnings);
};

// Clear all warnings for a group
const clearGroupWarnings = (groupId) => {
    const warnings = loadWarnings();
    for (const key in warnings) {
        if (key.startsWith(`${groupId}|`)) {
            delete warnings[key];
        }
    }
    saveWarnings(warnings);
};

// Check if user is admin
const isUserAdmin = async (conn, groupId, userJid) => {
    try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const participants = groupMetadata.participants;
        const participant = participants.find(p => p.id === userJid);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch (err) {
        return false;
    }
};

// Main antilink handler
const handleAntilink = async (conn, from, msg, sender, senderNumber, config) => {
    if (!from.includes('g.us')) return false;
    if (msg.key.fromMe) return false;
    
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || "";
    
    if (containsLink(body) && !isWhitelistedLink(body, config)) {
        // Check if sender is admin
        const isAdmin = await isUserAdmin(conn, from, sender);
        
        // Check if sender is owner
        const isOwner = config.OWNER_NUMBER && config.OWNER_NUMBER.includes(senderNumber);
        
        if (!isAdmin && !isOwner) {
            const warnLimit = parseInt(config.LINK_WARN_LIMIT) || 3;
            const warnCount = addWarn(from, senderNumber);
            const remaining = warnLimit - warnCount;
            
            // Delete the message
            try {
                await conn.sendMessage(from, { delete: msg.key });
            } catch (e) {}
            
            // Send warning
            let warningMsg = `⚠️ *ANTI-LINK WARNING* ⚠️\n\n`;
            warningMsg += `@${senderNumber} you are not allowed to send links in this group!\n\n`;
            warningMsg += `📝 *Warning:* ${warnCount}/${warnLimit}\n`;
            
            if (remaining <= 0) {
                // Take action based on config
                const action = config.LINK_ACTION || 'kick';
                if (action === 'kick') {
                    try {
                        await conn.groupParticipantsUpdate(from, [sender], 'remove');
                        warningMsg += `\n❌ *Action:* You have been removed from the group!`;
                    } catch (e) {
                        warningMsg += `\n❌ *Action:* Failed to remove - insufficient permissions!`;
                    }
                    resetWarn(from, senderNumber);
                } else if (action === 'mute') {
                    try {
                        await conn.groupParticipantsUpdate(from, [sender], 'demote');
                        warningMsg += `\n🔇 *Action:* You have been demoted! Contact admin to be restored.`;
                    } catch (e) {
                        warningMsg += `\n❌ *Action:* Failed to demote - insufficient permissions!`;
                    }
                } else {
                    warningMsg += `\n⚠️ *Final Warning:* Next time action will be taken!`;
                }
            } else {
                warningMsg += `\n⚠️ *Remaining warnings:* ${remaining}`;
                warningMsg += `\n📌 *Action:* Message deleted. Don't send links again!`;
            }
            
            try {
                await conn.sendMessage(from, { text: warningMsg, mentions: [sender] });
            } catch (e) {}
            return true;
        }
    }
    return false;
};

module.exports = {
    containsLink,
    isWhitelistedLink,
    getWarnCount,
    addWarn,
    resetWarn,
    clearGroupWarnings,
    handleAntilink
};