const { cmd } = require('../momy');

cmd({
    pattern: "tagall",
    alias: ["all", "mentionall", "everyone"],
    desc: "tag all group members",
    category: "group",
    react: "🏷️",
    filename: __filename
}, async (conn, mek, m, { from, reply, sender, isGroup, participants, groupMetadata }) => {
    try {
        // Check if in group
        if (!isGroup) {
            return reply("*❌ This command only works in groups*");
        }

        // Get group metadata
        const groupData = await conn.groupMetadata(from);
        const members = groupData.participants;
        
        if (!members || members.length === 0) {
            return reply("*❌ No members found in the group*");
        }

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

        // Create message with tags
        let messageText = `╭━━【 🏷️ TAG ALL 】━━━╮
│ 📢 Group: ${groupData.subject}
│ 👥 Total Members: ${members.length}
╰━━━━━━━━━━━━━━━━━━━╯

🔊 *Hello Everyone!*`;

        // Add all members mentions
        members.forEach((member, index) => {
            const number = member.id.split('@')[0];
            messageText += `\n${index + 1}. @${number}`;
        });

        messageText += `\n\n> 🔥 Powered by JAMALI TECH TZ`;

        // Send message with mentions
        await conn.sendMessage(from, {
            text: messageText,
            mentions: members.map(m => m.id)
        }, { quoted: mek });

        await m.react("✅");

    } catch (error) {
        console.error('Error in tagall command:', error);
        reply("*❌ Failed to tag all members*");
        await m.react("❌");
    }
});
