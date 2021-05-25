module.exports = {
    name: "random",
    aliases: ["random", "r"],
    description: "",
    execute(message, args, client, author, commandPrefixLenght) {
        const fixedArgs = message.content.slice(commandPrefixLenght, message.content.length).trim().split(/ > +/)
        const type = fixedArgs[0]

        async () => {
            const allUsers = await message.guild.members.fetch()
            console.log(allUsers)
        }

    }
}