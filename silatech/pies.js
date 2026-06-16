const { cmd } = require('../momy');
const config = require('../config');
const axios = require('axios');

// Country flags
const flags = {
    china: '🇨🇳',
    indonesia: '🇮🇩',
    japan: '🇯🇵',
    korea: '🇰🇷',
    thailand: '🇹🇭'
};

// Command Beauty - Random beauty images by country
cmd({
    pattern: "beauty",
    alias: ["china", "indonesia", "japan", "korea", "thailand", "chinese", "indo", "japanese", "korean", "thai"],
    desc: "Get random beauty image by country",
    category: "nsfw",
    react: "😍"
},
async(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply, myquoted }) => {
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
        return reply(`❌ *Invalid country*\n\nAvailable countries: ${validCountries.join(', ')}\n\nExample: ${config.PREFIX}beauty korea`);
    }

    // Send typing indicator
    await conn.sendPresenceUpdate('composing', from);
    
    // Random reaction
    const reactions = ['😍', '✨', '🌸', '💫', '🌟'];
    const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
    
    await conn.sendMessage(from, {
        react: { text: randomReact, key: mek.key }
    });

    // Call API
    const response = await axios.get(`https://api.siputzx.my.id/api/r/cecan/${country}`, {
        timeout: 30000,
        responseType: 'arraybuffer'
    });
    
    if (!response.data) {
        throw new Error('No response from API');
    }

    const countryCapitalized = country.charAt(0).toUpperCase() + country.slice(1);
    const flag = flags[country] || '';

    // Send image with styled caption
    await conn.sendMessage(from, {
        image: Buffer.from(response.data),
        caption: `╭━━【 JAMALI MD 】━━━━━━━━╮
│ *Random ${countryCapitalized} beauty* ${flag}
╰━━━━━━━━━━━━━━━━━━━━╯

${config.BOT_FOOTER || '> 🔥 Powered by JAMALI TECH TZ'}`
    }, { quoted: myquoted });

} catch (e) {
    console.error('Beauty Command Error:', e);
    
    let errorMsg = 'Failed to fetch image';
    if (e.response?.status === 429) {
        errorMsg = 'Rate limited, try again later';
    } else if (e.response?.status === 500) {
        errorMsg = 'API server error';
    } else if (e.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout';
    }

    reply(`❌ *${errorMsg}*`);
}
});
