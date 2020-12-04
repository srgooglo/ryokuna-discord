import runtime from '@nodecorejs/dot-runtime'

function flush() {
    if (runtime.ryo.originName) {
        global.self.setNickname(`${runtime.ryo.originName}`)
    }
}

export default flush