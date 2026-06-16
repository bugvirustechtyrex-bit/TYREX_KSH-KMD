// JAMALI MD - AI Commands (GPT-5, GPT-OSS, Phi-2, DeepSeek, DuckAI, Gemini, Gita, BibleAI)

const { cmd } = require('../momy');
const config = require('../config');
const axios = require('axios');

// ===================== MAIN AI COMMAND (GPT-5) =====================
cmd({
    pattern: "ai",
    alias: ["gpt", "ask", "think2", "jamalai", "brainy", "chat"],
    react: "🤖",
    desc: "Ask AI anything (GPT-5)",
    category: "ai",
    filename: __filename
},
async(conn, mek, m, {from, q, reply}) => {
try{
    if (!q || !q.trim()) {
        return reply(`❌ Please ask a question\n\nExample: .ai What is python?`);
    }

    await conn.sendPresenceUpdate('composing', from);

    const response = await axios.get(`https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(q.trim())}`);
    
    if (!response.data) throw new Error('No response from API');

    let aiResponse = response.data.response || response.data.result || response.data.data || JSON.stringify(response.data);
    if (aiResponse.length > 4096) aiResponse = aiResponse.substring(0, 4090) + '...';

    await conn.sendPresenceUpdate('paused', from);

    await reply(aiResponse + '\n\n> 🔥 Powered by JAMALI TECH TZ');

} catch (e) {
    await conn.sendPresenceUpdate('paused', from);
    let errorMsg = '❌ AI malfunctioning';
    if (e.response?.status === 429) errorMsg = '❌ Rate limited try again later';
    else if (e.response?.status === 500) errorMsg = '❌ AI server error';
    else if (e.code === 'ECONNABORTED') errorMsg = '❌ Request timeout';
    else errorMsg = `❌ Error: ${e.message}`;

    reply(errorMsg);
}
});

// ===================== GPT-OSS-120B =====================
cmd({
    pattern: "gptoss",
    alias: ["oss", "gpt120b"],
    react: "🧠",
    desc: "GPT-OSS-120B AI model",
    category: "ai"
},
async(conn, mek, m, {from, q, reply}) => {
try{
    if (!q) return reply(`❌ Please ask a question\n\nExample: .gptoss Hello, who are you?`);

    await conn.sendPresenceUpdate('composing', from);
    
    const response = await axios.get(`https://api.siputzx.my.id/api/ai/gptoss120b?prompt=${encodeURIComponent(q)}&system=You+are+a+helpful+assistant.&temperature=0.7`);
    
    let answer = response.data?.data?.response || response.data?.response || JSON.stringify(response.data);
    if (answer.length > 4096) answer = answer.substring(0, 4090) + '...';

    await conn.sendPresenceUpdate('paused', from);
    reply(answer + '\n\n> 🔥 Powered by JAMALI TECH TZ');

} catch (e) {
    reply(`❌ Error: ${e.message}`);
}
});

// ===================== PHI-2 =====================
cmd({
    pattern: "phi2",
    alias: ["phi"],
    react: "🔬",
    desc: "Microsoft Phi-2 AI model",
    category: "ai"
},
async(conn, mek, m, {from, q, reply}) => {
try{
    if (!q) return reply(`❌ Please ask a question\n\nExample: .phi2 What is machine learning?`);

    await conn.sendPresenceUpdate('composing', from);
    
    const response = await axios.get(`https://api.siputzx.my.id/api/ai/phi2?prompt=${encodeURIComponent(q)}&system=You+are+a+helpful+assistant.&temperature=0.7`);
    
    let answer = response.data?.data?.response || response.data?.response || JSON.stringify(response.data);
    if (answer.length > 4096) answer = answer.substring(0, 4090) + '...';

    await conn.sendPresenceUpdate('paused', from);
    reply(answer + '\n\n> 🔥 Powered by JAMALI TECH TZ');

} catch (e) {
    reply(`❌ Error: ${e.message}`);
}
});

// ===================== DEEPSEEK-R1 =====================
cmd({
    pattern: "deepseek",
    alias: ["deepseekr1", "ds"],
    react: "🧐",
    desc: "DeepSeek-R1 AI model",
    category: "ai"
},
async(conn, mek, m, {from, q, reply}) => {
try{
    if (!q) return reply(`❌ Please ask a question\n\nExample: .deepseek What is consciousness?`);

    await conn.sendPresenceUpdate('composing', from);
    
    const response = await axios.get(`https://api.siputzx.my.id/api/ai/deepseekr1?prompt=${encodeURIComponent(q)}&system=You+are+a+helpful+assistant.&temperature=0.7`);
    
    let answer = response.data?.data?.response || response.data?.response || JSON.stringify(response.data);
    if (answer.length > 4096) answer = answer.substring(0, 4090) + '...';

    await conn.sendPresenceUpdate('paused', from);
    reply(answer + '\n\n> 🔥 Powered by JAMALI TECH TZ');

} catch (e) {
    reply(`❌ Error: ${e.message}`);
}
});

