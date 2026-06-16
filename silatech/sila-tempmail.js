const { cmd } = require('../momy')
const axios = require('axios')

// simple in-memory store (restart pe clear ho jayega)
const tempMailStore = {}

cmd({
    pattern: "tempmail",
    alias: ["tmpmail", "mail"],
    react: "📧",
    desc: "Create temp email & check inbox",
    category: "tools",
    use: ".tempmail | .tempmail inbox",
    filename: __filename
},
async (conn, mek, m, { from, sender, args, reply }) => {
    try {

        // 📥 INBOX CHECK
        if (args[0] === "inbox") {
            const data = tempMailStore[sender]
            if (!data) {
                return reply("*❌ First create email using `.tempmail`*");
            }

            const url = `https://www.movanest.xyz/v2/tempmail/check?token=${data.token}`
            const res = await axios.get(url)

            if (!res.data.results || res.data.results.length === 0) {
                return reply("*📭 No messages yet*")
            }

            let msg = "*📬 INBOX MESSAGES*\n\n"
            res.data.results.forEach((m, i) => {
                msg +=
`*${i + 1}.*
From: ${m.from}
Subject: ${m.subject}
Message:
${m.text}

`
            })

            return reply(msg)
        }

        // 📧 CREATE TEMP MAIL
        const domainsRes = await axios.get(
            "https://www.movanest.xyz/v2/tempmail/domains"
        )

        const domains = domainsRes.data.results
        const domain = domains[Math.floor(Math.random() * domains.length)].name
        const username = "user" + Math.floor(Math.random() * 10000)

        const genUrl =
`https://www.movanest.xyz/v2/tempmail/generate?username=${username}&domain=${domain}`

        const genRes = await axios.get(genUrl)
        const email = genRes.data.results.email
        const token = genRes.data.results.token

        // save for inbox
        tempMailStore[sender] = { email, token }

        reply(
`📧 *TEMP MAIL READY*

Email:
${email}

📥 Inbox check:
.tempmail inbox

⚠️ Token is private
🔥 JAMALI MD BOT`
        )

    } catch (e) {
        console.log("TEMPMAIL ERROR:", e)
        reply("*❌ TempMail error occurred*")
    }
})
