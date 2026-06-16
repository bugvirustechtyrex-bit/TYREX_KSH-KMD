// sila/telegram-bot.js
// Independent Telegram Bot - Separated from main sila.js

const { Telegraf, Markup } = require('telegraf');
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');

// Create silatelegram directory
const silatelegramDir = path.join(__dirname, '../silatelegram');
if (!fs.existsSync(silatelegramDir)) {
    fs.mkdirSync(silatelegramDir, { recursive: true });
}

let bot = null;
let isRunning = false;

// Function to load telegram commands
function loadTelegramCommands() {
    try {
        const telegramFiles = fs.readdirSync(silatelegramDir).filter(file => file.endsWith('.js'));
        console.log(`📦 Loading ${telegramFiles.length} telegram commands...`);
        
        for (const file of telegramFiles) {
            try {
                const command = require(path.join(silatelegramDir, file));
                if (command && command.command && command.function) {
                    bot.command(command.command, command.function);
                    console.log(`✅ Loaded telegram command: /${command.command}`);
                }
            } catch (e) {
                console.error(`❌ Failed to load telegram command ${file}:`, e);
            }
        }
    } catch (error) {
        console.error('❌ Error loading telegram commands:', error);
    }
}

// Function to start Telegram bot
async function startTelegramBot() {
    if (!config.TELEGRAM_BOT_TOKEN) {
        console.log('ℹ️ Telegram bot token not configured. Skipping...');
        return;
    }

    if (isRunning) {
        console.log('⚠️ Telegram bot is already running');
        return;
    }

    try {
        bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

        bot.start((ctx) => {
            const welcomeMessage = `🤖 *JAMALI MD - PAIRING SYSTEM* 🤖

👋 Welcome to JAMALI MD WhatsApp Bot Pairing System!

📱 *How to use:*
1️⃣ Use /pair <number> to pair your bot
2️⃣ I'll generate a pairing code for you
3️⃣ Enter the code in your WhatsApp
4️⃣ Your bot will be connected!

🚀 *Support Links:*
• GitHub: https://github.com/Jamali-md/JAMALI-MD
• WhatsApp Channel: ${config.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h'}

> 🔥 Powered by JAMALI TECH TZ`;

            const buttons = Markup.inlineKeyboard([
                [
                    Markup.button.url('📢 Channel', config.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h'),
                    Markup.button.url('👥 Group', config.GROUP_LINK_1 || 'https://chat.whatsapp.com/GPdlJ8ip88K39E5Hok7rJh')
                ],
                [
                    Markup.button.url('⭐ GitHub', 'https://github.com/Jamali-md/JAMALI-MD'),
                    Markup.button.url('📱 WhatsApp', config.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h')
                ]
            ]);

            ctx.replyWithPhoto(
                { url: config.IMAGE_PATH || 'https://files.catbox.moe/0e3rok.jpg' },
                {
                    caption: welcomeMessage,
                    parse_mode: 'Markdown',
                    ...buttons
                }
            ).catch(() => {
                ctx.replyWithMarkdown(welcomeMessage, buttons);
            });
        });

        bot.command('pair', async (ctx) => {
            const args = ctx.message.text.split(' ');
            if (args.length < 2) {
                return ctx.reply('❌ *Usage:* /pair <number>\n*Example:* /pair 255784062158', { parse_mode: 'Markdown' });
            }

            const number = args[1];
            const sanitizedNumber = number.replace(/[^0-9]/g, '');

            if (sanitizedNumber.length < 9) {
                return ctx.reply('❌ Invalid phone number. Please enter a valid number with country code.', { parse_mode: 'Markdown' });
            }

            ctx.reply(`⏳ *Pairing in progress...*\n\nNumber: +${sanitizedNumber}\nStatus: Initiating...\n\n⚠️ Please make sure your Website API is running!`, { parse_mode: 'Markdown' });
        });

        bot.command('ping', (ctx) => {
            ctx.reply('🏓 *PONG!*\n\nBot is alive and running!', { parse_mode: 'Markdown' });
        });

        bot.command('alive', (ctx) => {
            ctx.reply('✅ *I AM ALIVE!*\n\n🤖 JAMALI MD Telegram Bot\n⚡ Status: Online\n📅 Version: 3.0.0', { parse_mode: 'Markdown' });
        });

        bot.command('owner', (ctx) => {
            ctx.reply('👑 *Owner Info*\n\n📱 Number: wa.me/255784062158\n💬 Contact for support', { parse_mode: 'Markdown' });
        });

        // Load telegram commands
        loadTelegramCommands();

        // Start Telegram bot
        await bot.launch();
        isRunning = true;
        console.log('🤖 JAMALI MD Telegram bot started successfully!');

        // Enable graceful stop
        process.once('SIGINT', () => stopTelegramBot());
        process.once('SIGTERM', () => stopTelegramBot());

    } catch (error) {
        console.error('❌ Failed to start Telegram bot:', error);
    }
}

// Function to stop Telegram bot
async function stopTelegramBot() {
    if (bot && isRunning) {
        bot.stop('SIGINT');
        isRunning = false;
        console.log('🛑 Telegram bot stopped');
    }
}

// Function to get bot status
function getTelegramBotStatus() {
    return {
        running: isRunning,
        tokenConfigured: !!config.TELEGRAM_BOT_TOKEN
    };
}

module.exports = {
    startTelegramBot,
    stopTelegramBot,
    getTelegramBotStatus
};
