// JAMALI MD - Change Bot Profile Picture (Owner only)

const { cmd } = require('../momy')
const fs = require('fs')
const path = require('path')
const { downloadContentFromMessage } = require('@whiskeysockets/baileys')

cmd({
    pattern: "pp",
    alias: ["setpp", "setbotpp", "setprofile"],
    react: "😇",
    desc: "Change bot profile picture (Owner only)",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isCreator, reply, myquoted }) => {
    try {
        if (!isCreator)
            return reply("🔒 Owner only command")

        // Check if message is quoted
        if (!myquoted || !m.quoted) {
            return reply("Reply to an image with .pp\nExample: Reply to image + .pp")
        }

        // Get the quoted message
        let msg = m.quoted.message

        // Check for view-once messages
        if (msg?.viewOnceMessageV2?.message) {
            msg = msg.viewOnceMessageV2.message
        } else if (msg?.viewOnceMessageV2Extension?.message) {
            msg = msg.viewOnceMessageV2Extension.message
        } else if (msg?.viewOnceMessage?.message) {
            msg = msg.viewOnceMessage.message
        }

        // Check if it's an image
        const messageType = Object.keys(msg)[0]
        if (messageType !== "imageMessage") {
            return reply("❌ Only images can be used for profile picture")
        }

        await reply("📥 Downloading image...")

        // Download image
        const imageBuffer = await m.quoted.download()
        
        if (!imageBuffer || imageBuffer.length === 0) {
            return reply("❌ Failed to download image")
        }

        // Create temp directory if it doesn't exist
        const tmpDir = "./tmp"
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true })
        }

        // Save image temporarily
        const tempFile = path.join(tmpDir, `profile_${Date.now()}.jpg`)
        fs.writeFileSync(tempFile, imageBuffer)

        // Update bot profile picture
        await reply("🔄 Updating profile picture...")
        await conn.updateProfilePicture(conn.user.id, { url: tempFile })

        // Clean up temp file
        fs.unlinkSync(tempFile)

        // Send success message
        await reply("✅ Bot profile picture updated successfully!\n\n> 🔥 Powered by JAMALI TECH TZ")
        await m.react("✅")

    } catch (error) {
        console.error("PP command error:", error)
        
        // Clean up temp file if it exists
        const tmpDir = "./tmp"
        if (fs.existsSync(tmpDir)) {
            const files = fs.readdirSync(tmpDir).filter(f => f.startsWith('profile_'))
            files.forEach(file => {
                try {
                    fs.unlinkSync(path.join(tmpDir, file))
                } catch (e) {}
            })
        }
        
        if (error.message.includes("rate-limited")) {
            await reply("❌ Rate limited. Please try again later\n\n> 🔥 Powered by JAMALI TECH TZ")
        } else if (error.message.includes("not authorized")) {
            await reply("❌ Bot is not authorized to change profile picture\n\n> 🔥 Powered by JAMALI TECH TZ")
        } else {
            await reply("❌ Failed to update profile picture\n\n> 🔥 Powered by JAMALI TECH TZ")
        }
        
        await m.react("❌")
    }
})
