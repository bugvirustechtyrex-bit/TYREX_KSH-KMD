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

const getContextInfo = (sender) => {
    return {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425061263455@newsletter',
            newsletterName: 'JAMALI MD',
            serverMessageId: 143,
        },
    };
};

const AXIOS_DEFAULTS = {
	timeout: 45000,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Accept': 'application/json'
	}
};

// Main think command
cmd({
    pattern: "think",
    alias: ["copilot-think", "deepthink", "reasoning", "analyze", "consider", "ponder"],
    react: "🧠",
    desc: "Deep AI thinking and analysis",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, q, l }) => {
    try {
        if (!q || !q.trim()) {
            return await conn.sendMessage(from, {
                text: `┏━❑ DEEP AI THINKER ━━━━━━━━━
┃ 🧠 Analyze your questions deeply
┃
┃ Use: .think your question
┃
┃ Aliases:
┃ • .think
┃ • .deepthink
┃ • .reasoning
┃ • .analyze
┃
┃ Examples:
┃ • .think Is AI a consciousness?
┃ • .analyze How light affects plants
┗━━━━━━━━━━━━━━━━━━━━`,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });
        }

        // Show thinking indicator
        const thinkMsg = await conn.sendMessage(from, {
            text: `🧠 Deep thinking...\n⏳ Please wait for analysis...`
        }, { quoted: mek });

        try {
            // Call Copilot Think API
            const apiUrl = `https://api.yupra.my.id/api/ai/copilot-think?text=${encodeURIComponent(q.trim())}`;
            const response = await axios.get(apiUrl, AXIOS_DEFAULTS);

            if (!response.data) {
                throw new Error('No response from API');
            }

            let aiResponse = response.data.response || response.data.result || response.data.data || response.data.message || JSON.stringify(response.data);

            // Truncate if too long
            if (aiResponse.length > 4096) {
                aiResponse = aiResponse.substring(0, 4090) + '...';
            }

            // Format with better styling
            const formattedResponse = aiResponse
                .split('\n')
                .map(line => `┃ ${line}`)
                .join('\n');

            const finalMsg = `┏━❑ AI DEEP ANALYSIS ━━━━━━━━━

${formattedResponse}
`;

            // Delete thinking message
            await conn.sendMessage(from, { delete: thinkMsg.key });

            // Send response
            await conn.sendMessage(from, {
                text: finalMsg,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });

        } catch (apiErr) {
            console.error('API Error:', apiErr);
            await conn.sendMessage(from, { delete: thinkMsg.key });
            
            let errorMsg = '❌ AI ANALYSIS ERROR';
            
            if (apiErr.response?.status === 429) {
                errorMsg = '❌ Rate limited - wait a minute';
            } else if (apiErr.response?.status === 500) {
                errorMsg = '❌ AI malfunctioning';
            } else if (apiErr.code === 'ECONNABORTED') {
                errorMsg = '❌ Request timed out';
            }

            return reply(errorMsg, { quoted: fakevCard });
        }

    } catch (e) {
        console.error('Think command error:', e);
        reply(`❌ ANALYSIS ERROR\n\nTry again later`, { quoted: fakevCard });
        if (l) l(e);
    }
});

// Multi-step reasoning command
cmd({
    pattern: "reason",
    alias: ["logic", "explain", "breakdown", "steps"],
    react: "🔍",
    desc: "Step-by-step reasoning and logic",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, q, l }) => {
    try {
        if (!q || !q.trim()) {
            return reply(`┏━❑ STEP-BY-STEP REASONING ━━━━━━━━━
┃ 🔍 Analyze your complex question
┃
┃ Use: .reason your question
┗━━━━━━━━━━━━━━━━━━━━`, { quoted: fakevCard });
        }

        const loadMsg = await conn.sendMessage(from, {
            text: `🔍 Analyzing...\n⏳ Breaking down steps...`
        }, { quoted: mek });

        try {
            const reasonPrompt = `Explain this step by step with clear reasoning: ${q.trim()}`;
            const apiUrl = `https://api.yupra.my.id/api/ai/copilot-think?text=${encodeURIComponent(reasonPrompt)}`;
            const response = await axios.get(apiUrl, AXIOS_DEFAULTS);

            if (!response.data) {
                throw new Error('No response from API');
            }

            let aiResponse = response.data.response || response.data.result || response.data.data || response.data.message || JSON.stringify(response.data);

            // Truncate if too long
            if (aiResponse.length > 4096) {
                aiResponse = aiResponse.substring(0, 4090) + '...';
            }

            const formattedResponse = aiResponse
                .split('\n')
                .map(line => `┃ ${line}`)
                .join('\n');

            const finalMsg = `┏━❑ STEP-BY-STEP ANALYSIS ━━━━━━
┃
${formattedResponse}
┃
┗━━━━━━━━━━━━━━━━━━━━`;

            await conn.sendMessage(from, { delete: loadMsg.key });

            await conn.sendMessage(from, {
                text: finalMsg,
                contextInfo: getContextInfo(sender)
            }, { quoted: fakevCard });

        } catch (apiErr) {
            console.error('API Error:', apiErr);
            await conn.sendMessage(from, { delete: loadMsg.key });
            return reply(`❌ ANALYSIS ERROR\nTry again`, { quoted: fakevCard });
        }

    } catch (e) {
        console.error('Reason command error:', e);
        reply(`❌ ERROR occurred`, { quoted: fakevCard });
        if (l) l(e);
    }
});
