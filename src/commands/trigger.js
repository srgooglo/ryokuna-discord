
const path = require("path")
const fs = require("fs")

const { objectToArrayMap } = require("@corenode/utils")
const { MessageEmbed } = require("discord.js")

module.exports = {
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
                    author: author.user.username,
                    lock: false,
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
                    case "withUserCondition": {
                        // Filter user condition and execute, ej. when X is playing "lol" and send an message, triggers...
                        break;
                    }
                    case "remove": {
                        let typedDB = {}
                        if (db[opts.type]) {
                            typedDB = db[opts.type]
                        }

                        if (typedDB[when].opts.lock && !isAdmin && typedDB[when].opts.author !== author.user.username) {
                            return message.reply(`⛔ Sorry but this trigger is locked for only admins or author can modify`)
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