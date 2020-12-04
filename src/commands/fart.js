const fartSource = "http://dl.ragestudio.net/lightFart.mp3"

module.exports = {
    name: "fart",
    aliases: ["fart"],
    description: "😳",
    execute(message, args) {
        const voiceChannel = message.member.voice.channel;

        if (voiceChannel) {
            voiceChannel.leave()
        }

        setTimeout(() => {
            voiceChannel.join().then(async (connection)=> {
                message.channel.send(`😳 Upss...`);        
    
                setInterval(() => {
                    connection.play(fartSource, { volume: args[0] ?? 1 })
                }, 1200)
            
            }).catch(err => console.log(err));
        }, 500)
    }
}