// JAMALI MD - AI Copilot & Advanced AI Commands

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
	timeout: 30000,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Accept': 'application/json'
	}
};

async function getCopilotResponse(query) {
	const apiUrl = `https://api.yupra.my.id/api/ai/copilot?text=${encodeURIComponent(query)}`;
	const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
	if (res?.data?.status && res?.data?.result?.response) {
		return res.data.result.response;
	}
	throw new Error('No response from AI');
}

cmd({
	pattern: 'copilot',
	alias: ['ai2', 'jamaliai', 'ask', 'query', 'gpt', 'jamalicop'],
	react: '🤖',
	desc: 'Ask AI Copilot anything',
	category: 'main',
	filename: __filename
},
async (conn, mek, m, { from, sender, reply, q }) => {
	try {
		if (!q) {
			return reply(`┏━❑ JAMALI MD AI COPILOT ━━━━━━━━━
┃ 🤖 Ask me anything
┃
┃ Use: .copilot your question
┃
┃ Aliases:
┃ • .ai2
┃ • .jamaliai
┃ • .ask
┃ • .gpt
┃ • .jamalicop
┃
┃ Examples:
┃ • .copilot what is economics
┃ • .jamaliai how to learn programming
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`);
		}

		// Show thinking message
		const thinkMsg = await conn.sendMessage(from, {
			text: `🤔 Thinking about your question...`
		}, { quoted: mek });

		let response;
		try {
			response = await getCopilotResponse(q);
		} catch (apiErr) {
			console.error('API Error:', apiErr);
			await conn.sendMessage(from, { delete: thinkMsg.key });
			return reply(`┏━❑ AI ERROR ━━━━━━━━━
┃ ❌ Yupra AI API error
┃ Try again later
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`, { quoted: fakevCard });
		}

		if (!response) {
			await conn.sendMessage(from, { delete: thinkMsg.key });
			return reply(`┏━❑ AI RESPONSE ━━━━━━━━━
┃ ❌ No response received
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`);
		}

		// Format response
		let formattedResponse = response;
		if (response.length > 4096) {
			formattedResponse = response.substring(0, 4093) + '...';
		}

		const finalMsg = `┏━❑ JAMALI MD COPILOT ━━━━━━━━━
┃ 🤖 Here's my answer:
${formattedResponse.split('\n').map(line => `┃ ${line}`).join('\n')}

┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`;

		// Delete thinking message and send response
		await conn.sendMessage(from, { delete: thinkMsg.key });
		await conn.sendMessage(from, {
			text: finalMsg,
			contextInfo: getContextInfo(sender)
		}, { quoted: fakevCard });

	} catch (err) {
		console.error('Copilot error:', err);
		reply(`┏━❑ AI ERROR ━━━━━━━━━
┃ ❌ Error processing request
┃ Try again
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`, { quoted: fakevCard });
	}
});

// Advanced copilot command with more options
cmd({
	pattern: 'aix',
	alias: ['copilotx', 'aiexplain', 'explain'],
	react: '🧠',
	desc: 'Advanced AI explanation',
	category: 'main',
	filename: __filename
},
async (conn, mek, m, { from, sender, reply, q }) => {
	try {
		if (!q) {
			return reply(`┏━❑ AI EXPLAIN ━━━━━━━━━
┃ 🧠 Get detailed explanation
┃
┃ Use: .aix your question
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`);
		}

		const prompt = `Explain this in detail: ${q}`;

		const loadMsg = await conn.sendMessage(from, {
			text: `⏳ Loading explanation...`
		}, { quoted: mek });

		let response;
		try {
			response = await getCopilotResponse(prompt);
		} catch (apiErr) {
			console.error('API Error:', apiErr);
			await conn.sendMessage(from, { delete: loadMsg.key });
			return reply(`❌ API error\n\n> 🔥 Powered by JAMALI TECH TZ`, { quoted: fakevCard });
		}

		if (!response) {
			await conn.sendMessage(from, { delete: loadMsg.key });
			return reply(`❌ No results`);
		}

		const explainMsg = `┏━❑ DETAILED EXPLANATION ━━━━━━\n┃\n${response.substring(0, 4000).split('\n').map(line => `┃ ${line}`).join('\n')}\n┃\n┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`;

		await conn.sendMessage(from, { delete: loadMsg.key });
		await conn.sendMessage(from, {
			text: explainMsg,
			contextInfo: getContextInfo(sender)
		}, { quoted: fakevCard });

	} catch (err) {
		console.error('AIX error:', err);
		reply(`❌ Error processing\n\n> 🔥 Powered by JAMALI TECH TZ`, { quoted: fakevCard });
	}
});
