import fs from 'fs'
import path from 'path'

import disconnectFromCurrent from './lib/disconnectFromCurrent'
import flushNickname from './lib/flushNickname'

import runtime from '@nodecorejs/dot-runtime'
import { getVersion } from '@nodecorejs/dot-runtime'

const process = require('process')
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");

const customReplyFilePath = path.resolve(process.cwd(), './customReply.json')
const userTriggersFilePath = path.resolve(process.cwd(), "./userTriggers.json")
global['customReplies'] = {}
global['userTriggers'] = {}

if (fs.existsSync(customReplyFilePath)) {
  try {
    global['customReplies'] = JSON.parse(fs.readFileSync(customReplyFilePath, 'utf-8'))
  } catch (error) {
    console.log(`Cannot parse customReplies due an error >`)
    console.log(error)
    // terrible...
  }
}

if (fs.existsSync(userTriggersFilePath)) {
  try {
    global['userTriggers'] = JSON.parse(fs.readFileSync(userTriggersFilePath, 'utf-8'))
  } catch (error) {
    console.log(`Cannot parse userTriggers due an error >`)
    console.log(error)
    // terrible...
  }
}

const pidFile = path.resolve(process.cwd(), './.pidfile')
if (fs.existsSync(pidFile)) {
  global['pidFile'] = fs.readFileSync(pidFile)
}

let TOKEN, PREFIX;
try {
  const config = runtime.ryo;
  TOKEN = config.TOKEN;
  PREFIX = config.PREFIX;
} catch (error) {
  TOKEN = process.env.TOKEN;
  PREFIX = process.env.PREFIX;
}

const client = new Client({ disableMentions: "everyone" });

client.login(TOKEN);
client.defaultTextChannel = null // TO DO: Fetch default text channel guild from runtime
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();

global["selfClient"] = client

const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Client Events
 */
client.on("ready", () => {
  // TO DO: flushNickname
  console.log(`🆗 ${client.user.username} ready!`);
  client.user.setActivity(`For you! | comty!help | v${getVersion()}`, { type: "LISTENING" });
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  import(join(__dirname, "commands", `${file}`)).then((importedModule) => {
    if (!importedModule.default) {
      client.commands.set(importedModule.name, importedModule);
    }
    client.commands.set(importedModule.default.name, importedModule.default);
  })
}

client.on("message", async (message) => {
  const authorIssuer = message.guild.member(message.author.id);
  global["self"] = message.guild.member(global.selfClient.user);
  global["connectedVoiceChannel"] = global.selfClient.voice.connections.find(con => con.channel.id == message.member.voice.channel.id)

  if (message.author.bot) return;
  if (!message.guild) return;

  if (typeof (customReplies[message.content]) !== "undefined") {
    if (customReplies[message.content].opts.noReply) {
      return message.channel.send(customReplies[message.content].reply)
    }
    return message.reply(customReplies[message.content].reply)
  }

  if (typeof (global.userTriggers[message.author.username]) !== "undefined") {
    if (global.userTriggers[message.author.username].opts.noReply) {
      return message.channel.send(global.userTriggers[message.author.username].reply)
    }
    return message.reply(global.userTriggers[message.author.username].reply)
  }

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    message.channel.send(`❌ Sorry but this command is not available/exists > ${commandName}`)
    return false
  };

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args, client, authorIssuer, (matchedPrefix.length + commandName.length));
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing that command.").catch(console.error);
  }
});

const exitHook = require('exit-hook');
exitHook(() => {
  if (global.connectedVoiceChannel) {
    //global.connectedVoiceChannel.channel.send("🛑 The server is reloading due is rebuilding, all services have been exited.")
    global.connectedVoiceChannel.channel.leave()
  }
  if (global.pidFile) {
    fs.unlinkSync(pidFile)
  }
});