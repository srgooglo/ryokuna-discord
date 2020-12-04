import disconnect from '../lib/disconnectFromCurrent'

const {getRuntimeEnv} = require("@nodecorejs/dot-runtime")
const got = require("got");

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
            args[0] = "bruhFM"
        }

        const uri = `${sourceStation}${args[0]}`

        const voiceChannel = message.member.voice.channel;
        message.reply(`🆗 Streaming cathed from stm server -> ${uri} <- (For a better sound quality you will have to listen to it from the server origin itself)`)
        
        if (runtime.ryo.originName) {
          global.self.setNickname(`${runtime.ryo.originName} | 📻 ${args[0]}`)
        }

        voiceChannel.join().then(connection => {
          const dispatcher = connection.play(uri)
          dispatcher.on("end", end => {
            disconnect(message)
          });
        }).catch(err => console.log(err));
    }
}