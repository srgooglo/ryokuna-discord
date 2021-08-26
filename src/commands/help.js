const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Display all commands and descriptions",
  execute({message, context}) {
    let helpEmbed = new MessageEmbed()
      .setTitle("| 🧐 Commands |")
      .setColor("#F8AA2A");

    Object.keys(context.commands).forEach((key) => {
      const command = context.commands[key]

      if (!command.name || !command.aliases || !command.description) {
        return false
      }

      helpEmbed.addField(
        `**${message.client.prefix}${command.name} ${command.aliases ? `(${command.aliases})` : ""}**`,
        `${command.description}`,
        true
      );
    });

    helpEmbed.setTimestamp();

    return message.channel.send(helpEmbed).catch(console.error)
  }
}
