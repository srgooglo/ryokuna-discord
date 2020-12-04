import flushNickname from './flushNickname'

export default (message) => {
    if (!message) return false

    const connectedChannel = global.selfClient.voice.connections.find(con => con.channel.id == message.member.voice.channel.id)

    if (!connectedChannel) {
        message.channel.send('😳 I am not connected to your voice channel');
        return false
    }
    
    flushNickname()
    message.member.voice.channel.leave()
    message.channel.send('🛑 Disconnected your channel');
}