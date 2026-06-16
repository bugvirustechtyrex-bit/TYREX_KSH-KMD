const { cmd } = require('../momy');
const config = require('../config');

// Command ya group event (welcome/goodbye)
cmd({
    pattern: "groupevent",
    alias: ["autoevent", "event"],
    desc: "Turn group events (welcome/goodbye) on/off",
    category: "owner",
    react: "🎉"
},
async(conn, mek, m, { args, isOwner, reply, from, getUserConfigFromMongoDB, updateUserConfigInMongoDB }) => {
    if (!isOwner) return reply("*🔒 Owner only command*");
    
    const mode = args[0]?.toLowerCase();
    const botNumber = conn.user.id.split(':')[0];
    
    if (mode === 'on' || mode === 'enable') {
        await updateUserConfigInMongoDB(botNumber, {
            GROUP_EVENTS: 'true'
        });
        await reply("*✅ Group events activated*\n\n🎉 Welcome/Goodbye messages enabled\n\n> 🔥 Powered by JAMALI TECH TZ");
    } else if (mode === 'off' || mode === 'disable') {
        await updateUserConfigInMongoDB(botNumber, {
            GROUP_EVENTS: 'false'
        });
        await reply("*✅ Group events deactivated*\n\n🎉 Welcome/Goodbye messages disabled\n\n> 🔥 Powered by JAMALI TECH TZ");
    } else {
        const userConfig = await getUserConfigFromMongoDB(botNumber);
        const current = userConfig?.GROUP_EVENTS === 'true';
        await reply(`*Group events: ${current ? "ON ✅" : "OFF ❌"}*\n\nUse: .groupevent on/off\n\n> 🔥 Powered by JAMALI TECH TZ`);
    }
});
