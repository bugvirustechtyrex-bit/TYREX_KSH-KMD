// JAMALI MD - AI Image Generator

const { cmd } = require('../momy');
const axios = require('axios');

// Function to enhance the prompt
function enhancePrompt(prompt) {
    // Quality enhancing keywords
    const qualityEnhancers = [
        'high quality',
        'detailed',
        'masterpiece',
        'best quality',
        'ultra realistic',
        '4k',
        'highly detailed',
        'professional photography',
        'cinematic lighting',
        'sharp focus'
    ];

    // Randomly select 3-4 enhancers
    const numEnhancers = Math.floor(Math.random() * 2) + 3; // Random number between 3-4
    const selectedEnhancers = qualityEnhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, numEnhancers);

    // Combine original prompt with enhancers
    return `${prompt}, ${selectedEnhancers.join(', ')}`;
}

cmd({
    pattern: "imagine",
    alias: ["flux", "aiimage", "jamalipic"],
    desc: "generate AI image",
    category: "ai",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, myquoted }) => {
    try {
        const text = mek.message?.conversation || mek.message?.extendedTextMessage?.text || args.join(" ");
        
        if (!text || text.replace(/^\.(imagine|generate|aiimage|pic)\s+/i, "").trim().length === 0) {
            return reply("*🎨 AI IMAGE GENERATOR*\n\n*USAGE:* .imagine your_prompt\n*EXAMPLE:* .imagine beautiful sunset over mountains\n*EXAMPLE:* .imagine cat wearing sunglasses\n\n> 🔥 Powered by JAMALI TECH TZ");
        }

        const prompt = text.replace(/^\.(imagine|generate|aiimage|pic)\s+/i, "").trim();
        await reply("*🎨 Generating image...*");

        // Enhance the prompt with quality keywords
        const enhancedPrompt = enhancePrompt(prompt);

        // Make API request
        const response = await axios.get(`https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(enhancedPrompt)}`, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        // Convert response to buffer
        const imageBuffer = Buffer.from(response.data);

        // Send the generated image
        const caption = `╭━━【 🎨 JAMALI MD AI IMAGE 】━━━╮
│ 📝 Prompt: ${prompt}
│ 🎨 AI: Midjourney/Stable Diffusion
│ 📊 Quality: HD (4K)
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;

        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: caption
        }, { quoted: myquoted });

        await m.react("✅");

    } catch (error) {
        console.error('Error in imagine command:', error);
        
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            reply("*⏰ Timeout error. Image generation took too long.*\n\n> 🔥 Powered by JAMALI TECH TZ");
        } else if (error.response?.status === 429) {
            reply("*🚫 Too many requests. Please try again later.*\n\n> 🔥 Powered by JAMALI TECH TZ");
        } else {
            reply("*❌ Failed to generate image. Please try again later.*\n\n> 🔥 Powered by JAMALI TECH TZ");
        }
        
        await m.react("❌");
    }
});
