import LC from '@/element-materials/core'
import { isFreeLayoutProperty } from '@/element-materials/core/helper/utils.js'

export default function () {
    return () => {
        const activeNode = LC.getActiveNode()
        if (isFreeLayoutProperty(activeNode.parentNode.type)) {
            activeNode.setStyle({
                right: '0',
                left: '0',
                width: ''
            })
        } else {
            activeNode.setStyle({
                'width': '100%',
                'marginLeft': '0',
                marginRight: 0
            })
        }
        // vue3 样式变更，没有重新渲染，通过 key 来控制
        activeNode.rerender()
    }
}
