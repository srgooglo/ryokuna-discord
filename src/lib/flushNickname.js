module.exports = () => {
    if (global._env.ryo.originName) {
        if (global.self.nickname == global._env.ryo.originName) {
            return false
        }
        global.self.setNickname(`${global._env.ryo.originName}`)
    }
}