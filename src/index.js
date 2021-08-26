const fs = require("fs")
const path = require("path")

const { Client, Collection } = require("discord.js")

// load commands
const commandsPath = path.resolve(__dirname, './commands')
const commandScripts = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

let commands = {}

for (const file of commandScripts) {
  const script = require(path.resolve(commandsPath, `${file}`))
  commands[script.name] = script
}
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

class DiscordBot {
  constructor(params) {
    this.params = { ...params }

    this.token = this.params.token
    this.prefix = this.params.prefix

    this.client = new Client({ disableMentions: "everyone" })
    this.cooldowns = new Collection()
    this.commands = {...commands}

    this.init()
  }

  init = async () => {
    this.client.defaultTextChannel = null
    this.client.prefix = this.prefix
    this.client.queue = new Map()

    this.client.on("ready", this.handleReady)
    this.client.on("warn", this.handleWarn)
    this.client.on("error", this.handleError)
    this.client.on("message", this.handleMessage)

    this.connect()
  }

  handleReady = () => {
    console.log(`🆗 ${this.client.user.username} ready!`)
    this.client.user.setActivity(`For you! | comty!help | v${runtime.helpers.getVersion()}`, { type: "LISTENING" });
  }

  handleWarn = (warn) => {
    console.warn(warn)
  }

  handleError = (error) => {
    console.error(error)
  }

  handleMessage = (message) => {
    const { author } = message

    const authorIssuer = message.guild.member(author.id)

    if (message.author.bot) return
    if (!message.guild) return

    const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(this.prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [matchedPrefix] = message.content.match(prefixRegex)

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()
    const command = commands[commandName]
    
    if (!command) {
      message.channel.send(`¯\(°_o)/¯ Sorry but i dont know what to do with that`)
      return false
    }

    if (!this.cooldowns.has(command.name)) {
      this.cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(
          `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
        )
      }
    }

    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

    try {
      command.execute({message, args, context: this, author: authorIssuer, length: (matchedPrefix.length + commandName.length)})
    } catch (error) {
      console.error(error)
      message.reply("WoOoaA it crash! ＼（〇_ｏ）／").catch(console.error)
    }
  }

  connect = () => {
    this.client.login(this.token)
  }
}

new DiscordBot({
  token: global._env.ryo.TOKEN ?? process.env.TOKEN,
  prefix: global._env.ryo.PREFIX ?? process.env.PREFIX
})