module.exports = {
    command: 'ping',
    function: async (ctx) => {
        const startTime = Date.now();
        
        try {
            await ctx.replyWithPhoto(
                { url: 'https://files.catbox.moe/natk49.jpg' },
                {
                    caption: `🏓 *𝙿𝙸𝙽𝙶!*\n\n🔄 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙰𝚌𝚝𝚒𝚟𝚎\n⏱️ 𝙻𝚊𝚝𝚎𝚗𝚌𝚢: 𝙲𝚊𝚕𝚌𝚞𝚕𝚊𝚝𝚒𝚗𝚐...\n📊 𝙱𝚘𝚝: 𝙼𝙾𝙼𝚈-𝙺𝙸𝙳𝚈\n\n> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡`,
                    parse_mode: 'Markdown'
                }
            ).then(async () => {
                const endTime = Date.now();
                const latency = endTime - startTime;
                
                await ctx.telegram.editMessageCaption(
                    ctx.chat.id,
                    ctx.message.message_id + 1,
                    null,
                    `🏓 *𝙿𝙸𝙽𝙶!*\n\n🔄 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙰𝚌𝚝𝚒𝚟𝚎\n⏱️ 𝙻𝚊𝚝𝚎𝚗𝚌𝚢: ${latency}𝚖𝚜\n📊 𝙱𝚘𝚝: 𝙼𝙾𝙼𝚈-𝙺𝙸𝙳𝚈\n\n> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡`,
                    { parse_mode: 'Markdown' }
                );
            });
        } catch (error) {
            await ctx.reply(`🏓 *𝙿𝙸𝙽𝙶!*\n\n🔄 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙰𝚌𝚝𝚒𝚟𝚎\n⏱️ 𝙻𝚊𝚝𝚎𝚗𝚌𝚢: 𝙲𝚊𝚕𝚌𝚞𝚕𝚊𝚝𝚎𝚍\n📊 𝙱𝚘𝚝: 𝙼𝙾𝙼𝚈-𝙺𝙸𝙳𝚈\n\n> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡`, { parse_mode: 'Markdown' });
        }
    }
};
