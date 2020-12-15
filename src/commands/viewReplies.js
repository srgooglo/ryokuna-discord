import path from 'path'
import fs from 'fs'
import process from 'process'
import { objectToArrayMap } from '@nodecorejs/utils'
const { MessageEmbed } = require("discord.js");

export default {
    name: "showreplies",
    aliases: ["showreplies"],
    description: "List all storaged custom replies",
    execute: (message, args, client) => {
        let embed = new MessageEmbed()

        embed.setTitle(`| All replies |`)
        embed.setColor("#F8AA2A");
        
        console.log(global["customReplies"])

        objectToArrayMap(global["customReplies"]).forEach(element => {
            embed.addField(`When => ${element.key}`, `Response => ${element.value.reply} | Options => ${element.value.opts}`)
        });

        message.channel.send(embed)
    }
}