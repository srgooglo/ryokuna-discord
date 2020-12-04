import runtime from '@nodecorejs/dot-runtime'
import disconnect from '../lib/disconnectFromCurrent'

module.exports = {
    name: "disconnect",
    aliases: ["disconnect", "stop"],
    description: "Disconnect from your current connected voice channel and stop all runing services",
    execute(message) {
        disconnect(message)
    }
}