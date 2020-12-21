import disconnect from '../lib/disconnectFromCurrent'
import fetch from 'node-fetch'
import bufferPlay from '../lib/bufferPipe'

import path from 'path'
import fs from 'fs'
const request = require('request');

const { MessageEmbed } = require("discord.js");
const { getRuntimeEnv } = require("@nodecorejs/dot-runtime")

module.exports = {
  name: "fm",
  aliases: ["fm"],
  description: "Play audio streaming from Comty STM server",
  execute(message, args, client) {
    const runtime = getRuntimeEnv()
    if (!runtime || !runtime.ryo) {
      message.reply(`[nodecore] Sorry but, runtime configuration its not available!\n Ryokuna services could not be initialized`)
    }

    const sourceStation = runtime.ryo.sourceStation;
    if (typeof (args) == "undefined" || !args[0]) {
      args[0] = "main"
    }
    const uri = `${sourceStation}${args[0]}`
    const voiceChannel = message.member.voice.channel;

    try {
      fetch(uri).then((res) => {
        if (res.status !== 200) {
          message.reply(`⛔ ${args[0]} is currently offline`)
          return false
        }

        if (runtime.ryo.originName) {
          global.self.setNickname(`${runtime.ryo.originName} | 📻 ${args[0]}`)
        }

        let embed = new MessageEmbed()

        embed.setTitle(`| 📻 Connected to **${args[0]}** |`)
        embed.setColor("#F8AA2A");
        embed.setDescription('(For a better sound quality you will have to listen to it from the server origin itself)')

        embed.addField(`** Source **`, `${uri}`)

        message.channel.send(embed).catch(console.error)

        const streamingBufferPath = path.resolve(process.cwd(), './.audioBuffer')
        const buffer = path.resolve(streamingBufferPath, `${args[0]}.ogg`)
        if (!fs.existsSync(streamingBufferPath)) {
            fs.mkdirSync(streamingBufferPath)
        }
        request(uri).pipe(fs.createWriteStream(buffer))

        voiceChannel.join().then(connection => {
          const dispatcher = connection.play(fs.createReadStream(buffer), { type: 'ogg/opus' })
          dispatcher.on("end", end => {
            fs.unlinkSync(buffer)
            disconnect(message)
          })
        }).catch(err => {
          fs.unlinkSync(buffer)
          console.log(err)
        })

      })
    } catch (err) {
      fs.unlinkSync(buffer)
      console.log(err)
    }


  }
}