// ===================== DUCK AI IMAGE =====================
cmd({
    pattern: "duckai",
    alias: ["duckimg", "aigen"],
    react: "🦆",
    desc: "Generate image with Duck AI",
    category: "ai"
},
async(conn, mek, m, {from, q, reply}) => {
try{
    if (!q) return reply(`❌ Please describe the image\n\nExample: .duckai a cat sitting on the moon`);

    await conn.sendPresenceUpdate('composing', from);
    
    const response = await axios.get(`https://api.siputzx.my.id/api/ai/duckaiimage?prompt=${encodeURIComponent(q)}`, {
        responseType: 'arraybuffer'
    });
    
    if (!response.data) throw new Error('No image generated');

    await conn.sendPresenceUpdate('paused', from);
    
    await conn.sendMessage(from, {
        image: Buffer.from(response.data),
        caption: `🦆 *JAMALI MD - Duck AI Generated Image*\n\nPrompt: ${q}\n\n> 🔥 Powered by JAMALI TECH TZ`
    });

} catch (e) {
    reply(`❌ Error: ${e.message}`);
}
});

// ===================== GEMINI LITE =====================
cmd({
    pattern: "gemini",
    alias: ["gemini-lite", "geminilite"],
    react: "✨",
    desc: "Google Gemini Lite AI",
    category: "ai"
},
async(conn, mek, m, {from, q, reply}) => {
try{
    if (!q) return reply(`❌ Please ask a question\n\nExample: .gemini What is the capital of France?`);

    await conn.sendPresenceUpdate('composing', from);
    
    const response = await axios.get(`https://api.siputzx.my.id/api/ai/gemini-lite?prompt=${encodeURIComponent(q)}&model=gemini-2.0-flash-lite`);
    
    let answer = response.data?.data?.response || response.data?.response || JSON.stringify(response.data);
    if (answer.length > 4096) answer = answer.substring(0, 4090) + '...';

    await conn.sendPresenceUpdate('paused', from);
    reply(answer + '\n\n> 🔥 Powered by JAMALI TECH TZ');

} catch (e) {
    reply(`❌ Error: ${e.message}`);
}
});

// ===================== GITA (BHAGAVAD GITA) =====================
cmd({
    pattern: "gita",
    alias: ["bhagavad", "gitaai"],
    react: "🕉️",
    desc: "Ask about Bhagavad Gita",
    category: "ai"
},
async(conn, mek, m, {from, q, reply}) => {
try{
    if (!q) return reply(`❌ Please ask a question\n\nExample: .gita What is karma?`);

    await conn.sendPresenceUpdate('composing', from);
    
    const response = await axios.get(`https://api.siputzx.my.id/api/ai/gita?q=${encodeURIComponent(q)}`);
    
    let answer = response.data?.data?.response || response.data?.response || JSON.stringify(response.data);
    if (answer.length > 4096) answer = answer.substring(0, 4090) + '...';

    await conn.sendPresenceUpdate('paused', from);
    reply(answer + '\n\n> 🔥 Powered by JAMALI TECH TZ');

} catch (e) {
    reply(`❌ Error: ${e.message}`);
}
});

// ===================== BIBLE AI =====================
cmd({
    pattern: "bibleai",
    alias: ["bible", "bibleq"],
    react: "📖",
    desc: "Ask questions about the Bible",
    category: "ai"
},
async(conn, mek, m, {from, q, reply}) => {
try{
    if (!q) return reply(`❌ Please ask a question\n\nExample: .bibleai What is faith?`);

    await conn.sendPresenceUpdate('composing', from);
    
    const response = await axios.get(`https://api.siputzx.my.id/api/ai/bibleai?question=${encodeURIComponent(q)}&translation=ESV`);
    
    let answer = response.data?.data?.results?.answer || response.data?.data?.answer || JSON.stringify(response.data);
    
    // Add Bible verses if available
    if (response.data?.data?.results?.sources) {
        const verses = response.data.data.results.sources
            .filter(s => s.type === 'verse')
            .slice(0, 5)
            .map(v => `• ${v.text} (${v.splitReference?.refLong || ''})`)
            .join('\n');
        
        if (verses) {
            answer += '\n\n📖 *Related Verses:*\n' + verses;
        }
    }
    
    if (answer.length > 4096) answer = answer.substring(0, 4090) + '...';

    await conn.sendPresenceUpdate('paused', from);
    reply(answer + '\n\n> 🔥 Powered by JAMALI TECH TZ');

} catch (e) {
    reply(`❌ Error: ${e.message}`);
}
});
