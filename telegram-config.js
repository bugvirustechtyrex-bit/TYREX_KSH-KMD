// telegram-config.js
module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '7303596375',
    
    // Telegram bot settings
    TELEGRAM_BOT_NAME: 'JAMALI MD Pairing Bot',
    TELEGRAM_BOT_USERNAME: 'jamali_md_bot',
    
    // Webhook settings (optional)
    TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL || null,
    TELEGRAM_WEBHOOK_PORT: process.env.TELEGRAM_WEBHOOK_PORT || 3001,
    
    // Database for Telegram sessions
    TELEGRAM_SESSION_PATH: './database/telegram-sessions/',
    
    // Commands
    COMMANDS: [
        { command: 'start', description: 'Start the bot' },
        { command: 'pair', description: 'Pair WhatsApp bot' },
        { command: 'owner', description: 'Contact owner' },
        { command: 'menu', description: 'Show commands menu' },
        { command: 'status', description: 'Check bot status' },
        { command: 'help', description: 'Show help information' }
    ],
    
    // Messages
    MESSAGES: {
        WELCOME: `🤖 *JAMALI MD PAIRING SYSTEM* 🤖\n\n👋 Welcome to JAMALI MD WhatsApp Bot Pairing System!\n\nUse /pair <number> to connect your WhatsApp bot!`,
        HELP: `📚 *HELP MENU*\n\n/start - Start the bot\n/pair <number> - Pair WhatsApp bot\n/owner - Contact owner\n/menu - Show commands menu\n/status - Check bot status\n/help - Show this message`,
        OWNER: `👑 *OWNER INFORMATION*\n\n📛 Name: JAMALI TECH TZ\n📞 Phone: +255 784 062 158\n\n🔗 Telegram: @JAMALI_TECH_TZ`
    },
    
    // URLs
    URLS: {
        GITHUB: 'https://github.com/Jamali-md/JAMALI-MD',
        TELEGRAM_CHANNEL: 'https://t.me/jamali_md',
        TELEGRAM_GROUP: 'https://t.me/jamali_md_group',
        WHATSAPP_CHANNEL: 'https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h',
        SUPPORT_GROUP: 'https://chat.whatsapp.com/GPdlJ8ip88K39E5Hok7rJh'
    }
};
