import { time } from 'console'
import fs from 'fs'
import path from 'path'
import process from 'process'

const args = require("args-parser")(process.argv)
const pidFile = path.resolve(process.cwd(), './.pidfile')

function _(){
    const now = Date.now()
    fs.writeFileSync(pidFile, `${now}`, { encoding: "utf-8" })
}
_()