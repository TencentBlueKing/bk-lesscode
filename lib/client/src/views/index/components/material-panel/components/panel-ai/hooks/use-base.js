import {
    isEmpty
} from 'shared/util'
import LC from '@/element-materials/core'

export default (cmdMessage) => {
    const handleComponentNotExist = (infoPrefix, componentId) => {
        cmdMessage.value += [
            '',
            '# cmd',
            `${infoPrefix}. The component "${componentId}" does not exist. please rethink and issue commands`
        ].join('\n')
    }

    // 获取当前操作的节点
    const getNode = (id) => {
        return isEmpty(id) ? LC.getRoot() : LC.getNodeById(id)
    }

    return {
        getNode,
        handleComponentNotExist
    }
}
