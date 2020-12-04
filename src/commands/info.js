import process from 'process'

export default {
    name: "info",
    aliases: ["i"],
    description: "Show host server & version information",
    execute: (message, args, client) => {
        const info = {
            platform: process.platform,
            arch: process.arch,
            version: process.versions,
            cpuUsage: process.cpuUsage(),
            memoryUsage: process.memoryUsage()
        }
        message.channel.send(`${info}`)
    }
}