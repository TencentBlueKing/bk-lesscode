import cssModule from './form.postcss?module'
import { h } from 'bk-lesscode-render'
import WidgetFormItem from './form-item'

export default {
    name: '',
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
    computed: {
        formItemList () {
            return this.componentData.slot.default?.filter(item => item.prop.property) || []
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: {
                [cssModule['form']]: true,
                [cssModule['empty']]: self.formItemList.length < 1
            },
            children: [
                self.formItemList.length > 0
                    ? h({
                        component: 'bk-form',
                        props: self.componentData.prop,
                        children: self.componentData.slot.default.map((formItemNode) => {
                            return h({
                                component: WidgetFormItem,
                                key: formItemNode.componentId,
                                props: {
                                    componentData: formItemNode,
                                    formType: self.componentData.prop['form-type']
                                }
                            })
                        })
                    })
                    : ''
            ]
        })
    }
}
