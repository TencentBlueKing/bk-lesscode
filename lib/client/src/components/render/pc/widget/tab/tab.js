import './tab.postcss'
import { h, framework } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import ResolveComponent from '../../resolve-component/resolve-component'

export default {
    name: 'widget-tab',
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
                console.log('update tab', this.componentData.componentId)
                this.$forceUpdate()
            }
        },

        tabChange (name) {
            const props = {
                format: 'value',
                code: name,
                renderValue: name
            }
            if (framework === 'vue2') {
                props.modifiers = ['sync']
            } else {
                props.directive = 'v-model'
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
                    component: 'bk-tab',
                    props: {
                        extCls: 'render-widget-tab',
                        active: self.componentData.prop.active,
                        ...self.componentData.prop
                    },
                    on: {
                        'tab-change': self.tabChange
                    },
                    children: self.componentData.slot.default.map((tabPanelItem) => h({
                        component: 'bk-tab-panel',
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
