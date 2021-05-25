const fs = require("fs")
const path = require("path")
const request = require('request')

const streamingBufferPath = path.resolve(process.cwd(), './.audioBuffer')
module.exports = (stream, file) => {
    const buffer = path.resolve(streamingBufferPath, file)
    if (!fs.existsSync(streamingBufferPath)) {
        fs.mkdirSync(streamingBufferPath)
    }
    request(stream).pipe(fs.createWriteStream(buffer))
    return buffer
}