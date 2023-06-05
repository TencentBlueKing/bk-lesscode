import cssModule from './form.postcss?module'
import { h } from 'bk-lesscode-render'
import WidgetFormItem from './form-item'
import LC from '@/element-materials/core'

export default {
    name: 'widget-form',
    components: {
        WidgetFormItem
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
                this.$forceUpdate()
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const formItemList = self.componentData.slot.default?.filter(item => item.prop.property) || []

        return h({
            component: 'div',
            class: {
                [cssModule['form']]: true,
                [cssModule['empty']]: formItemList.length < 1
            },
            children: [
                formItemList.length > 0
                    ? h({
                        component: 'bk-form',
                        props: self.componentData.prop,
                        children: self.componentData.slot.default.map((formItemNode) => {
                            return h({
                                component: WidgetFormItem,
                                props: {
                                    componentData: formItemNode,
                                    formType: self.componentData.prop['form-type']
                                }
                            })
                        })
                    })
                    : h({
                        component: 'div',
                        class: cssModule['tip-set'],
                        children: [
                            self.$t('请在右侧配置表单项')
                        ]
                    })
            ]
        })
    }
}
