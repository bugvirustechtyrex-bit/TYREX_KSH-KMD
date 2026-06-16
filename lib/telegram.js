// lib/telegram.js
const axios = require('axios');
const config = require('../config');

class TelegramService {
    static async sendNotification(message) {
        try {
            if (config.TELEGRAM_BOT_TOKEN && config.TELEGRAM_CHAT_ID) {
                await axios.post(`https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: config.TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                });
                return true;
            }
        } catch (error) {
            console.error('𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 𝚎𝚛𝚛𝚘𝚛:', error.message);
            return false;
        }
    }
    
    static async sendCommandNotification(command, sender, group) {
        const message = `🤖 *𝙽𝙴𝚆 𝙲𝙾𝙼𝙼𝙰𝙽𝙳*\n\n` +
                       `𝙲𝚘𝚖𝚖𝚊𝚗𝚍: ${command}\n` +
                       `𝚂𝚎𝚗𝚍𝚎𝚛: ${sender}\n` +
                       `𝙶𝚛𝚘𝚞𝚙: ${group || '𝙿𝚛𝚒𝚟𝚊𝚝𝚎 𝙲𝚑𝚊𝚝'}\n` +
                       `𝚃𝚒𝚖𝚎: ${new Date().toLocaleString()}`;
        
        return await this.sendNotification(message);
    }
}

module.exports = TelegramService;
