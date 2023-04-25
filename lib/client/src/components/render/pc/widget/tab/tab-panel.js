import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import ResolveComponent from '../../resolve-component/resolve-component'

export default {
    name: 'widget-tab-panel',
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
    created () {
        LC.addEventListener('update', this.updateCallback)
    },
    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallback)
    },
    methods: {
        updateCallback ({ target }) {
            if (target.componentId === this.componentData.componentId) {
                console.log('update tab', this.componentData.componentId)
                this.$forceUpdate()
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            children: [
                h({
                    component: 'bk-tab-panel',
                    props: self.componentData.prop,
                    children: [
                        h({
                            component: ResolveComponent,
                            props: {
                                componentData: self.componentData.renderSlots.default
                            }
                        })
                    ]
                })
            ]
        })
    }
}
