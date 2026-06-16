const { cmd } = require('../momy');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// JAMALI MD - Facebook Video Downloader

cmd({
    pattern: "fb2",
    alias: ["facebook2", "fbdl2"],
    desc: "download facebook video",
    category: "media",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, myquoted }) => {
    try {
        const text = mek.message?.conversation || mek.message?.extendedTextMessage?.text || args.join(" ");
        
        if (!text || text.trim().length < 2) {
            return reply("*FACEBOOK DOWNLOADER*\n\n*USAGE:* .fb facebook_url\n*EXAMPLE:* .fb https://fb.watch/xxx\n\n*🔥 Powered by JAMALI TECH TZ*");
        }

        // Extract URL from command
        const url = text.replace(/^\.(fb|facebook|fbdl)\s+/i, "").trim();
        
        if (!url) {
            return reply("*Please provide a Facebook link*");
        }

        // Validate Facebook URL
        const facebookPatterns = [
            /https?:\/\/(?:www\.|m\.)?facebook\.com\//,
            /https?:\/\/(?:www\.)?fb\.watch\//,
            /https?:\/\/(?:www\.)?facebook\.com\/watch\//,
            /https?:\/\/(?:www\.)?fb\.com\//
        ];

        const isValidUrl = facebookPatterns.some(pattern => pattern.test(url));
        
        if (!isValidUrl) {
            return reply("*That is not a valid Facebook link*");
        }

        await reply("*🔍 Downloading Facebook video...*");

        // Resolve share/short URLs to their final destination first
        let resolvedUrl = url;
        try {
            const res = await axios.get(url, { 
                timeout: 20000, 
                maxRedirects: 10, 
                headers: { 'User-Agent': 'Mozilla/5.0' } 
            });
            if (res?.request?.res?.responseUrl) {
                resolvedUrl = res.request.res.responseUrl;
            }
        } catch (e) {
            // ignore resolution errors; use original url
            console.log("URL resolution failed:", e.message);
        }

        // Helper to call API with retries and variants
        async function fetchFromApi(u) {
            const apiUrl = `https://api.princetechn.com/api/download/facebook?apikey=prince&url=${encodeURIComponent(u)}`;
            return axios.get(apiUrl, {
                timeout: 40000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*'
                },
                maxRedirects: 5,
                validateStatus: s => s >= 200 && s < 500
            });
        }

        // Try resolved URL, then fallback to original URL
        let response;
        try {
            response = await fetchFromApi(resolvedUrl);
            if (!response || response.status >= 400 || !response.data) throw new Error('bad');
        } catch (e) {
            console.log("First API call failed, trying original URL");
            try {
                response = await fetchFromApi(url);
            } catch (err) {
                console.log("Second API call failed:", err.message);
                throw err;
            }
        }

        const data = response.data;

        if (!data || data.status !== 200 || !data.success || !data.result) {
            return reply("*❌ Sorry, the API did not return valid data*");
        }

        const fbvid = data.result.hd_video || data.result.sd_video;

        if (!fbvid) {
            return reply("*❌ Wrong Facebook data. Please ensure the video exists*");
        }

        // Create temp directory if it doesn't exist
        const tmpDir = path.join(__dirname, '../temp');
        await fs.ensureDir(tmpDir);

        // Generate temp file path
        const tempFile = path.join(tmpDir, `fb_${Date.now()}.mp4`);

        try {
            // Download the video
            const videoResponse = await axios({
                method: 'GET',
                url: fbvid,
                responseType: 'stream',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Range': 'bytes=0-',
                    'Connection': 'keep-alive',
                    'Referer': 'https://www.facebook.com/'
                }
            });

            const writer = fs.createWriteStream(tempFile);
            videoResponse.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Check if file was downloaded successfully
            if (!(await fs.pathExists(tempFile)) || (await fs.stat(tempFile)).size === 0) {
                throw new Error('Failed to download video');
            }

            // Send the video
            const caption = `╭━━【 📥 FACEBOOK 】━━━╮
│ 📥 Downloaded successfully
│ 📹 Quality: ${data.result.hd_video ? "HD" : "SD"}
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;

            await conn.sendMessage(from, {
                video: { url: tempFile },
                mimetype: "video/mp4",
                caption: caption
            }, { quoted: myquoted });

            // Clean up temp file after sending
            setTimeout(async () => {
                try {
                    await fs.unlink(tempFile);
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError.message);
                }
            }, 5000);

            await m.react("✅");

        } catch (downloadError) {
            console.error('Video download error:', downloadError);
            
            // Try sending via URL directly
            try {
                const caption = `╭━━【 📥 FACEBOOK 】━━━╮
│ 📥 Downloaded successfully
│ 📹 Quality: ${data.result.hd_video ? "HD" : "SD"}
╰━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;

                await conn.sendMessage(from, {
                    video: { url: fbvid },
                    mimetype: "video/mp4",
                    caption: caption
                }, { quoted: myquoted });
                
                await m.react("✅");
                
            } catch (urlError) {
                console.error('URL send error:', urlError);
                reply("*❌ Failed to download Facebook video*");
                await m.react("❌");
            }
        }

    } catch (error) {
        console.error('Error in Facebook command:', error);
        reply("*❌ Error downloading Facebook video*");
        await m.react("❌");
    }
});
