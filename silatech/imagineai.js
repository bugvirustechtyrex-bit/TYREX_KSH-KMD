const { cmd } = require('../momy');
const config = require('../config');
const axios = require('axios');

const API_KEY = 'freepublic';
const BASE_URL = 'https://exsalapi.my.id/api';

// ===================== TXT2VID - Text to Video =====================
cmd({
    pattern: "veo3",
    alias: ["text2video", "txt2vid", "aivideo"],
    react: "🎥",
    desc: "Generate video from text description",
    category: "ai"
},
async(conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply(`❌ Please provide a text prompt\n\nExample: .veo3 Cat saying Hello`);

        await conn.sendPresenceUpdate('composing', from);
        
        const apiUrl = `${BASE_URL}/ai/video/aritek/txt2vid?prompt=${encodeURIComponent(q)}&apikey=${API_KEY}`;
        
        // Try to fetch video
        const response = await axios.get(apiUrl, { 
            timeout: 60000,
            responseType: 'arraybuffer'
        });
        
        if (!response.data) throw new Error('No video generated');
        
        await conn.sendPresenceUpdate('paused', from);
        
        // Send as video
        await conn.sendMessage(from, {
            video: Buffer.from(response.data),
            caption: `━━━━━━━━━━━━━━━━━━━━━━\n    JAMALI MD - TXT2VID    \n━━━━━━━━━━━━━━━━━━━━━━\n\nPrompt: ${q}\n━━━━━━━━━━━━━━━━━━━━━━\n> 🔥 Powered by JAMALI TECH TZ`
        });
        
    } catch (e) {
        reply(`❌ Error: ${e.message}\n\nNote: API may be unavailable`);
    }
});

// ===================== IMAGEN-4 - Text to Image =====================
cmd({
    pattern: "imagen4",
    alias: ["imagen", "genimage", "aiimage", "text2img"],
    react: "🖼️",
    desc: "Generate image from text using Imagen-4",
    category: "ai"
},
async(conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply(`❌ Please provide a text prompt\n\nExample: .imagen4 Cat saying JAMALI MD`);

        await conn.sendPresenceUpdate('composing', from);
        
        const apiUrl = `${BASE_URL}/ai/image/imagen-4?prompt=${encodeURIComponent(q)}&apikey=${API_KEY}`;
        
        const response = await axios.get(apiUrl, { 
            timeout: 30000,
            responseType: 'arraybuffer'
        });
        
        if (!response.data) throw new Error('No image generated');
        
        await conn.sendPresenceUpdate('paused', from);
        
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: `━━━━━━━━━━━━━━━━━━━━━━\n    JAMALI MD - IMAGEN-4    \n━━━━━━━━━━━━━━━━━━━━━━\n\nPrompt: ${q}\n━━━━━━━━━━━━━━━━━━━━━━\n> 🔥 Powered by JAMALI TECH TZ`
        });
        
    } catch (e) {
        reply(`❌ Error: ${e.message}\n\nNote: API may be unavailable`);
    }
});

// ===================== IMG2PROMPT - Image to Prompt =====================
cmd({
    pattern: "img2prompt",
    alias: ["imagetoprompt", "img2pro", "imgdesc"],
    react: "🔍",
    desc: "Generate prompt description from image URL",
    category: "ai"
},
async(conn, mek, m, { from, q, reply, quoted }) => {
    try {
        // Get image URL from quoted message or direct input
        let imageUrl = q;
        
        if (!imageUrl && quoted) {
            // Try to get image from quoted message
            const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quotedMsg?.imageMessage) {
                reply(`❌ Please provide a direct image URL for now`);
                return;
            }
        }
        
        if (!imageUrl) {
            return reply(`❌ Please provide an image URL\n\nExample: .img2prompt https://files.catbox.moe/98k75b.jpeg`);
        }

        await conn.sendPresenceUpdate('composing', from);
        
        const apiUrl = `${BASE_URL}/ai/image/img2prompt?url=${encodeURIComponent(imageUrl)}&apikey=${API_KEY}`;
        
        const response = await axios.get(apiUrl);
        
        if (!response.data?.status) throw new Error('Failed to analyze image');
        
        const data = response.data.data;
        
        let message = `━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `    JAMALI MD - IMAGE PROMPT    \n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `🖼️ *Original URL:*\n${data.original_url}\n\n`;
        message += `📝 *Generated Prompt:*\n${data.prompt}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `> Use this prompt with .imagen4`;
        
        reply(message);
        
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// ===================== AI HELP =====================
cmd({
    pattern: "aihelp",
    alias: ["exsalhelp"],
    react: "❓",
    desc: "Help for JAMALI MD AI commands",
    category: "ai"
},
async(conn, mek, m, { from, reply }) => {
    const help = `━━━━━━━━━━━━━━━━━━━━━━
    JAMALI MD AI COMMANDS    
━━━━━━━━━━━━━━━━━━━━━━

🎥 *.veo3 <prompt>*
   Generate video from text
   Ex: .veo3 Cat dancing

🖼️ *.imagen4 <prompt>*
   Generate image from text
   Ex: .imagen4 Beautiful sunset

🔍 *.img2prompt <image_url>*
   Get prompt from image
   Ex: .img2prompt https://...

━━━━━━━━━━━━━━━━━━━━━━
> Note: API service may be unstable
> 🔥 Powered by JAMALI TECH TZ
━━━━━━━━━━━━━━━━━━━━━━`;

    reply(help);
});
