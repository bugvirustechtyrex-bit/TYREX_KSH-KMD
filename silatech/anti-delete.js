// silatech/antilink.js
// JAMALI MD - Anti-Link Group Protection

const fs = require('fs');
const path = require('path');

// Path for antilink group settings
const antilinkGroupsPath = path.join(__dirname, '..', 'database', 'antilink_groups.json');

// Ensure directory exists
const antilinkDir = path.dirname(antilinkGroupsPath);
if (!fs.existsSync(antilinkDir)) {
    fs.mkdirSync(antilinkDir, { recursive: true });
}

// Load group settings
const getGroupSettings = () => {
    try {
        if (fs.existsSync(antilinkGroupsPath)) {
            return JSON.parse(fs.readFileSync(antilinkGroupsPath, 'utf8'));
        }
        return {};
    } catch (err) {
        return {};
    }
};

// Save group settings
const saveGroupSettings = (data) => {
    fs.writeFileSync(antilinkGroupsPath, JSON.stringify(data, null, 2));
};

// Enable/disable antilink for a group
const setGroupAntilink = (groupId, enabled) => {
    const settings = getGroupSettings();
    if (enabled) {
        settings[groupId] = true;
    } else {
        delete settings[groupId];
    }
    saveGroupSettings(settings);
    return true;
};

// Get antilink status for a group
const getGroupAntilink = (groupId) => {
    const settings = getGroupSettings();
    return settings[groupId] === true;
};

// Command: antilink on/off
module.exports = {
    pattern: 'antilink',
    alias: ['antilink', 'antilinkgroup', 'al'],
    react: '🔗',
    description: 'Enable or disable anti-link protection in group',
    category: 'group',
    usage: '.antilink on/off',
    async function(conn, mek, m, {
        from, isGroup, isAdmins, isBotAdmins, isCreator, isOwner,
        reply, args, config, command
    }) {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups!');
        }
        
        if (!isAdmins && !isCreator && !isOwner) {
            return reply('❌ Only group admins or bot owner can use this command!');
        }
        
        if (!isBotAdmins) {
            return reply('❌ Bot needs to be admin to manage anti-link!');
        }
        
        const action = args[0] ? args[0].toLowerCase() : '';
        
        if (action === 'on' || action === 'enable') {
            setGroupAntilink(from, true);
            reply(`✅ *ANTI-LINK ENABLED* ✅\n\n🔗 Links are now prohibited in this group!\n⚠️ Users who send links will receive warnings.\n📌 After ${config.LINK_WARN_LIMIT || 3} warnings, they will be ${config.LINK_ACTION || 'kicked'}.\n\n*To disable:* .antilink off`);
        } 
        else if (action === 'off' || action === 'disable') {
            setGroupAntilink(from, false);
            reply(`❌ *ANTI-LINK DISABLED* ❌\n\n🔗 Links are now allowed in this group!\n\n*To enable:* .antilink on`);
        }
        else {
            const status = getGroupAntilink(from) ? '✅ ENABLED' : '❌ DISABLED';
            reply(`🔗 *ANTI-LINK STATUS*\n\n📌 Current status: ${status}\n⚠️ Warning limit: ${config.LINK_WARN_LIMIT || 3}\n⚡ Action after limit: ${config.LINK_ACTION || 'kick'}\n📋 Whitelisted domains: ${config.LINK_WHITELIST || 'whatsapp.com, chat.whatsapp.com, youtube.com'}\n\n*Usage:*\n.antilink on - Enable protection\n.antilink off - Disable protection`);
        }
    }
};
