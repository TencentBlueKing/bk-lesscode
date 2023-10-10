import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import ResolveComponent from '../../resolve-component/resolve-component'
import './tab.postcss'

export default {
    name: 'widget-van-tab',
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object,
            required: true
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
            if (target.componentId === this.componentData.componentId
                || this.componentData.slot.default.some(componentData => componentData.componentId === target.componentId)) {
                this.$forceUpdate()
            }
        },

        tabChange (name) {
            const props = {
                format: 'value',
                code: name,
                renderValue: name,
                directive: 'v-model'
            }

            this.componentData.setProp({
                'active': LC.utils.genPropFormatValue(props)
            })
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            children: [
                h({
                    component: 'van-tabs',
                    props: {
                        ...self.componentData.prop
                    },
                    class: 'render-widget-van-tab',
                    on: {
                        'change': self.tabChange
                    },
                    children: self.componentData.slot.default.map((tabPanelItem) => h({
                        component: 'van-tab',
                        props: tabPanelItem.prop,
                        children: [
                            h({
                                component: ResolveComponent,
                                props: {
                                    componentData: tabPanelItem.renderSlots.default
                                }
                            })
                        ]
                    }))
                })
            ]
        })
    }
}
