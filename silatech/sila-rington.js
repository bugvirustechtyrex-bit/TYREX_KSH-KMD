const { cmd, commands } = require('../momy');
const axios = require('axios');

cmd({
    pattern: "ringtone",
    alias: ["ring", "rtone"],
    react: "🎵",
    desc: "Search ringtone",
    category: "search",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!q) {
        return reply("❌ Please provide search query\n\n> 🔥 Powered by JAMALI TECH TZ");
    }
    
    const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(q)}`);
    
    if (!data.status || !data.result || data.result.length === 0) {
        return reply(`❌ No ringtones found for "${q}"\n\n> 🔥 Powered by JAMALI TECH TZ`);
    }
    
    const randomRingtone = data.result[Math.floor(Math.random() * data.result.length)];
    
    await conn.sendMessage(
        from,
        {
            audio: { url: randomRingtone.dl_link },
            mimetype: "audio/mpeg",
            fileName: `${randomRingtone.title}.mp3`,
        },
        { quoted: mek }
    );
    
} catch (e) {
    reply("❌ Failed to fetch ringtone\n\n> 🔥 Powered by JAMALI TECH TZ");
    l(e);
}
});
