import { bkInfoBox } from 'bk-magic-vue'
import getRoot from './get-root'
import { triggerEventListener } from '../event'

/**
 * @desc 重置画布数据
 */
export default function () {
    bkInfoBox({
        title: '确定清空画布？',
        subTitle: '清空画布保存后已下架自定义组件将不能再被使用',
        confirmFn: () => {
            const root = getRoot()
            root.children.forEach(children => {
                root.removeChild(children)
            })
            triggerEventListener('reset')
        }
    })
    
    return true
}
