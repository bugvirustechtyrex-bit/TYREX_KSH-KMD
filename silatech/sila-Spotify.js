// JAMALI MD - Spotify Audio Downloader

const { cmd, commands } = require('../momy');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { toAudio } = require('../lib/converter');

const AXIOS_DEFAULTS = {
	timeout: 60000,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Accept': 'application/json, text/plain, */*'
	}
};

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

async function downloadSpotifyAudio(spotifyUrl) {
	const apiUrl = `https://api.yupra.my.id/api/downloader/spotify?url=${encodeURIComponent(spotifyUrl)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.status && res?.data?.result?.download) {
		return {
			download: res.data.result.download,
			title: res.data.result.title || res.data.result.name,
			artist: res.data.result.artist || res.data.result.artists?.join(', '),
			thumbnail: res.data.result.image || res.data.result.cover
		};
	}
	throw new Error('Failed to get download link from Spotify');
}

async function searchSpotifyYupra(query) {
	const apiUrl = `https://api.yupra.my.id/api/search/spotify?q=${encodeURIComponent(query)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.status && res?.data?.result?.length > 0) {
		return res.data.result;
	}
	throw new Error('No search results found');
}

async function downloadAudio(audioUrl) {
	try {
		const audioResponse = await axios.get(audioUrl, {
			responseType: 'arraybuffer',
			timeout: 90000,
			maxContentLength: Infinity,
			maxBodyLength: Infinity,
			decompress: true,
			validateStatus: s => s >= 200 && s < 400,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Accept': '*/*',
				'Accept-Encoding': 'identity'
			}
		});
		return Buffer.from(audioResponse.data);
	} catch (e1) {
		const audioResponse = await axios.get(audioUrl, {
			responseType: 'stream',
			timeout: 90000,
			maxContentLength: Infinity,
			maxBodyLength: Infinity,
			validateStatus: s => s >= 200 && s < 400,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Accept': '*/*',
				'Accept-Encoding': 'identity'
			}
		});
		const chunks = [];
		await new Promise((resolve, reject) => {
			audioResponse.data.on('data', c => chunks.push(c));
			audioResponse.data.on('end', resolve);
			audioResponse.data.on('error', reject);
		});
		return Buffer.concat(chunks);
	}
}

function detectAudioFormat(buffer) {
	const firstBytes = buffer.slice(0, 12);
	const hexSignature = firstBytes.toString('hex');
	const asciiSignature = firstBytes.toString('ascii', 4, 8);

	let mimeType = 'audio/mpeg';
	let extension = 'mp3';
	let format = 'MP3';

	if (asciiSignature === 'ftyp' || hexSignature.startsWith('000000')) {
		format = 'M4A/MP4';
		mimeType = 'audio/mp4';
		extension = 'm4a';
	}
	else if (buffer.toString('ascii', 0, 3) === 'ID3' || 
	         (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0)) {
		format = 'MP3';
		mimeType = 'audio/mpeg';
		extension = 'mp3';
	}
	else if (buffer.toString('ascii', 0, 4) === 'OggS') {
		format = 'OGG/Opus';
		mimeType = 'audio/ogg; codecs=opus';
		extension = 'ogg';
	}
	else if (buffer.toString('ascii', 0, 4) === 'RIFF') {
		format = 'WAV';
		mimeType = 'audio/wav';
		extension = 'wav';
	}

	return { mimeType, extension, format };
}

// Spotify command
cmd({
	pattern: 'spotify',
	alias: ['spot', 'spoti', 'spotifyplay', 'spotmusic', 'jamalispotify'],
	react: '🎧',
	desc: 'Search and play songs from Spotify',
	category: 'downloader',
	filename: __filename
}, async (conn, mek, m, { from, sender, reply, q }) => {
	try {
		if (!q) {
			return reply(`┏━❑ JAMALI MD SPOTIFY PLAYER ━━━━━━━━━
┃ 🎧 Search & play music from Spotify
┃
┃ Use: .spotify song_name
┃
┃ Aliases:
┃ • .spot
┃ • .spotmusic
┃ • .jamalispotify
┃
┃ Examples:
┃ • .spotify Amanecer
┃ • .spot Better Hazey
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`);
		}

		// Show search progress
		const searchMsg = await conn.sendMessage(from, {
			text: `🔍 Searching Spotify for *${q}*...`
		}, { quoted: mek });

		// Search Spotify
		let results;
		try {
			results = await searchSpotifyYupra(q);
		} catch (searchErr) {
			await conn.sendMessage(from, { delete: searchMsg.key });
			return reply(`┏━❑ JAMALI MD search error ━━━━━━━━━
┃ ❌ No results found
┃ Try more specific query
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`);
		}

		if (!results || results.length === 0) {
			await conn.sendMessage(from, { delete: searchMsg.key });
			return reply(`┏━❑ JAMALI MD search ━━━━━━━━━
┃ ❌ No results found
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`);
		}

		// Use first result
		const song = results[0];

		// Build results list
		let resultsList = `┏━❑ JAMALI MD SPOTIFY SEARCH ━━━━━━\n┃\n`;
		results.slice(0, 5).forEach((r, i) => {
			const artists = r.artists?.map(a => a.name)?.join(', ') || 'Unknown';
			resultsList += `┃ 0${i + 1} • ${r.title?.substring(0, 35)}\n┃    🎤 ${artists.substring(0, 35)}\n┃\n`;
		});
		resultsList += `┗━━━━━━━━━━━━━━━━━━━━━\n\n🎧 Downloading top result...`;

		const artistName = song.artists?.map(a => a.name)?.join(', ') || 'Unknown Artist';

		await conn.sendMessage(from, {
			text: resultsList,
			contextInfo: {
				mentionedJid: [sender],
				externalAdReply: {
					title: song.title,
					body: artistName,
					mediaType: 'IMAGE',
					renderLargerThumbnail: true,
					thumbnail: song.thumbnail_url
				}
			}
		}, { quoted: mek });

		// Download audio using direct download API
		try {
			const downloadData = await downloadSpotifyAudio(song.url);
			
			if (!downloadData.download) {
				throw new Error('No download URL available');
			}

			// Download to buffer
			const audioBuffer = await downloadAudio(downloadData.download);

			if (!audioBuffer || audioBuffer.length === 0) {
				throw new Error('Downloaded buffer is empty');
			}

			// Detect format
			const { mimeType, extension, format } = detectAudioFormat(audioBuffer);

			// Convert to MP3 if needed
			let finalBuffer = audioBuffer;
			let finalMimeType = 'audio/mpeg';
			let finalExtension = 'mp3';

			if (extension !== 'mp3') {
				try {
					finalBuffer = await toAudio(audioBuffer, extension);
					if (!finalBuffer || finalBuffer.length === 0) {
						throw new Error('Conversion returned empty');
					}
					finalMimeType = 'audio/mpeg';
					finalExtension = 'mp3';
				} catch (convErr) {
					finalBuffer = audioBuffer;
					finalMimeType = mimeType;
					finalExtension = extension;
				}
			}

			// Send audio
			await conn.sendMessage(from, {
				audio: finalBuffer,
				mimetype: finalMimeType,
				fileName: `${downloadData.title || song.title || 'song'}.${finalExtension}`,
				ptt: false,
				contextInfo: {
					externalAdReply: {
						title: downloadData.title || song.title,
						body: downloadData.artist || artistName,
						mediaType: 'IMAGE',
						thumbnail: downloadData.thumbnail || song.thumbnail_url
					}
				}
			}, { quoted: mek });

			// Cleanup
			try {
				const tempDir = path.join(__dirname, '../temp');
				if (fs.existsSync(tempDir)) {
					const files = fs.readdirSync(tempDir);
					const now = Date.now();
					files.forEach(file => {
						const filePath = path.join(tempDir, file);
						try {
							const stats = fs.statSync(filePath);
							if (now - stats.mtimeMs > 10000) {
								if (file.endsWith('.mp3') || file.endsWith('.m4a')) {
									fs.unlinkSync(filePath);
								}
							}
						} catch (e) {
							// Ignore
						}
					});
				}
			} catch (cleanupErr) {
				// Ignore
			}

		} catch (downloadErr) {
			console.error('Download error:', downloadErr);
			reply(`┏━❑ JAMALI MD download error ━━━━━━━━━
┃ ❌ Failed to download
┃ Please try again
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`, { quoted: fakevCard });
		}

	} catch (err) {
		console.error('Spotify command error:', err);
		reply(`┏━❑ JAMALI MD error ━━━━━━━━━
┃ ❌ Something went wrong
┃ Try again later
┗━━━━━━━━━━━━━━━━━━━━

> 🔥 Powered by JAMALI TECH TZ`, { quoted: fakevCard });
	}
});
