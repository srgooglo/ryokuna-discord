import runtime from '@nodecorejs/dot-runtime'

function flush() {
    if (runtime.ryo.originName) {
        if (global.self.nickname == runtime.ryo.originName) {
            return false
        }
        global.self.setNickname(`${runtime.ryo.originName}`)
    }
}

export default flush