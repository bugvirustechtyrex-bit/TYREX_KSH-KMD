const { cmd } = require('../momy');
const axios = require('axios');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

cmd({
    pattern: "pair",
    alias: ["paircode", "getcode"],
    desc: "get whatsapp pairing code",
    category: "tools",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, myquoted }) => {
    try {
        const text = args.join(" ");
        
        if (!text) {
            return reply("*Please provide WhatsApp number*\n*Example:* .pair 255784062158");
        }

        const numbers = text.split(',')
            .map(v => v.replace(/[^0-9]/g, ''))
            .filter(v => v.length > 5 && v.length < 20);

        if (numbers.length === 0) {
            return reply("*❌ Invalid number. Use correct format!*");
        }

        for (const number of numbers) {
            const whatsappID = number + '@s.whatsapp.net';
            const result = await conn.onWhatsApp(whatsappID);

            if (!result[0]?.exists) {
                return reply(`*❌ ${number} is not registered on WhatsApp*`);
            }

            await reply("⏳ Generating pairing code...");

            try {
                // Use bot's own pairing API (local server)
                const port = process.env.PORT || 8000;
                const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
                const response = await axios.get(`${baseUrl}/code?number=${number}`, { timeout: 15000 });
                
                if (response.data && response.data.code) {
                    const code = response.data.code;
                    if (code === "Service Unavailable") {
                        throw new Error('Service Unavailable');
                    }
                    
                    await sleep(3000); // wait a bit
                    
                    await conn.sendMessage(from, {
                        text: `🔐 *Your JAMALI MD Pairing Code:*\n\n\`${code}\`\n\nUse this code in WhatsApp → Linked Devices → Link a Device\n\n> 🔥 Powered by JAMALI TECH TZ`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363425061263455@newsletter',
                                newsletterName: 'JAMALI MD',
                                serverMessageId: -1
                            }
                        }
                    }, { quoted: myquoted });
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (apiError) {
                console.error('API Error:', apiError);
                const errorMessage = apiError.message === 'Service Unavailable' 
                    ? "*⚠️ Service is currently unavailable. Please try again later.*"
                    : "*❌ Failed to generate pairing code. Please try again later.*";
                
                await reply(errorMessage);
            }
        }

        await m.react("✅");

    } catch (error) {
        console.error(error);
        reply("*❌ An error occurred. Please try again later.*");
        await m.react("❌");
    }
});
