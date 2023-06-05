import {
    render,
    destory,
    registerComponent
} from 'bk-lesscode-render'
import 'bk-lesscode-render/dist/index.css'
import LC from '@/element-materials/core'
import { i18nConfig } from '@/locales/i18n.js'
import PC from './pc/index'
import Mobile from './mobile/index'
import widgetTableColumn from './pc/widget/table/table-column'
import renderHtml from './pc/widget/html/index'

// render 模块可以是vue2，也可以是vue3
// 这里需要使用 bk-lesscode-render 提供的渲染方法来抹平差异
export default {
    beforeCreate () {
        // 部分slot用到的widget组件需要全局注册
        registerComponent('widgetTableColumn', widgetTableColumn)
        registerComponent('renderHtml', renderHtml)
    },
    mounted () {
        render({
            component: LC.platform === 'MOBILE' ? Mobile : PC,
            selector: '#render',
            i18nConfig
        })
    },
    beforeDestroy () {
        destory()
    },
    template: '<div><div id="render"></div></div>'
}
