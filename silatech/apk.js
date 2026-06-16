const { cmd } = require('../momy');
const axios = require('axios');

cmd({
  pattern: "apk",
  alias: ["app", "playstore", "application"],
  react: "📱",
  desc: "download apk via aptoide",
  category: "download",
  use: ".apk <name>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q, myquoted }) => {
  try {
    if (!q) return reply("*provide app name*\nexample: .apk whatsapp");

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}/limit=1`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.datalist || !data.datalist.list.length) {
      return reply("*app not found*");
    }

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2);

    let caption = `╭━━【 📱 APK DOWNLOAD 】━━━━╮
│ 🏷️ name: *${app.name}*
│ 📦 size: *${appSize} mb*
│ 📦 package: *${app.package}*
│ 🔢 version: *${app.file.vername}*
│ 📥 downloads: *${app.downloads}*
╰━━━━━━━━━━━━━━━━━━━━╯

*downloading...*

> 🔥 Powered by JAMALI TECH TZ`;

    await conn.sendMessage(from, { image: { url: app.icon }, caption }, { quoted: myquoted });

    await conn.sendMessage(from, {
      document: { url: app.file.path || app.file.path_alt },
      mimetype: "application/vnd.android.package-archive",
      fileName: `${app.name}.apk`
    }, { quoted: myquoted });

    await m.react("✅");
  } catch (err) {
    reply("*error downloading app*");
    console.error(err);
  }
});
