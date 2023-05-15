import { bkInfoBox } from 'bk-magic-vue'
import LC from '../../index'

export const clearLayout = () => {
    const activeNode = LC.getActiveNode()
    const { type, componentId } = activeNode

    if (!activeNode.layoutType) {
        return
    }
    const clearCallback = () => {
        if (activeNode.type === 'render-grid') {
            // 如果是grid 清空 column 下面的节点
            activeNode.children.forEach(columnNode => {
                columnNode.children.forEach(child => {
                    columnNode.removeChild(child)
                })
            })
        } else {
            activeNode.children.forEach(child => {
                activeNode.removeChild(child)
            })
        }
    }
    bkInfoBox({
        title: window.i18n.t('清空'),
        subTitle: window.i18n.t('确认清空 {0}({1}) 里面的所有组件？', [type, componentId]),
        confirmFn: clearCallback
    })
}
