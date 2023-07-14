import LC from '@/element-materials/core'
import {
    h
} from 'bk-lesscode-render'
import RenderSlot from './render-slot'
import ResolveComponent from './resolve-component/resolve-component'
import ResolveInteractiveComponent from './resolve-interactive-component/resolve-interactive-component'
import FreeLayout from './widget/free-layout/free-layout'
import RenderGrid from './widget/grid/grid'
import h5Container from './widget/h5-container/h5-container'
import RenderColumn from './widget/column/column'
import RenderBlock from './widget/block/block'
import WidgetTab from './widget/tab/tab'
import WidgetForm from './widget/form/form'
import WidgetFormItem from './widget/form/form-item'
import WidgetBkTable from './widget/table/table'
import WidgetVanPicker from './widget/van-picker'

import LesscodeLoading from './tools/lesscode-loading'

export default {
    name: 'render-component',

    components: {
        RenderSlot,
        ResolveComponent,
        ResolveInteractiveComponent,
        FreeLayout,
        RenderGrid,
        h5Container,
        h5Page: FreeLayout,
        RenderColumn,
        RenderBlock,
        WidgetTab,
        WidgetForm,
        WidgetFormItem,
        WidgetBkTable,
        WidgetVanPicker
    },

    props: {
        componentData: Object
    },

    computed: {
        baseComponentStyleReset () {
            // fix: 修正部分样式在编辑时应用到实际的组件会产生偏差和重叠
            const baseComponentStyleReset = {
                // 修正组件会影响位置的样式
                'margin': '',
                'margin-top': '',
                'margin-right': '',
                'margin-bottom': '',
                'margin-left': '',
                'transform': '',
                // 修正会产生叠加效果的样式
                'box-shadow': '',
                'z-index': ''
            }
            // fix: 基础组件的根元素可能会有定位样式(relative, absolute)当top、right、bottom、left 生效时会导致偏移
            // - 组件在 freelayout 里面时进行位置修正
            // - 非交互式组件对定位样式进行修正
            if (this.$parent.attachToFreelayout
                || !this.componentData.isInteractiveComponent) {
                Object.assign(baseComponentStyleReset, {
                    position: '',
                    top: '',
                    right: '',
                    bottom: '',
                    left: ''
                })
            }

            // fix: 样式导致基础组件的交互问题
            if (!this.$parent.isShadowComponent) {
                Object.assign(baseComponentStyleReset, {
                    // 基础组件的层级最低（基础组件可能本身有 border 样式，保证组件选中和 hover 时的边框效果能显示出来）
                    'z-index': 0,
                    // 隔绝基础组件的鼠标事件响应
                    'pointer-events': 'none'
                })
            }

            return baseComponentStyleReset
        }
    },

    created () {
        LC.addEventListener('update', this.updateCallback)
    },

    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallback)
    },

    methods: {
        updateCallback (event) {
            if (event.target.componentId === this.componentData.componentId) {
                this.$forceUpdate()
            }
        }
    },

    render (render) {
        h.init(render)

        const parent = this.$parent

        // 如果是画布区域的 shadow 组件需要透传 componentData
        const props = Object.assign({}, this.componentData.prop, {
            'component-data': this.componentData,
            'show-mask': false
        })
        const events = {}

        // 交互式组件需要处理隐藏显示逻辑
        if (this.componentData.isInteractiveComponent) {
            props.value = this.componentData.interactiveShow
            props.isShow = this.componentData.interactiveShow
            events.input = value => {
                this.componentData.setProperty('interactiveShow', value)
            }
        }

        // table 组件逻辑
        if (['widget-bk-table', 'widget-el-table'].includes(this.componentData.type)) {
            // 处理操作逻辑
            if (this.componentData.renderProps.data.valueType === 'table-data-source') {
                props.tableName = this.componentData.renderProps.data?.payload?.sourceData?.tableName
                props.bkDataSourceType = this.componentData.renderProps.data?.payload?.sourceData?.dataSourceType
                props.showOperationColumn = this.componentData.renderProps.data?.payload?.sourceData?.showOperationColumn
            }
            // 处理分页逻辑
            if (this.componentData.renderProps.pagination) {
                const paginationPayload = this.componentData.renderProps.pagination?.payload || {}
                if (['local', 'remote'].includes(paginationPayload.type)) {
                    props.pagination = Object.keys(paginationPayload.val || {}).reduce((acc, cur) => {
                        acc[cur] = paginationPayload.val[cur].val
                        return acc
                    }, {})
                    props.paginationType = paginationPayload.type
                } else {
                    delete props.pagination
                }
            }
            props.dataValueType = this.componentData.renderProps.data.valueType
        }

        const attrs = {
            role: this.componentData.type
        }

        Object.keys(parent.material.props || {}).forEach(propName => {
            const propConfig = parent.material.props[propName]
            // feature: prop 被标记为 staticValue，在画布编辑时不动态改变
            // 永远使用默认值
            if (Object.prototype.hasOwnProperty.call(propConfig, 'staticValue')) {
                props[propName] = propConfig.staticValue
            }
            // fix：vue 特性
            // class、style属性默认会被子组件继承
            if (['class', 'style'].includes(propName)) {
                attrs[propName] = this.componentData.prop[propName]
            }
        })

        // 为基础组件打上标记
        if (!parent.isShadowComponent) {
            attrs['lesscode-base-component'] = ''
        }

        const renderSlotMap = Object.keys(this.componentData.slot).reduce((result, slotName) => {
            const slotList = Array.isArray(this.componentData.slot[slotName])
                ? this.componentData.slot[slotName]
                : [this.componentData.slot[slotName]]

            result[slotName] = () => slotList.map(slot => {
                // 如果是组件渲染组件
                if (LC.isNode(slot)) {
                    return h({
                        component: ResolveComponent,
                        slot: slotName,
                        props: {
                            componentData: slot
                        },
                        key: slot.renderKey
                    })
                }
                // 渲染组件slot配置
                return h({
                    component: RenderSlot,
                    slot: slotName,
                    props: {
                        slotData: slot,
                        slot: slotName,
                        renderKey: this.componentData.renderSlotKey
                    }
                })
            })
            return result
        }, {})

        const renderProps = {
            component: this.componentData.type,
            key: this.componentData.renderKey,
            props,
            attrs,
            style: Object.assign({}, this.componentData.style, this.baseComponentStyleReset),
            on: events
        }

        // 原生 html 元素只有 children
        if (parent.isHtmlElement) {
            renderProps.children = renderSlotMap.default?.()
        } else {
            renderProps.slots = renderSlotMap
        }

        return h({
            component: LesscodeLoading,
            props: {
                componentData: this.componentData
            },
            children: [
                h(renderProps)
            ]
        })
    }
}
