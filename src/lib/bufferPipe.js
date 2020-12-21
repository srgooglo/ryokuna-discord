import path from 'path'
import fs from 'fs'
const request = require('request')

const streamingBufferPath = path.resolve(process.cwd(), './.audioBuffer')
export default (stream, file) => {
    const buffer = path.resolve(streamingBufferPath, file)
    if (!fs.existsSync(streamingBufferPath)) {
        fs.mkdirSync(streamingBufferPath)
    }
    request(stream).pipe(fs.createWriteStream(buffer))
    return buffer
}