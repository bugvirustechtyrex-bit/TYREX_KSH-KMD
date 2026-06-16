const { cmd } = require('../momy');

cmd({
    pattern: "unmute",
    alias: ["open", "speak"],
    desc: "unmute group",
    category: "group",
    react: "🔊",
    filename: __filename
}, async (conn, mek, m, { from, reply, sender, isGroup }) => {
    try {
        // Check if in group
        if (!isGroup) {
            return reply("*❌ This command only works in groups*");
        }

        // Get group metadata
        const groupData = await conn.groupMetadata(from);
        const members = groupData.participants;
        
        // Check if sender is admin
        const senderParticipant = members.find(p => p.id === sender);
        if (!senderParticipant || (senderParticipant.admin !== "admin" && senderParticipant.admin !== "superadmin")) {
            return reply("*❌ Only group admins can use this command*");
        }

        // Check if bot is admin
        const botParticipant = members.find(p => p.id === conn.user.id);
        if (!botParticipant || (botParticipant.admin !== "admin" && botParticipant.admin !== "superadmin")) {
            return reply("*❌ Please make the bot an admin first*");
        }

        // Unmute the group
        await conn.groupSettingUpdate(from, 'not_announcement');
        
        const successMsg = `╭━━【 🔊 UNMUTE 】━━━╮
│ ✅ Group unmuted successfully
│ 👥 Members can now send messages
│ 📢 All users are now allowed to talk
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;

        await conn.sendMessage(from, { text: successMsg });
        await m.react("✅");

    } catch (error) {
        console.error('Error in unmute command:', error);
        reply("*❌ Failed to unmute group*");
        await m.react("❌");
    }
});
