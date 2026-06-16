const { cmd } = require('../momy');

cmd({
    pattern: "jamali",
    alias: ["dev", "creator", "bot", "ownerinfo"],
    desc: "bot developer information",
    category: "main",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, reply, myquoted }) => {
    try {
        const response = await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/0e3rok.jpg" },
            caption: `╭━━【 👑 JAMALI TECH TZ 】━━━╮
│ 
│ *👤 NAME:* JAMALI TECH TZ
│ *🎯 ROLE:* Bot Developer & Owner
│ *💻 SPECIALITY:* WhatsApp Bot Development
│ *🌟 EXPERIENCE:* 3+ Years
│ 
│ ──────────────────
│ *📞 CONTACT INFO:*
│ 📱 *Phone:* +255784062158
│ 📧 *Email:* jamalitech@gmail.com
│ 
│ ──────────────────
│ *🔧 SERVICES OFFERED:*
│ 🤖 WhatsApp Bot Development
│ 💾 Bot Hosting & Maintenance
│ 🔧 Bot Updates & Fixes
│ 📚 Custom Commands
│ 
│ ──────────────────
│ *🌐 CONNECT WITH ME:*
│ 📢 *Channel:* https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h
│ 🤖 *Bot Link:* https://jamali-md.onrender.com
│ 
╰━━━━━━━━━━━━━━━━━━━╯

*FEEL FREE TO CONTACT ME FOR:*
• Bot Development
• Bot Modifications
• Custom Features
• Technical Support

> 🔥 DEVELOPED BY JAMALI TECH TZ`
        }, { quoted: myquoted });

        await m.react("👑");

    } catch (error) {
        console.error('Error in jamali command:', error);
        reply("*❌ Error displaying developer info*");
        await m.react("❌");
    }
});
