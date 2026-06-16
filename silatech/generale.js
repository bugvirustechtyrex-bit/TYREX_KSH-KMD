const { cmd, commands } = require('../momy');
const config = require('../config');
const os = require('os');

// =================================================================
// ⏱️ COMMAND UPTIME
// =================================================================
cmd({
    pattern: "uptime",
    alias: ["speed", "ping"],
    desc: "check bot latency and system resources",
    category: "general",
    react: "💀"
},
async(conn, mek, m, { from, reply, myquoted }) => {
    try {
        const start = Date.now();
        
        // Initial message
        const msg = await conn.sendMessage(from, { text: 'testing...' }, { quoted: myquoted });
        
        const end = Date.now();
        const latency = end - start;
        
        // Memory calculation
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
        const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
        const usedMem = (totalMem - freeMem).toFixed(0);

        // Uptime calculation
        const uptime = () => {
            let sec = process.uptime();
            let h = Math.floor(sec / 3600);
            let mn = Math.floor((sec % 3600) / 60);
            let s = Math.floor(sec % 60);
            return `${h}h ${mn}m ${s}s`;
        };

        // Final message
        const uptimeMsg = `╭━━【 ⚡ UPTIME INFO 】━━━━╮
│ ⚡ response: *${latency} ms*
│ ⏱️ uptime: *${uptime()}*
│ 🖥️ platform: *${os.platform()}*
│ 💾 memory: *${usedMem}mb / ${totalMem}mb*
│ 📊 cpu: *${os.cpus().length} cores*
╰━━━━━━━━━━━━━━━━━━━━╯

> 🔥 Powered by JAMALI TECH TZ`;

        // Edit message
        await conn.sendMessage(from, { text: uptimeMsg, edit: msg.key });

    } catch (e) {
        reply("*error checking uptime*");
    }
});


// =================================================================
// 👑 COMMAND OWNER
// =================================================================
cmd({
    pattern: "owner",
    desc: "contact bot owner",
    category: "general",
    react: "💀"
},
async(conn, mek, m, { from, myquoted }) => {
    const ownerNumber = config.OWNER_NUMBER || "255784062158";
    
    const vcard = 'BEGIN:VCARD\n' +
                  'VERSION:3.0\n' +
                  'FN:JAMALI TECH TZ (owner)\n' +
                  'ORG:JAMALI MD BOT;\n' +
                  `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` +
                  'END:VCARD';

    await conn.sendMessage(from, {
        contacts: {
            displayName: 'JAMALI TECH TZ',
            contacts: [{ vcard }]
        }
    }, { quoted: myquoted });
});
