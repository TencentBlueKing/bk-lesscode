import Vue from 'vue'
import {
    init,
    render,
    destory
} from 'bk-lesscode-render'
import 'bk-lesscode-render/dist/index.css'
import PC from './pc/index'
import Mobile from './mobile/index'
import LC from '@/element-materials/core'

// render 模块可以是vue2，也可以是vue3
// 这里需要使用 bk-lesscode-render 提供的渲染方法来抹平差异
export default {
    beforeCreate () {
        init(LC.getFramework() === 'vue3' ? 3 : 2, Vue)
    },
    mounted () {
        render({
            component: LC.platform === 'MOBILE' ? Mobile : PC,
            selector: '#render'
        })
    },
    beforeDestroy () {
        destory()
    },
    template: '<div><div id="render"></div></div>'
}
