import path from 'path'
import fs from 'fs'
import process from 'process'

export default {
    name: "trigger",
    aliases: ["trigger"],
    description: "(⓿_⓿)",
    execute: (message, args, client, author, commandPrefixLenght) => {
        const fixedArgs = message.content.slice(commandPrefixLenght, message.content.length).trim().split(/ > +/)
        const isAdmin = message.member.hasPermission('ADMINISTRATOR')
   
        if (fixedArgs[0] && fixedArgs[1]) {
            try {
                let opts = {
                    authorLock: false,
                    adminLock: false,
                    noReply: false
                }
                
                let db = {}
                const dbFile = path.resolve(process.cwd(), "./userTriggers.json")

                if (fs.existsSync(dbFile)) {
                    db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'))
                }

                const action = fixedArgs[0]
                const when = fixedArgs[1]
                const reply = fixedArgs[2]
                let options = []

                if (fixedArgs[3]) {
                    options = fixedArgs[3].split(/ +/)
                }
                
                // TODO: Support nicknames
                console.log(options)

                if (options.includes("adminLock") && isAdmin) {
                    opts.adminLock = !opts.adminLock
                }
                if (options.includes("authorLock")) {
                    opts.authorLock = author.username
                }
                if (options.includes("noReply")) {
                    opts.noReply = !opts.noReply
                }

                switch (action) {
                    case "remove":{
                        if (!db[when]) {
                            return message.reply(`⛔ Sorry but you cant delete something that not exist ผ(•̀_•́ผ)`)
                        }
                        if (db[when].opts.adminLock && !isAdmin) {
                            return message.reply(`⛔ Sorry but this trigger is locked for only admins can modify`)
                        }
                        if (db[when].opts.authorLock && !isAdmin && db[when].opts.authorLock !== author.username) {
                            return message.reply(`⛔ Sorry but this trigger is locked for only admins/author can modify`)
                        }
                        delete db[when]
                        message.reply(`🗑 Removed user trigger | ${when}`)
                        break;
                    }
                    case "add":{
                        message.reply(`✅ Added new user trigger | When => " ${when} " Reply => " ${reply} "`)
                        db[when] = {
                            reply,
                            opts,
                        }
                        break;
                    }      
                    default:{
                        return message.channel.send(`${action} is not an valid action!`)
                    }
                }
     
                global['userTriggers'] = db
                return fs.writeFileSync(dbFile, JSON.stringify(db))
            } catch (error) {
                return message.reply(`An error has ocurred (⓿_⓿) > ${error}`)
            }
        } else {
           return message.channel.send(`Invalid scheme!`)
        }
    }
}