const { cmd } = require('../momy');
const config = require('../config');
const axios = require('axios');
const yts = require('yt-search');

// ===================== SONG2 COMMAND =====================
cmd({
    pattern: "song2",
    alias: ["mp32", "play2", "ytmp3"],
    react: "🎵",
    desc: "Download song from YouTube (Anabot API)",
    category: "download"
},
async(conn, mek, m, { from, q, reply, quoted, myquoted }) => {
    try {
        if (!q) {
            return reply(`❌ Please provide a song name or YouTube link\n\nExample: .song2 Love yourself\nOr: .song2 https://youtu.be/xyz`);
        }

        await conn.sendPresenceUpdate('composing', from);
        
        // React
        await conn.sendMessage(from, {
            react: { text: "🎵", key: mek.key }
        });

        let videoUrl = q;
        let videoTitle = '';

        // Check if it's a direct YouTube link
        if (q.includes('youtube.com') || q.includes('youtu.be')) {
            // Extract video info using yts
            const videoId = q.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (videoId) {
                const search = await yts({ videoId });
                if (search) {
                    videoTitle = search.title;
                }
            }
        } else {
            // Search for the video
            const search = await yts(q);
            if (!search || !search.all || search.all.length === 0) {
                return reply(`❌ No results found for "${q}"`);
            }
            videoUrl = search.all[0].url;
            videoTitle = search.all[0].title;
        }

        // Download using Anabot API
        const apiUrl = `https://anabot.my.id/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=freeApikey`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.status) {
            throw new Error(data?.message || 'Failed to download');
        }

        const downloadUrl = data.result?.download?.url || data.result?.url;
        const title = data.result?.title || videoTitle || 'Unknown Title';
        const thumbnail = data.result?.thumbnail || data.result?.image;
        const duration = data.result?.duration || 'N/A';

        // Send thumbnail first (if available)
        if (thumbnail) {
            await conn.sendMessage(from, {
                image: { url: thumbnail },
                caption: `━━━━━━━━━━━━━━━━━━━━━━\n    JAMALI MD - SONG INFO    \n━━━━━━━━━━━━━━━━━━━━━━\n\n🎵 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n━━━━━━━━━━━━━━━━━━━━━━\n⬇️ *Downloading...*`
            }, { quoted: myquoted });
        }

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`
        }, { quoted: myquoted });

        // Final reaction
        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

    } catch (e) {
        console.error('Song2 Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ===================== FUNCTION VERSION (kwa matumizi ya API moja kwa moja) =====================
/*
async function youtubeMp3(url, apikey) {
  try {
    const response = await fetch(`https://anabot.my.id/api/download/ytmp3?url=${encodeURIComponent(url)}&apikey=${encodeURIComponent(apikey)}`, {
      method: 'GET'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return error;
  }
}

// Matumizi:
// youtubeMp3('https://youtu.be/t00JmxGWq4I?si=W2jlT6cYeL8oUSbA', 'freeApikey').then(console.log).catch(console.log);
*/
