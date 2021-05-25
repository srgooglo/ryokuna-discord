module.exports = {
    name: "self",
    aliases: ["slf"],
    description: "Debug self guild",
    execute: (message, args, client) => {
        if (global.self) {
            message.channel.send(`${global.self} > id ${global.self.id}`)
        }
    }
}