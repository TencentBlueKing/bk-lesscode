import { bkInfoBox } from 'bk-magic-vue'
import getRoot from './get-root'
import { triggerEventListener } from '../event'

/**
 * @desc 重置画布数据
 */
export default function (title = '确定清空画布？', subtitle = '如果画布中存在已下架的自定义组件，清空保存后将不能再被使用', callback) {
    bkInfoBox({
        title: title,
        subTitle: subtitle,
        confirmFn: () => {
            const root = getRoot()
            root.children.forEach(children => {
                root.removeChild(children)
            })
            triggerEventListener('reset')
            callback?.()
        }
    })
    
    return true
}
