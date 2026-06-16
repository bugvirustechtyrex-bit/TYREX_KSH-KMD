const { cmd, commands } = require('../momy');
const axios = require('axios');

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

const flags = {
    china: '🇨🇳',
    indonesia: '🇮🇩',
    japan: '🇯🇵',
    korea: '🇰🇷',
    thailand: '🇹🇭'
};

cmd({
    pattern: "beauty",
    alias: ["china", "indonesia", "japan", "korea", "thailand", "chinese", "indo", "japanese", "korean", "thai"],
    react: "😍",
    desc: "Get random beauty image by country",
    category: "random",
    filename: __filename
},
async(conn, mek, m, {from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    
    // Get country from command or parameter
    let country = q?.trim() || command;
    country = country.toLowerCase();

    // Map aliases to country names
    const countryMap = {
        'chinese': 'china',
        'indo': 'indonesia',
        'jp': 'japan',
        'japanese': 'japan',
        'korean': 'korea',
        'kr': 'korea',
        'thai': 'thailand'
    };

    if (countryMap[country]) {
        country = countryMap[country];
    }

    // Validate country
    const validCountries = ['china', 'indonesia', 'japan', 'korea', 'thailand'];
    if (!validCountries.includes(country)) {
        return await conn.sendMessage(from, {
            text: `❌ Invalid country\n\nAvailable countries: ${validCountries.join(', ')}\n\nExample: .beauty korea`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fakevCard });
    }

    // Show typing indicator
    await conn.sendPresenceUpdate('composing', from);

    // Call API with country parameter
    const response = await axios.get(`https://api.siputzx.my.id/api/r/cecan/${country}`, {
        timeout: 30000,
        responseType: 'arraybuffer'
    });
    
    if (!response.data) {
        throw new Error('No response from API');
    }

    await conn.sendPresenceUpdate('paused', from);

    const countryCapitalized = country.charAt(0).toUpperCase() + country.slice(1);

    // Send image
    await conn.sendMessage(from, {
        image: Buffer.from(response.data),
        caption: `😍 Random ${countryCapitalized} Beauty ${flags[country]}\n\n> 🔥 Powered by JAMALI TECH TZ`,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });

} catch (e) {
    await conn.sendPresenceUpdate('paused', from);
    
    let errorMsg = '❌ An error occurred';
    
    if (e.response?.status === 429) {
        errorMsg = '❌ Rate limited try again later';
    } else if (e.response?.status === 500) {
        errorMsg = '❌ API server error';
    } else if (e.code === 'ECONNABORTED') {
        errorMsg = '❌ Request timeout';
    }

    await conn.sendMessage(from, {
        text: errorMsg,
        contextInfo: getContextInfo({ sender: sender })
    }, { quoted: fakevCard });
    l(e);
}
});
