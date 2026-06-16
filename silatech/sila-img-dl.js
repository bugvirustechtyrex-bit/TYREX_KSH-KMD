const { cmd, commands } = require('../momy');
const axios = require('axios');

// Unsplash API Key (keep as is)
const UNSPLASH_API_KEY = "TKwNF_gHeB4Z6ieR6sV_Q8gIkQW_VFOcmiNfD0AX0uM";

// Define combined fakevCard (JAMALI MD)
const fakevCard = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "© JAMALI MD",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:JAMALI MD BOT\nORG:JAMALI TECH TZ;\nTEL;type=CELL;type=VOICE;waid=255784062158:+255784062158\nEND:VCARD`
    }
  }
};

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425061263455@newsletter',
            newsletterName: 'JAMALI MD',
            serverMessageId: 143,
        },
    };
};

cmd({
    pattern: "img",
    alias: ["image", "searchimg", "pic", "photo"],
    react: "🖼️",
    desc: "Search and download images from Unsplash",
    category: "search",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!q) {
        return await conn.sendMessage(from, {
            text: `┏━❑ IMAGE SEARCH ━━━━━━━━━━━━━━━
┃ 🖼️ Search images from Unsplash
┃ ━━━━━━━━━━━━━━━━━━━━━━
┃ Usage:
┃ • ${prefix}img <keywords> [number]
┃ ━━━━━━━━━━━━━━━━━━━━━━
┃ Examples:
┃ • ${prefix}img beautiful sunset
┃ • ${prefix}img cute cats 5
┃ • ${prefix}img nature wallpaper 10
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }
    
    // Parse arguments
    const argsList = q.split(' ');
    let imageCount = 3; // Default
    
    // Check if last argument is a number
    const lastArg = argsList[argsList.length - 1];
    const parsedCount = parseInt(lastArg);
    
    let searchQuery;
    if (!isNaN(parsedCount) && parsedCount > 0 && parsedCount <= 20) {
        imageCount = parsedCount;
        searchQuery = argsList.slice(0, -1).join(' ');
    } else {
        searchQuery = q;
    }
    
    // Limit max images
    if (imageCount > 10) imageCount = 10;
    
    if (!searchQuery || searchQuery.trim() === '') {
        return await conn.sendMessage(from, {
            text: `❌ Please provide search keywords`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }
    
    // Send searching message
    await conn.sendMessage(from, {
        text: `┏━❑ SEARCHING ━━━━━━━━━━━━━━━
┃ 🔍 Searching for: ${searchQuery}
┃ 📊 Images: ${imageCount}
┃ ⏳ Please wait...
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    
    try {
        // Make API request
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${imageCount}&client_id=${UNSPLASH_API_KEY}`;
        const { data } = await axios.get(url);
        
        if (!data.results || data.results.length === 0) {
            return await conn.sendMessage(from, {
                text: `❌ No images found for "${searchQuery}"\n\nTry different keywords`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        }
        
        // Send images
        let sentCount = 0;
        const imagesToSend = data.results.slice(0, imageCount);
        
        for (const [index, image] of imagesToSend.entries()) {
            try {
                await conn.sendMessage(from, {
                    image: { url: image.urls.regular },
                    caption: `┏━❑ IMAGE RESULT ━━━━━━━━━━━━━━━
┃ 🖼️ Search: ${searchQuery}
┃ 📸 Photographer: ${image.user.name || 'Unknown'}
┃ 👍 Likes: ${image.likes || 0}
┃ 🔗 Unsplash: ${image.links.html}
┃ ━━━━━━━━━━━━━━━━━━━━━━
┃ 🖼️ Image ${index + 1} of ${imagesToSend.length}
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fakevCard });
                
                sentCount++;
                
                // Add delay between sending images
                if (index < imagesToSend.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                
            } catch (imageError) {
                console.error(`Error sending image ${index + 1}:`, imageError);
            }
        }
        
        // Send completion message
        if (sentCount > 0) {
            await conn.sendMessage(from, {
                text: `┏━❑ SEARCH COMPLETE ━━━━━━━━━━━━━━━
┃ ✅ Successfully sent ${sentCount} images
┃ 🔍 Search query: ${searchQuery}
┃ 🖼️ Source: Unsplash API
┗━━━━━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        } else {
            await conn.sendMessage(from, {
                text: `❌ Failed to send any images`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        }
        
    } catch (apiError) {
        if (apiError.response?.status === 401) {
            await conn.sendMessage(from, {
                text: `❌ API key invalid or expired\n\nPlease contact bot owner`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        } else if (apiError.response?.status === 429) {
            await conn.sendMessage(from, {
                text: `❌ Rate limit exceeded\n\nTry again later`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        } else {
            await conn.sendMessage(from, {
                text: `❌ Error fetching images\n\n${apiError.message}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fakevCard });
        }
        l(apiError);
    }
    
} catch (e) {
    await conn.sendMessage(from, {
        text: `❌ Command failed`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    l(e);
}
});
