const { cmd } = require('../momy');
const config = require('../config');
const axios = require('axios');

// Footer constant
const FOOTER = `> 🔥 Powered by JAMALI TECH TZ`;

// Helper: Send formatted message
const sendFormatted = async (reply, title, content) => {
    const msg = `━━━━━━━━━━━━━━━━━━━━━━\n    ${title}    \n━━━━━━━━━━━━━━━━━━━━━━\n\n${content}\n\n━━━━━━━━━━━━━━━━━━━━━━\n${FOOTER}`;
    reply(msg);
};

// ===================== ANIME POPULAR =====================
cmd({
    pattern: "animepopular",
    alias: ["anipop", "popularanime"],
    react: "🔥",
    desc: "Get popular anime list",
    category: "anime"
},
async(conn, mek, m, { from, q, reply }) => {
    try {
        await conn.sendPresenceUpdate('composing', from);
        const response = await axios.get('https://api.siputzx.my.id/api/anime/anichin-popular', { timeout: 10000 });
        if (!response.data?.status) throw new Error('Failed to fetch data');
        
        const data = response.data.data;
        let content = `⭐ *WEEKLY*\n`;
        data.weekly.forEach((item, i) => {
            content += `${i+1}. *${item.title}*\n   🎭 ${item.genres.join(', ')}`;
            if (item.rating) content += `\n   ⭐ Rating: ${item.rating}`;
            content += `\n\n`;
        });
        
        content += `💡 Use .animatedetail <url> for details`;
        await sendFormatted(reply, 'POPULAR ANIME', content);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// ===================== ANIME DETAIL =====================
cmd({
    pattern: "animatedetail",
    alias: ["anidetail", "animeinfo"],
    react: "ℹ️",
    desc: "Get anime details from URL",
    category: "anime"
},
async(conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply(`❌ Please provide an anime URL\n\nExample: .animatedetail https://anichin.cafe/renegade-immortal-episode-69-subtitle-indonesia/`);
        
        await conn.sendPresenceUpdate('composing', from);
        const response = await axios.get(`https://api.siputzx.my.id/api/anime/anichin-detail?url=${encodeURIComponent(q)}`, { timeout: 10000 });
        if (!response.data?.status) throw new Error('Failed to fetch details');
        
        const data = response.data.data;
        let content = `📺 *Title:* ${data.title}\n`;
        if (data.alternativeTitles) content += `📌 *Alt:* ${data.alternativeTitles}\n`;
        if (data.rating) content += `⭐ *Rating:* ${data.rating}\n`;
        if (data.status) content += `📊 *Status:* ${data.status}\n`;
        if (data.type) content += `🎬 *Type:* ${data.type}\n`;
        if (data.country) content += `🌍 *Country:* ${data.country}\n`;
        if (data.network) content += `📡 *Network:* ${data.network}\n`;
        if (data.studio) content += `🎨 *Studio:* ${data.studio}\n`;
        if (data.released) content += `📅 *Released:* ${data.released}\n`;
        if (data.duration) content += `⏱️ *Duration:* ${data.duration}\n`;
        if (data.genres?.length) content += `🎭 *Genres:* ${data.genres.join(', ')}\n`;
        if (data.synopsis) content += `\n📝 *Synopsis:*\n${data.synopsis}\n`;
        content += `\n🔗 URL: ${q}`;
        
        await sendFormatted(reply, 'ANIME DETAILS', content);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// ===================== ANIME EPISODES =====================
cmd({
    pattern: "episodes",
    alias: ["aniep", "animeepisodes"],
    react: "📺",
    desc: "Get anime episodes list",
    category: "anime"
},
async(conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply(`❌ Please provide an anime URL\n\nExample: .episodes https://anichin.cafe/renegade-immortal/`);
        
        await conn.sendPresenceUpdate('composing', from);
        const response = await axios.get(`https://api.siputzx.my.id/api/anime/anichin-episode?url=${encodeURIComponent(q)}`, { timeout: 10000 });
        if (!response.data?.status) throw new Error('Failed to fetch episodes');
        
        const episodes = response.data.data;
        let content = '';
        episodes.slice(0, 20).forEach((ep, i) => {
            content += `${i+1}. ${ep.title || `Episode ${ep.episode}`}\n`;
        });
        if (episodes.length > 20) content += `\n... and ${episodes.length - 20} more episodes\n`;
        content += `\n💡 Use .animatedownload <episode_url> to get download links`;
        
        await sendFormatted(reply, 'ANIME EPISODES', content);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// ===================== ANIME SEARCH =====================
cmd({
    pattern: "animesearch",
    alias: ["anisearch", "searchanime"],
    react: "🔍",
    desc: "Search for anime",
    category: "anime"
},
async(conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply(`❌ Please provide a search query\n\nExample: .animesearch naga`);
        
        await conn.sendPresenceUpdate('composing', from);
        const response = await axios.get(`https://api.siputzx.my.id/api/anime/anichin-search?query=${encodeURIComponent(q)}`, { timeout: 10000 });
        if (!response.data?.status) throw new Error('No results found');
        
        const results = response.data.data;
        let content = `🔍 *Query:* ${q.toUpperCase()}\n\n`;
        results.slice(0, 10).forEach((item, i) => {
            content += `${i+1}. *${item.title}*\n   🎬 Type: ${item.type} | 📊 Status: ${item.status}\n   🔗 Link: ${item.link}\n\n`;
        });
        if (results.length > 10) content += `... and ${results.length - 10} more results\n`;
        content += `💡 Use .animatedetail <url> for details`;
        
        await sendFormatted(reply, 'SEARCH RESULTS', content);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// ===================== ANIME DOWNLOAD =====================
cmd({
    pattern: "animatedownload",
    alias: ["anidownload", "anidl"],
    react: "⬇️",
    desc: "Get anime download links",
    category: "anime"
},
async(conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply(`❌ Please provide an episode URL\n\nExample: .animatedownload https://anichin.cafe/renegade-immortal-episode-69-subtitle-indonesia/`);
        
        await conn.sendPresenceUpdate('composing', from);
        const response = await axios.get(`https://api.siputzx.my.id/api/anime/anichin-download?url=${encodeURIComponent(q)}`, { timeout: 10000 });
        if (!response.data?.status) throw new Error('No download links found');
        
        const downloads = response.data.data;
        let content = '';
        downloads.forEach(item => {
            content += `📀 *${item.resolution}*\n`;
            item.links.forEach(link => {
                content += `   • ${link.host}: ${link.link}\n`;
            });
            content += `\n`;
        });
        
        await sendFormatted(reply, 'DOWNLOAD LINKS', content);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// ===================== ANIME QUOTES =====================
cmd({
    pattern: "animequotes",
    alias: ["aniquote", "quoteanime"],
    react: "💬",
    desc: "Get random anime quotes",
    category: "anime"
},
async(conn, mek, m, { from, q, reply }) => {
    try {
        const query = q || 'fate';
        await conn.sendPresenceUpdate('composing', from);
        const response = await axios.get(`https://api.siputzx.my.id/api/s/animequotes?query=${encodeURIComponent(query)}`, { timeout: 10000 });
        if (!response.data?.status) throw new Error('No quotes found');
        
        const quotes = response.data.data;
        let content = '';
        quotes.slice(0, 5).forEach((quote, i) => {
            content += `"${quote.quotes}"\n— *${quote.karakter}* (${quote.anime})`;
            if (quote.episode) content += ` 📺 ${quote.episode}`;
            content += `\n\n`;
        });
        content += `💡 Try .animequotes <anime_name> for more specific quotes`;
        
        await sendFormatted(reply, `ANIME QUOTES (${query.toUpperCase()})`, content);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});
