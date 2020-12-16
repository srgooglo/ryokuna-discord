import fs from 'fs'
import path from 'path'
import process from 'process'

const pidFile = path.resolve(process.cwd(), './.pidfile')
function _(){
    const now = Date.now()
    fs.writeFileSync(pidFile, `${now}`, { encoding: "utf-8" })
}
_()