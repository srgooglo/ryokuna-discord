const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Display all commands and descriptions",
  execute(message) {
    let commands = message.client.commands.array();

    let helpEmbed = new MessageEmbed()
      .setTitle("| 🧐 Commands |")
      .setColor("#F8AA2A");

    commands.forEach((cmd) => {
      if (!cmd.name || !cmd.aliases || !cmd.description) {
        return false
      }
      helpEmbed.addField(
        `**${message.client.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`,
        `${cmd.description}`,
        true
      );
    });

    helpEmbed.setTimestamp();

    return message.channel.send(helpEmbed).catch(console.error)
  }
}
