const config = require('../config');

async function groupEvents(conn, update) {
    const isWelcomeEnabled = config.WELCOME_ENABLE === 'true'; 
    const isGoodbyeEnabled = config.GOODBYE_ENABLE === 'true'; 
    
    if (!isWelcomeEnabled && !isGoodbyeEnabled) return;

    try {
        const metadata = await conn.groupMetadata(update.id);
        const groupName = metadata.subject;
        const groupJid = update.id;
        const participants = update.participants;

        for (const participantJid of participants) {
            const username = participantJid.split('@')[0];
            const mentions = [participantJid];
            let message = '';

            if (update.action === 'add' && isWelcomeEnabled) {
                message = `╭━━【 🔐 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 】━━━━━━━━╮\n│ 👋 @${username}\n│ 🎉 Welcome to ${groupName}\n│ ⚡ Use .menu for commands\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}`;
                
                if (config.WELCOME_IMAGE) {
                    await conn.sendMessage(groupJid, {
                        image: { url: config.WELCOME_IMAGE },
                        caption: message,
                        mentions: mentions
                    });
                } else {
                    await conn.sendMessage(groupJid, { 
                        text: message, 
                        mentions: mentions 
                    });
                }
            }
            else if (update.action === 'remove' && isGoodbyeEnabled) {
                message = `╭━━【 🔒 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 】━━━━━━━━╮\n│ 👋 @${username}\n│ 👋 Farewell from ${groupName}\n│ 🚀 We'll miss you!\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}`;
                
                if (config.GOODBYE_IMAGE) {
                    await conn.sendMessage(groupJid, {
                        image: { url: config.GOODBYE_IMAGE },
                        caption: message,
                        mentions: mentions
                    });
                } else {
                    await conn.sendMessage(groupJid, { 
                        text: message, 
                        mentions: mentions 
                    });
                }
            }
            else if (update.action === 'promote') {
                const author = update.author || '';
                if (author) mentions.push(author);
                
                message = `╭━━【 ⬆️ 𝐏𝐑𝐎𝐌𝐎𝐓𝐄 】━━━━━━━━╮\n│ 👑 @${username}\n│ ⚡ Promoted to Admin!\n│ 🔐 New privileges granted\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}`;
                
                await conn.sendMessage(groupJid, { 
                    text: message, 
                    mentions: mentions 
                });
            }
            else if (update.action === 'demote') {
                const author = update.author || '';
                if (author) mentions.push(author);
                
                message = `╭━━【 ⬇️ 𝐃𝐄𝐌𝐎𝐓𝐄 】━━━━━━━━╮\n│ 👑 @${username}\n│ ⚡ Demoted from Admin!\n│ 🔓 Admin privileges removed\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}`;
                
                await conn.sendMessage(groupJid, { 
                    text: message, 
                    mentions: mentions 
                });
            }
        }

        // Channel events if applicable
        await handleChannelEvents(conn, update);

    } catch (e) {
        console.error("Group Events Error:", e.message);
    }
}

// Channel events handler
async function handleChannelEvents(conn, update) {
    try {
        const channelJids = [config.CHANNEL_JID_1, config.CHANNEL_JID_2].filter(Boolean);
        
        for (const channelJid of channelJids) {
            if (!channelJid) continue;
            
            // Check if update is related to channels
            if (update.id.includes('@newsletter')) {
                await handleNewsletterEvents(conn, update, channelJid);
            }
        }
    } catch (e) {
        console.error("Channel Events Error:", e.message);
    }
}

