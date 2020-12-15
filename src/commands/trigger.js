import path from 'path'
import fs from 'fs'
import process from 'process'
import { objectToArrayMap } from '@nodecorejs/utils'

const { MessageEmbed } = require("discord.js");

export default {
    name: "trigger",
    aliases: ["trigger"],
    description: "(⓿_⓿) Triggers",
    execute: (message, args, client, author, commandPrefixLenght) => {
        const fixedArgs = message.content.slice(commandPrefixLenght, message.content.length).trim().split(/ > +/)
        const isAdmin = message.member.hasPermission('ADMINISTRATOR')

        if (fixedArgs[0]) {
            try {
                let opts = {
                    type: "message",
                    authorLock: false,
                    adminLock: false,
                    noReply: false,
                    tts: false,
                }
                const action = fixedArgs[0]
                const type = fixedArgs[1]
                const when = fixedArgs[2]
                const reply = fixedArgs[3]
                const optionsArgs = fixedArgs[4]

                opts.type = type

                if (optionsArgs) {
                    optionsArgs.split(/ +/).forEach((option) => {
                        if (typeof(opts[option]) !== "undefined") {
                            opts[option] = !opts[option]
                        }
                    })
                }

                let db = {}
                const dbFile = path.resolve(process.cwd(), "./triggers.json")

                if (fs.existsSync(dbFile)) {
                    db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'))
                }

                switch (action) {
                    case "remove": {
                        let typedDB = {}
                        if (db[opts.type]) {
                            typedDB = db[opts.type]
                        }

                        if (!typedDB[when]) {
                            return message.reply(`⛔ Sorry but you cant delete something that not exist ผ(•̀_•́ผ)`)
                        }
                        if (typedDB[when].opts.adminLock && !isAdmin) {
                            return message.reply(`⛔ Sorry but this trigger is locked for only admins can modify`)
                        }
                        if (typedDB[when].opts.authorLock && !isAdmin && typedDB[when].opts.authorLock !== author.username) {
                            return message.reply(`⛔ Sorry but this trigger only can be deleted by the author or an administator.`)
                        }
                        message.reply(`🗑 Removed user trigger | ${when}`)
                        delete typedDB[when]
                        db[opts.type] = typedDB
                        break;
                    }
                    case "add": {
                        if (!when) {
                            return message.channel.send(`I cannot trigger the void ＼（〇_ｏ）／`)
                        }
                        if (!type) {
                            return message.channel.send(`How i gonna do that? ＼（〇_ｏ）／`)
                        }

                        let typedDB = {}
                        if (db[opts.type]) {
                            typedDB = db[opts.type]
                        }

                        const tablemsg = new MessageEmbed()
                            .setTitle("| ✅ Added new Trigger |")
                            .setColor("#F8AA2A");

                        tablemsg.addField(`When [${opts.type}] =>`, `${when}`, true)
                        tablemsg.addField(`Reply with =>`, `${reply}`, true)
                        
                        message.reply(tablemsg)
                        
                        typedDB[when] = {
                            reply,
                            opts,
                        }

                        db[opts.type] = typedDB
                        break;
                    }
                    case "show": {
                        objectToArrayMap(db).forEach(type => {
                            const tablemsg = new MessageEmbed()
                            .setTitle(`| 🔰 ${type.key} Triggers |`)
                            .setColor("#F8AA2A");
                            objectToArrayMap(type.value).forEach(trigger => { 
                                tablemsg.addField(`[${trigger.key}]`, `${trigger.value.reply}`, true)
                            })
                            message.channel.send(tablemsg)
                        });
                        
                        break;
                    }
                    default: {
                        return message.channel.send(`${action} is not an valid action!`)
                    }
                }

                global['triggers'] = db
                return fs.writeFileSync(dbFile, JSON.stringify(db))
            } catch (error) {
                return message.reply(`An error has ocurred (⓿_⓿) > ${error}`)
            }
        } else {
            return message.channel.send(`Invalid scheme!`)
        }
    }
}