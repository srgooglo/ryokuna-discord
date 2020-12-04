import runtime from '@nodecorejs/dot-runtime'

export default () => {
    if (runtime.ryo.originName) {
        if (global.self.nickname == runtime.ryo.originName) {
            return false
        }
        global.self.setNickname(`${runtime.ryo.originName}`)
    }
}