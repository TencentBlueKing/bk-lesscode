import { h } from 'bk-lesscode-render'
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

const formEngineWidgets = [
    autoCounting,
    checkBox,
    compute,
    date,
    datetime,
    description,
    divider,
    input,
    int,
    link,
    member,
    radio,
    rate,
    richText,
    select,
    table,
    textarea
]

export default {
    name: '',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        disabled: Boolean
    },
    beforeCreate () {
        formEngineWidgets.forEach(comp => {
            this.$options.components[`${comp.name}`] = comp
        })
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: 'bkform-engine-field-widget',
            children: [
                h({
                    component: 'div',
                    class: 'widget-label',
                    children: self.fieldData.configure.name
                }),
                h({
                    component: `bkform-engine-${self.fieldData.component || self.fieldData.type}`,
                    props: {
                        fieldData: this.fieldData,
                        disabled: this.disabled
                    },
                    on: {
                        change (val) {
                            self.$emit('change', val)
                        }
                    }
                })
            ]
        })
    }
}
