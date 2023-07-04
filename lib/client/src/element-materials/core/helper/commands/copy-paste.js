import { bkMessage } from 'bk-magic-vue'
import LC from '../../index'

let copyNode = null

/**
 * @desc 复制节点
 * @param { Boolean } newCopy 是否重新复制节点，如果为true重新复制选中的节点并返回，false直接返回缓存的复制结果
 * @returns { Node }
 */
export const copy = (newCopy = true) => {
    if (newCopy) {
        copyNode = LC.getActiveNode()
        return copyNode
    } else {
        return copyNode
    }
}

export const paste = () => {
    const activeNode = LC.getActiveNode()
    
    if (!activeNode) {
        bkMessage({
            theme: 'warning',
            limit: 1,
            message: window.i18n.t('请先选中布局或组件作为粘贴放置位置')
        })
        return
    }
    
    const newNode = copyNode.cloneNode(true)
    // 复制Node不重置margin
    newNode.setStyle({
        position: '',
        top: '',
        right: '',
        bottom: '',
        left: ''
        // marginTop: '',
        // marginRight: '',
        // marginBottom: '',
        // marginLeft: ''
    })
    // 使用helper下面的pasteNode方法
    activeNode.pasteNode(copyNode)
}

export const cut = () => {
    const activeNode = LC.getActiveNode()
    
    if (!activeNode) {
        return
    }
    copyNode = activeNode
    activeNode.parentNode.removeChild(activeNode)
}
