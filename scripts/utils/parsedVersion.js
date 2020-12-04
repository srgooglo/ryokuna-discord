const path = require("path")
const process = require("process")

const packagePath = path.resolve(process.cwd(), './package.json')
const packagejson = require(packagePath)

module.exports = () => {
    let fromPkg = packagejson.version.split('.');
    let versionParsed = {
        major: fromPkg[0],
        minor: fromPkg[1],
        patch: fromPkg[2]
    }
    return versionParsed
}