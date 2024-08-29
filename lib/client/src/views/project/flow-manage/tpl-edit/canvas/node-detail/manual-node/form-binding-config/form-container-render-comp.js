/**
 * 表单渲染组件按照bk-lesscode-render的封装格式编写，支持vue2/3，需要在bk-lesscode-render环境下使用
 */

import {
    render,
    destory,
    framework
} from 'bk-lesscode-render'
import 'bk-lesscode-render/dist/index.css'
import { i18nConfig } from '@/locales/i18n.js'
import router from '@/router'
import WidgetFormContainer from '@/form-engine/renderer/index'

export default {
    props: {
        fields: {
            type: Array,
            default: () => []
        }
    },
    beforeCreate () {
        // registerComponent('widget-form-container', WidgetFormContainer)
    },
    mounted () {
        render({
            component: WidgetFormContainer,
            selector: '#form-container-render-comp',
            props: {
                fields: this.fields
            },
            router: framework === 'vue2' ? router : null,
            i18nConfig
        })
    },
    beforeDestroy () {
        destory()
    },
    template: '<div id="form-container-render-comp"></div>'
}
