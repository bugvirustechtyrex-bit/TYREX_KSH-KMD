const config = require('../config')
const { cmd, commands } = require('../momy')
const { isUrl } = require('../lib/functions')

cmd({
    pattern: "kick",
    react: "👢",
    alias: ["remove", "kickout"],
    desc: "Remove a member from group",
    category: "group",
    use: ".kick @user",
    filename: __filename
},
async (conn, mek, m, { from, reply, isGroup, senderNumber, groupAdmins, mentionedJid }) => {
    try {
        if (!isGroup) return reply("*This command only works in groups*");

        const botOwner = conn.user.id.split(":")[0];
        const senderJid = senderNumber + "@s.whatsapp.net";

        if (!groupAdmins.includes(senderJid) && senderNumber !== botOwner) {
            return reply("*Only group admins can use this command*");
        }

        // Bot admin check
        const groupInfo = await conn.groupMetadata(from);
        const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";

        if (!groupInfo.participants.find(p => p.id === botNumber && p.admin)) {
            return reply("*Please make the bot an admin first*");
        }

        if (!mentionedJid || mentionedJid.length === 0) {
            return reply("*❌ Tag the member to kick*\n\nExample:\n.kick @user");
        }

        for (let user of mentionedJid) {
            await conn.groupParticipantsUpdate(from, [user], "remove");
        }

        reply(
            "*👢 Member removed successfully* 👢\n\n" +
            "⚠️ Reason: Violation of group rules\n\n" +
            "> 🔥 Powered by JAMALI TECH TZ"
        );

    } catch (e) {
        console.error("Kick Error:", e);
        reply("*❌ Failed to remove member*");
    }
});
