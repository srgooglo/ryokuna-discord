import path from 'path'
import fs from 'fs'
import process from 'process'

export default {
    name: "addreply",
    aliases: ["addreply"],
    description: "Add custom reply to list",
    execute: (message, args, client, commandPrefixLenght) => {
        const fixedArgs = message.content.slice(commandPrefixLenght, message.content.length).trim().split(/ > +/)

        if (fixedArgs[0] && fixedArgs[1]) {
            try {
                let db = {}
                const dbFile = path.resolve(process.cwd(), "./customReply.json")

                if (fs.existsSync(dbFile)) {
                    db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'))
                }
                const when = fixedArgs[0]
                const reply = fixedArgs[1]

                let opts = {
                    noReply: false,
                    ignoreCases: false
                }

                if (fixedArgs[2]) {
                    const optsKeys = Object.keys(opts)
                    fixedArgs[2].split(/ +/).forEach((option) => {
                        if (optsKeys.includes(option)) {
                            opts[option] = !opts[option]
                        }
                    })
                }

                db[when] = {
                    when,
                    reply,
                    opts
                }

                global['customReplies'] = db
                fs.writeFileSync(dbFile, JSON.stringify(db))
                message.reply(`✅ Added new reply | When => " ${when} " Reply => " ${reply} "`)
            } catch (error) {
                message.reply(`An error has ocurred (⓿_⓿) > ${error}`)

            }
        } else {
            message.channel.send(`Invalid scheme!`)
        }
    }
}