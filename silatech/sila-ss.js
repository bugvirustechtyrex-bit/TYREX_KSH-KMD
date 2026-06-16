const { cmd } = require('../momy');
const axios = require('axios');

cmd({
    pattern: "screenshot",
    alias: ["ss", "webshot", "sitepic"],
    desc: "take website screenshot",
    category: "tools",
    react: "🖥️",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, myquoted }) => {
    try {
        const text = mek.message?.conversation || mek.message?.extendedTextMessage?.text || args.join(" ");
        
        if (!text || text.replace(/^\.(screenshot|ss|webshot|sitepic)\s+/i, "").trim().length === 0) {
            return reply("*🖥️ WEBSITE SCREENSHOT*\n\n*USAGE:* .screenshot website_url\n*EXAMPLE:* .screenshot https://google.com\n\n> 🔥 Powered by JAMALI TECH TZ");
        }

        const url = text.replace(/^\.(screenshot|ss|webshot|sitepic)\s+/i, "").trim();
        
        // Add https:// if missing
        let websiteUrl = url;
        if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
            websiteUrl = 'https://' + websiteUrl;
        }

        await reply("*🖥️ Taking screenshot...*");

        try {
            // Try first API
            const apiUrl1 = `https://movanest.xyz/v2/ssweb?url=${encodeURIComponent(websiteUrl)}&width=1280&height=720&full_page=true`;
            const res1 = await axios.get(apiUrl1, { timeout: 60000 });

            if (res1.data?.status && res1.data.screenshot) {
                const screenshotUrl = res1.data.screenshot;
                
                const caption = `╭━━【 🖥️ WEBSITE SCREENSHOT 】━━━╮
│ 🔗 URL: ${websiteUrl}
│ 📐 Resolution: 1280x720 (HD)
│ 📊 Full Page: Yes
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;

                await conn.sendMessage(from, {
                    image: { url: screenshotUrl },
                    caption: caption
                }, { quoted: myquoted });

                await m.react("✅");
                return;
            }
        } catch (error) {
            console.log("First API failed, trying second...");
        }

        // Try second API
        try {
            const apiUrl2 = `https://api.apiflash.com/v1/urltoimage?access_key=YOUR_API_KEY&url=${encodeURIComponent(websiteUrl)}&full_page=true&format=jpeg&quality=100`;
            const res2 = await axios.get(apiUrl2, { timeout: 60000, responseType: 'arraybuffer' });

            const caption = `╭━━【 🖥️ WEBSITE SCREENSHOT 】━━━╮
│ 🔗 URL: ${websiteUrl}
│ 📐 Resolution: 1280x720 (HD)
│ 📊 Full Page: Yes
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;

            await conn.sendMessage(from, {
                image: res2.data,
                caption: caption
            }, { quoted: myquoted });

            await m.react("✅");
            return;

        } catch (error) {
            console.error("Both APIs failed");
            throw error;
        }

    } catch (err) {
        console.error("SCREENSHOT COMMAND ERROR:", err.message);
        reply("*❌ Failed to take screenshot*");
        await m.react("❌");
    }
});
