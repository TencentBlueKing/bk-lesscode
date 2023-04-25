import './tab.postcss'
import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import WidgetTabPanel from './tab-panel'

export default {
    name: 'widget-tab',
    components: {
        WidgetTabPanel
    },
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
            if (target.componentId === this.componentData.componentId) {
                console.log('update tab', this.componentData.componentId)
                this.$forceUpdate()
            }
        },

        tabChange (name) {
            this.componentData.setProp({
                'active': LC.utils.genPropFormatValue({
                    format: 'value',
                    code: name,
                    renderValue: name,
                    modifiers: ['sync']
                })
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
                        component: WidgetTabPanel,
                        key: tabPanelItem.componentId + Math.random(),
                        props: {
                            componentData: tabPanelItem
                        }
                    }))
                })
            ]
        })
    }
}
