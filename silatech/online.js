const { cmd } = require('../momy');

cmd({
    pattern: "online",
    alias: ["whosonline", "onlinemembers"],
    desc: "check who's online in group",
    category: "group",
    react: "🟢",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isCreator, reply, myquoted }) => {
    try {
        if (!isGroup) return reply("*group command only*");
        
        if (!isCreator && !isAdmins) {
            return reply("*admin or owner only command*");
        }

        await reply("*checking online members...*");

        const groupData = await conn.groupMetadata(from);
        const onlineMembers = new Set();
        
        // Array to hold all presence promises
        const presencePromises = [];
        
        for (const participant of groupData.participants) {
            presencePromises.push(
                conn.presenceSubscribe(participant.id).catch(e => {
                    console.log(`Failed to subscribe to ${participant.id}:`, e.message);
                })
            );
        }

        await Promise.all(presencePromises);

        // Presence update handler
        const presenceHandler = (update) => {
            try {
                if (update.id && update.presences) {
                    const presence = update.presences?.lastKnownPresence;
                    if (['available', 'composing', 'recording'].includes(presence)) {
                        onlineMembers.add(update.id);
                    }
                }
            } catch (e) {
                console.log("Presence handler error:", e.message);
            }
        };

        conn.ev.on('presence.update', presenceHandler);

        // Wait for presence updates
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Remove handler
        conn.ev.off('presence.update', presenceHandler);

        if (onlineMembers.size === 0) {
            return reply("*could not detect online members*");
        }
        
        const onlineArray = Array.from(onlineMembers);
        let message = `╭━━【 🟢 ONLINE MEMBERS 】━━━━╮\n`;
        message += `│ 👥 total: *${groupData.participants.length}*\n`;
        message += `│ 🟢 online: *${onlineArray.length}*\n`;
        message += `╰━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        
        // List online members in batches
        const batchSize = 10;
        for (let i = 0; i < onlineArray.length; i += batchSize) {
            const batch = onlineArray.slice(i, i + batchSize);
            message += `${batch.map((id, idx) => `${i + idx + 1}. @${id.split('@')[0]}`).join('\n')}\n`;
        }
        
        message += `\n> 🔥 Powered by JAMALI TECH TZ`;

        await conn.sendMessage(from, { 
            text: message,
            mentions: onlineArray
        }, { quoted: myquoted });

    } catch (e) {
        console.error("online command error:", e);
        reply("*error checking online members*");
    }
});
