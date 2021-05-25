module.exports = {
    name: "count",
    aliases: ["count"],
    description: "1,2,3...5?",
    execute: (message, args, client) => {
        if (args[0]) {
            for (let index = 0; index < args[0]; index++) {
                setTimeout(() => {
                    message.channel.send(index)
                }, 2500)
            }
        }else {
            message.channel.send(`AIMAR (⓿_⓿)`)
        }
    }
}