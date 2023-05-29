import cssModule from './h5-container.postcss?module'
import { h } from 'bk-lesscode-render'
import ResolveComponent from '../../resolve-component/resolve-component'

export default {
    name: 'h5-container',
    components: {
        ResolveComponent
    },
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object,
            default: () => ({})
        }
    },
    provide () {
        return {
            renderGrid: this
        }
    },
    data () {
        return {
            isColumnEmpty: true,
            isShowActiveBtn: false
        }
    },
    render (render) {
        h.init(render)

        return h({
            component: 'div',
            class: cssModule['h5-container'],
            children: this.componentData.slot.default.map((slotComponentData) => h({
                component: ResolveComponent,
                key: slotComponentData.renderKey,
                props: {
                    componentData: slotComponentData
                }
            }))
        })
    }
}
