import path from 'path'
import fs from 'fs'
import process from 'process'

export default {
    name: "removereply",
    aliases: ["removereply"],
    description: "Remove custom reply from list",
    execute: (message, args) => {
        if (args[0]) {
            try {
                let db = {}
                const dbFile = path.resolve(process.cwd(), "./customReply.json")

                if (fs.existsSync(dbFile)) {
                    db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'))
                }
            
                delete db[args[0]]
                
                global['customReplies'] = db
                fs.writeFileSync(dbFile, JSON.stringify(db))
                message.reply(`✅ Removed reply | " ${args[0]} "`)
            } catch (error) {
                message.reply(`An error has ocurred (⓿_⓿) > ${error}`)
            }
        } else {
            message.channel.send(`Invalid scheme!`)
        }
    }
}