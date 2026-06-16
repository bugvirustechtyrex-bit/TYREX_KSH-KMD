const { cmd } = require('../momy');
const config = require('../config');

cmd({
    pattern: "anti-call",
    react: "📵",
    alias: ["anticall"],
    desc: "Enable or disable anti-call system",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("🔒 *Owner only command*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTI_CALL = "true";
        return reply("✅ *Anti-call activated*\n\n📵 Incoming calls will be automatically rejected.\n\n> 🔥 Powered by JAMALI TECH TZ");
    } else if (status === "off") {
        config.ANTI_CALL = "false";
        return reply("❌ *Anti-call deactivated*\n\n📞 Incoming calls will be allowed.\n\n> 🔥 Powered by JAMALI TECH TZ");
    } else {
        return reply(`📵 *Anti-call status:* ${config.ANTI_CALL === 'true' ? '✅ ENABLED' : '❌ DISABLED'}\n\n*Usage:*\n.anti-call on - Enable\n.anti-call off - Disable\n\n> 🔥 Powered by JAMALI TECH TZ`);
    }
});
