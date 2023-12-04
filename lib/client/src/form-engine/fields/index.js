import { h, toolTips } from 'bk-lesscode-render'
import './index.postcss'

import autoCounting from './auto-counting/index'
import checkBox from './checkbox/index'
import compute from './compute/index'
import date from './date/index'
import datetime from './datetime/index'
import description from './description/index'
import divider from './divider/index'
import input from './input/index'
import int from './int/index'
import link from './link/index'
import member from './member/index'
import radio from './radio/index'
import rate from './rate/index'
import richText from './rich-text/index'
import select from './select/index'
import table from './table/index'
import textarea from './textarea/index'

export default {
    name: '',
    components: {
        'bkform-engine-auto-counting': autoCounting,
        'bkform-engine-checkbox': checkBox,
        'bkform-engine-computed': compute,
        'bkform-engine-date': date,
        'bkform-engine-datetime': datetime,
        'bkform-engine-description': description,
        'bkform-engine-divider': divider,
        'bkform-engine-input': input,
        'bkform-engine-int': int,
        'bkform-engine-link': link,
        'bkform-engine-member': member,
        'bkform-engine-radio': radio,
        'bkform-engine-rate': rate,
        'bkform-engine-rich-text': richText,
        'bkform-engine-select': select,
        'bkform-engine-table': table,
        'bkform-engine-textarea': textarea
    },
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        formValue: {
            type: Object,
            default: () => ({})
        },
        required: Boolean,
        readonly: Boolean,
        value: [String, Number, Boolean, Array, Object],
        disabled: Boolean
    },
    render (render) {
        h.init(render)

        const self = this

        const renderFieldWidget = () => {
            const fieldComp = []
            if (self.fieldData.configure.name) {
                const directives = []
                if (self.fieldData.configure.labelTips) {
                    directives.push({
                        name: toolTips,
                        value: {
                            content: 'self.fieldData.configure.labelTips',
                            placement: 'top'
                        }
                    })
                }
                fieldComp.push(h({
                    component: 'div',
                    class: 'widget-label',
                    children: [h({
                        component: 'span',
                        class: ['label-text', { 'has-tips': self.fieldData.configure.labelTips, 'required': self.required }],
                        directives,
                        children: [self.fieldData.configure.name]
                    })]
                }))
            }
            fieldComp.push(h({
                component: `bkform-engine-${self.fieldData.component || self.fieldData.type}`,
                props: {
                    fieldData: this.fieldData,
                    formValue: this.formValue,
                    disabled: this.disabled || this.readonly,
                    value: this.value
                },
                on: {
                    change (val) {
                        self.$emit('change', val)
                    }
                }
            }))
            return fieldComp
        }

        return h({
            component: 'div',
            class: 'bkform-engine-field-widget',
            children: renderFieldWidget()
        })
    }
}
