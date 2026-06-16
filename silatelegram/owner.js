module.exports = {
    command: 'owner',
    function: async (ctx) => {
        try {
            const { Markup } = require('telegraf');
            
            const ownerInfo = `👑 *𝙾𝚆𝙽𝙴𝚁 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽* 👑\n\n📛 𝙽𝚊𝚖𝚎: 𝚂𝚒𝚕𝚊 𝚃𝚎𝚌𝚑\n📞 𝙿𝚑𝚘𝚗𝚎: +255 789 661 031\n📧 𝙴𝚖𝚊𝚒𝚕: silatech@example.com\n🌐 𝙻𝚘𝚌𝚊𝚝𝚒𝚘𝚗: 𝚃𝚊𝚗𝚣𝚊𝚗𝚒𝚊\n\n🔗 *𝚂𝚘𝚌𝚒𝚊𝚕 𝙻𝚒𝚗𝚔𝚜:*\n• 𝙶𝚒𝚝𝙷𝚞𝚋: https://github.com/Sila-Md\n• 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙: https://wa.me/255789661031\n• 𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖: @silatech_admin\n• 𝚈𝚘𝚞𝚃𝚞𝚋𝚎: 𝚂𝚒𝚕𝚊 𝚃𝚎𝚌𝚑\n\n💡 *𝙵𝚘𝚛 𝚜𝚞𝚙𝚙𝚘𝚛𝚝, 𝚋𝚞𝚐 𝚛𝚎𝚙𝚘𝚛𝚝𝚜, 𝚘𝚛 𝚏𝚎𝚊𝚝𝚞𝚛𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝𝚜, 𝚙𝚕𝚎𝚊𝚜𝚎 𝚌𝚘𝚗𝚝𝚊𝚌𝚝 𝚖𝚎 𝚍𝚒𝚛𝚎𝚌𝚝𝚕𝚢.*\n\n> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡`;
            
            const buttons = Markup.inlineKeyboard([
                [
                    Markup.button.url('📱 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙', 'https://wa.me/255789661031'),
                    Markup.button.url('📢 𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖', 'https://t.me/silatech_admin')
                ],
                [
                    Markup.button.url('⭐ 𝙶𝚒𝚝𝙷𝚞𝚋', 'https://github.com/Sila-Md'),
                    Markup.button.url('👥 𝚂𝚞𝚙𝚙𝚘𝚛𝚝', 'https://t.me/sila_md')
                ]
            ]);
            
            await ctx.replyWithPhoto(
                { url: 'https://files.catbox.moe/natk49.jpg' },
                {
                    caption: ownerInfo,
                    parse_mode: 'Markdown',
                    ...buttons
                }
            );
        } catch (error) {
            await ctx.reply(`👑 *𝙾𝚆𝙽𝙴𝚁 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽* 👑\n\n📛 𝙽𝚊𝚖𝚎: 𝚂𝚒𝚕𝚊 𝚃𝚎𝚌𝚑\n📞 𝙿𝚑𝚘𝚗𝚎: +255 789 661 031\n📧 𝙴𝚖𝚊𝚒𝚕: silatech@example.com\n\n🔗 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙: https://wa.me/255789661031\n\n> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡`, { parse_mode: 'Markdown' });
        }
    }
};
