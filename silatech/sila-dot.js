const { cmd } = require('../momy');

cmd({
    pattern: ".",
    desc: "bot information",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, reply, sender, pushname, myquoted }) => {
    try {
        const response = `╭━━【 📱 JAMALI MD 】━━━╮
│ 
│ 🤖 *BOT LINK:*
│ https://github.com/jamalitechempire/jamali-bot
│ 
│ 📢 *CHANNEL:*
│ https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h
│ 
│ 👑 *OWNER:*
│ +255784062158
│ 
│ 💡 *COMMANDS:*
│ Type .menu for commands
│ 
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;

        await conn.sendMessage(from, {
            text: response
        }, { quoted: myquoted });

    } catch (error) {
        console.error('Error in dot command:', error);
    }
});
