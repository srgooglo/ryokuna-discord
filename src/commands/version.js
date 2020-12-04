import { getVersion } from '@nodecorejs/dot-runtime'

module.exports = {
    name: "version",
    aliases: ["v"],
    description: "Show current build version",
    execute(message, args, client) {
        let msg = [];
        let pid;

        msg.push(`🚧 Using version **v${getVersion()}**`)

        if(global.pidFile){
            pid = global.pidFile
            msg.push(`BUILD ${pid}`)
        }

        message.channel.send(msg.join(" | "));
    }
}