// Newsletter/Channel specific events
async function handleNewsletterEvents(conn, update, channelJid) {
    try {
        const participantJid = update.participants?.[0] || '';
        const username = participantJid.split('@')[0];
        let channelMessage = '';

        if (update.action === 'add') {
            channelMessage = `📢 *NEW CHANNEL SUBSCRIBER*\n\n👤 User: ${username}\n🎯 Channel: ${channelJid.split('@')[0]}\n📅 Time: ${new Date().toLocaleTimeString()}\n\n🔔 Thanks for subscribing!`;
            
            // Notify admin about new subscriber
            if (config.OWNER_NUMBER) {
                await conn.sendMessage(`${config.OWNER_NUMBER}@s.whatsapp.net`, {
                    text: channelMessage
                });
            }
        }
        else if (update.action === 'remove') {
            channelMessage = `📢 *CHANNEL UNSUBSCRIBER*\n\n👤 User: ${username}\n🎯 Channel: ${channelJid.split('@')[0]}\n📅 Time: ${new Date().toLocaleTimeString()}\n\n🔕 User unsubscribed from channel`;
            
            // Notify admin about unsubscriber
            if (config.OWNER_NUMBER) {
                await conn.sendMessage(`${config.OWNER_NUMBER}@s.whatsapp.net`, {
                    text: channelMessage
                });
            }
        }

    } catch (e) {
        console.error("Newsletter Events Error:", e.message);
    }
}

// Additional group management functions
async function handleGroupSettingsUpdate(conn, update) {
    try {
        if (update.announce === 'true' || update.announce === 'false') {
            const status = update.announce === 'true' ? '🔒 LOCKED' : '🔓 UNLOCKED';
            const message = `╭━━【 ⚙️ 𝐆𝐑𝐎𝐔𝐏 𝐔𝐏𝐃𝐀𝐓𝐄 】━━━━╮\n│ 📢 Group has been ${status}\n│ 👑 Only admins can send messages\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}`;
            
            await conn.sendMessage(update.id, { text: message });
        }
        
        if (update.restrict === 'true' || update.restrict === 'false') {
            const status = update.restrict === 'true' ? '🔒 ENABLED' : '🔓 DISABLED';
            const message = `╭━━【 ⚙️ 𝐆𝐑𝐎𝐔𝐏 𝐔𝐏𝐃𝐀𝐓𝐄 】━━━━╮\n│ 🔐 Group restrictions ${status}\n│ ⚡ Settings updated by admin\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}`;
            
            await conn.sendMessage(update.id, { text: message });
        }
        
        if (update.subject) {
            const message = `╭━━【 📝 𝐆𝐑𝐎𝐔𝐏 𝐔𝐏𝐃𝐀𝐓𝐄 】━━━━╮\n│ 🏷️ Group name changed\n│ 📛 Old: ${update.prevSubject}\n│ 🏷️ New: ${update.subject}\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}`;
            
            await conn.sendMessage(update.id, { text: message });
        }
        
        if (update.description) {
            const message = `╭━━【 📝 𝐆𝐑𝐎𝐔𝐏 𝐔𝐏𝐃𝐀𝐓𝐄 】━━━━╮\n│ 📄 Group description updated\n│ 📋 Check group info for details\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}`;
            
            await conn.sendMessage(update.id, { text: message });
        }
        
        if (update.picture) {
            const message = `╭━━【 🖼️ 𝐆𝐑𝐎𝐔𝐏 𝐔𝐏𝐃𝐀𝐓𝐄 】━━━━╮\n│ 🖼️ Group picture changed\n│ 🎨 New profile image set\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${config.BOT_FOOTER || '> © 𝐏𝐨𝐰𝐞𝐫𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡'}`;
            
            await conn.sendMessage(update.id, { text: message });
        }
    } catch (e) {
        console.error("Group Settings Update Error:", e.message);
    }
}

// Main events handler that connects everything
async function handleAllEvents(conn, update) {
    try {
        // Group participant updates
        if (update.type === 'participants') {
            await groupEvents(conn, update);
        }
        
        // Group settings updates
        else if (update.type === 'group-update') {
            await handleGroupSettingsUpdate(conn, update);
        }
        
        // Channel updates
        else if (update.type === 'channel-update') {
            await handleChannelEvents(conn, update);
        }
    } catch (e) {
        console.error("All Events Handler Error:", e.message);
    }
}

module.exports = {
    groupEvents,
    handleAllEvents,
    handleChannelEvents,
    handleGroupSettingsUpdate
};
