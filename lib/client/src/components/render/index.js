import cssModule from './index.postcss?module'
import {
    render,
    destory,
    registerComponent,
    framework
} from 'bk-lesscode-render'
import 'bk-lesscode-render/dist/index.css'
import LC from '@/element-materials/core'
import {
    i18nConfig
} from '@/locales/i18n.js'
import router from '@/router'
import PC from './pc/index'
import Mobile from './mobile/index'
import widgetTableColumn from './pc/widget/table/table-column'
import renderHtml from './pc/widget/html/index'

// render 模块可以是vue2，也可以是vue3
// 这里需要使用 bk-lesscode-render 提供的渲染方法来抹平差异
export default {
    beforeCreate () {
        // 部分slot用到的widget组件需要全局注册
        registerComponent('widget-table-column', widgetTableColumn)
        registerComponent('render-html', renderHtml)
    },
    mounted () {
        render({
            component: LC.platform === 'MOBILE' ? Mobile : PC,
            selector: '#render',
            router: framework === 'vue2' ? router : null,
            i18nConfig
        })
    },
    beforeDestroy () {
        destory()
        LC._unload()
        window.addEventListener('unload', () => {
            LC._unload()
        })
    },
    template: `<div class="${cssModule.render}"><div id="render"></div></div>`
}
