const { cmd } = require('../momy');

cmd({
    pattern: "mute",
    alias: ["silence", "lock"],
    desc: "mute/unmute group",
    category: "group",
    react: "🔇",
    filename: __filename
}, async (conn, mek, m, { from, reply, sender, args, isGroup, participants, groupMetadata }) => {
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

        // Get duration from args
        const durationArg = args[0];
        let durationInMinutes = 0;
        
        // Check if user wants to unmute
        if (durationArg === "off" || durationArg === "unmute" || durationArg === "open") {
            try {
                await conn.groupSettingUpdate(from, 'not_announcement');
                
                const successMsg = `╭━━【 🔊 UNMUTE 】━━━╮
│ ✅ Group unmuted
│ 👥 Members can now send messages
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;
                
                await conn.sendMessage(from, { text: successMsg });
                await m.react("✅");
                return;
            } catch (error) {
                console.error('Error unmuting group:', error);
                return reply("*❌ Failed to unmute group*");
            }
        }

        // Check for duration
        if (durationArg && !isNaN(durationArg)) {
            durationInMinutes = parseInt(durationArg);
            if (durationInMinutes < 1 || durationInMinutes > 1440) {
                return reply("*❌ Invalid duration. Use 1-1440 minutes*");
            }
        }

        // Mute the group
        await conn.groupSettingUpdate(from, 'announcement');
        
        let successMsg;
        if (durationInMinutes > 0) {
            const durationInMilliseconds = durationInMinutes * 60 * 1000;
            
            successMsg = `╭━━【 🔇 MUTE 】━━━╮
│ ✅ Group muted
│ ⏰ Duration: ${durationInMinutes} minutes
│ 👥 Only admins can send messages
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;
            
            await conn.sendMessage(from, { text: successMsg });
            
            // Set timeout to unmute after duration
            setTimeout(async () => {
                try {
                    await conn.groupSettingUpdate(from, 'not_announcement');
                    const unmuteMsg = `╭━━【 🔊 AUTO UNMUTE 】━━━╮
│ ✅ Group automatically unmuted
│ ⏰ Timer completed: ${durationInMinutes} minutes
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;
                    
                    await conn.sendMessage(from, { text: unmuteMsg });
                } catch (unmuteError) {
                    console.error('Error auto-unmuting group:', unmuteError);
                }
            }, durationInMilliseconds);
            
        } else {
            // Permanent mute
            successMsg = `╭━━【 🔇 PERMANENT MUTE 】━━━╮
│ ✅ Group permanently muted
│ 👥 Only admins can send messages
│ 💡 Use: .mute off to unmute
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;
            
            await conn.sendMessage(from, { text: successMsg });
        }

        await m.react("✅");

    } catch (error) {
        console.error('Error in mute command:', error);
        reply("*❌ Failed to mute/unmute group*");
        await m.react("❌");
    }
});
