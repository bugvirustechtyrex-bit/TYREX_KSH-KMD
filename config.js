const fs = require('fs');
const dotenv = require('dotenv');
if (fs.existsSync('.env')) dotenv.config({ path: '.env' });

module.exports = {
    // Session & Database
    SESSION_ID: process.env.SESSION_ID || "JAMALI-MD-V1",
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://kxshrii:i7sgjXF6SO2cTJwU@kelumxz.zggub8h.mongodb.net/jamali_md_db',
    
    // Bot Info
    PREFIX: process.env.PREFIX || '.',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '255784062158',
    BOT_NAME: "JAMALI MD",
    BOT_FOOTER: '> 🔥 Powered by JAMALI TECH TZ',
    WORK_TYPE: process.env.WORK_TYPE || "public",
    
    // Auto Features
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_LIKE_EMOJI: ['🔥', '❤️', '👍', '😎', '💫', '👑', '⭐', '🎉'],
    AUTO_REPLY_ENABLE: 'true',
    
    // Security
    ANTI_CALL: 'false',
    ANTI_DELETE: 'false',
    READ_MESSAGE: 'false',
    AUTO_TYPING: 'false',
    AUTO_RECORDING: 'false',
    
    // Group
    WELCOME_ENABLE: 'true',
    GOODBYE_ENABLE: 'true',
    LINK_WARN_LIMIT: '3',
    LINK_ACTION: 'mute',
    LINK_WHITELIST: 'whatsapp.com,chat.whatsapp.com,youtube.com',
    GROUP_LINK: 'https://chat.whatsapp.com/GPdlJ8ip88K39E5Hok7rJh',
    
    // Channel (JID only)
    CHANNEL_JID: '120363425061263455@newsletter',
    
    // Images & Links
    IMAGE_PATH: 'https://files.catbox.moe/0e3rok.jpg',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h',
    
    // Telegram (hiari)
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || ''
};
