import { getVersion } from '@nodecorejs/dot-runtime'

module.exports = {
    name: "version",
    aliases: ["v"],
    description: "Show current build version",
    execute(message, args, client) {
        message.channel.send(`🚧 Using build version > ${getVersion()}`);
    }
}