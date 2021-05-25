const flushNickname = require("./flushNickname")

module.exports = (message) => {
    if (!message) return false

    const connectedChannel = global.selfClient.voice.connections.find(con => con.channel.id == message.member.voice.channel.id)

    if (!connectedChannel) {
        message.channel.send('😳 I am not connected to your voice channel');
        return false
    }

    flushNickname()
    setTimeout(() => { message.member.voice.channel.leave() }, 500)
}