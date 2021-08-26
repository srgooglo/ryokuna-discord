module.exports = {
    name: "count",
    aliases: ["count"],
    description: "1,2,3...5?",
    execute: async ({message, args, client}) => {
        let count = Number(0)
        let interval = null

        if (!Number.isNaN(Number(args[0]))) {
            const handle = () => {
                if (count < Number(args[0])) {
                    count += 1
                    message.channel.send(count)
                }else {
                    message.channel.send(`AIMAR (⓿_⓿)`)
                    clearInterval(interval)
                }
            }

            interval = setInterval(handle, 1000)
        }else {
            message.channel.send(`Eso no es un numero :/`)
        }
    }
}