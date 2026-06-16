// JAMALI MD - Change Group Profile Picture

const { cmd } = require('../momy')
const fs = require('fs')
const axios = require('axios')
const { isUrl } = require('../lib/functions')
const { downloadContentFromMessage } = require('@whiskeysockets/baileys')

cmd({
    pattern: "grouppic",
    alias: ["setgpp", "setgrouppic", "groupdp", "gpp"],
    react: "🖼️",
    desc: "Change group profile picture",
    category: "group",
    use: ".grouppic (reply image / image url)",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, reply }) => {
    try {
        if (!isGroup)
            return reply("*❌ This command only works in groups*")

        if (!isAdmins)
            return reply("*❌ Only group admins can use this command*")

        if (!isBotAdmins)
            return reply("*❌ Please make the bot an admin first*")

        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ""
        let imagePath

        // tmp folder
        const tmpDir = "./tmp"
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

        // 🖼️ Case 1: Reply / sent image
        if (mime.startsWith("image/")) {
            const stream = await downloadContentFromMessage(quoted.msg, "image")
            let buffer = Buffer.from([])
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

            imagePath = `${tmpDir}/gpp_${Date.now()}.jpg`
            fs.writeFileSync(imagePath, buffer)
        }

        // 🌐 Case 2: Image URL
        else if (args[0] && isUrl(args[0])) {
            const res = await axios.get(args[0], { responseType: "arraybuffer" })
            imagePath = `${tmpDir}/gpp_${Date.now()}.jpg`
            fs.writeFileSync(imagePath, res.data)
        }

        else {
            return reply(
                "*📸 To change group profile picture:*\n\n" +
                "• Reply to an image\n" +
                "• Or provide an image URL\n\n" +
                "*Example:*\n.grouppic https://image-url\n\n" +
                "> 🔥 Powered by JAMALI TECH TZ"
            )
        }

        // update group profile picture
        await conn.updateProfilePicture(from, fs.readFileSync(imagePath))

        fs.unlinkSync(imagePath)

        reply("*✅ Group profile picture updated successfully*\n\n> 🔥 Powered by JAMALI TECH TZ")

    } catch (e) {
        console.log("GROUPPIC ERROR:", e)
        reply("*❌ Failed to update group profile picture*\n\n> 🔥 Powered by JAMALI TECH TZ")
    }
})
