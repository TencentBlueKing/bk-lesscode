import { h, framework } from 'bk-lesscode-render'
import moment from 'moment'

// 返回日期选择器组件的名称，根据框架不同返回不同的组件名称
const datePickerName = () => {
    return framework === 'vue3' ? 'van-date-picker' : 'van-datetime-picker'
}

// 根据框架和上下文返回 van-popup 组件的配置对象
const getVanPopupConfig = (context) => {
    return framework === 'vue3' ? {
        props: {
            show: context.show,
            round: true,
            position: 'bottom'
        },
        on: {
            'update:show': (val) => {
                context.show = val
            }
        }
    } : {
        props: {
            value: context.show,
            round: true,
            position: 'bottom'
        },
        on: {
            'input': (val) => {
                context.show = val
            }
        }
    }
}

// 处理选择器确认事件的函数
const getPickerConfirmHandle = (context, value) => {
    if (framework === 'vue3') {
        context.syncValue = value.selectedValues
    } else {
        context.syncValue = context.componentType === datePickerName() ? moment(value).format(context.format) : value
    }
    context.closeDatePicker()
    context.$emit('confirm')
}

// 根据框架和上下文返回组件的 v-model 配置对象
const componentVModelHandle = (context) => {
    return framework === 'vue3' ? { input: (val) => {
        context.syncValue = val
    } } : { 'update:modelValue': (val) => {
        context.syncValue = val
    } }
}

export default {
    name: 'widget-van-picker',
    inheritAttrs: false,
    props: {
        componentType: String,
        label: String,
        type: String,
        dateTitle: String,
        confirmButtonText: String,
        cancelButtonText: String,
        showToolbar: Boolean,
        readonly: Boolean,
        itemHeight: [Number, String],
        columnsOrder: Array,
        visibleItemCount: [Number, String],
        swipeDuration: [Number, String],
        minDate: Date,
        maxDate: Date,
        format: String,
        value: [Date, Array, String]
    },
    data () {
        return {
            date: moment(new Date()).format('yyyy-MM-DD hh:mm:ss'),
            show: false
        }
    },
    computed: {
        // 根据组件类型和框架返回显示的值
        displayValue () {
            if (this.componentType === datePickerName()) {
                return framework === 'vue3' ? this.value.join('-') : moment(this.syncValue).format(this.format)
            }
            return framework === 'vue3' ? this.getPickerCellDisplay(this.value) : this.value
        },
        // 获取和设置 syncValue 的值，根据框架不同
        syncValue: {
            get () {
                return this.value
            },
            set (value) {
                this.$emit('update:value', value)
                this.$emit('input', value)
            }
        },
        // 将所有的 props 合并为一个对象
        allProps () {
            const valueProps = framework === 'vue3'
                ? { modelValue: this.syncValue } // Vue3则是数组
                : { value: new Date(this.syncValue) } // Vue2的Picker dateTime是一个Date类型
            return Object.assign({}, this.$props, this.$attrs, valueProps)
        }
    },
    methods: {
        // Vue3的Piker组件，cell显示的逻辑
        getPickerCellDisplay (value) {
            const nameMap = value.map(item => {
                const option = this.allProps.columns.find(option => option.value === item)
                return option.text
            })
            return nameMap.join(' ')
        },
        // 关闭日期选择器
        closeDatePicker () {
            this.show = false
        },
        // 处理选择器变化事件
        changeHandle (value) {
            this.$emit('change', value)
        },
        // 处理选择器确认事件
        confirmHandle (value) {
            getPickerConfirmHandle(this, value)
        },
        // 处理选择器取消事件
        cancelHandle () {
            this.closeDatePicker()
            this.$emit('cancel')
        }
    },
    
    render (render) {
        h.init(render)

        const self = this
        return h({
            component: 'div',
            children: [h({
                component: 'van-cell',
                props: {
                    title: self.$props.label,
                    value: self.displayValue
                },
                on: {
                    click: () => {
                        self.show = !self.show
                    }
                }
            }), h({
                component: 'van-popup',
                ...getVanPopupConfig(self),
                children: [h({
                    component: self.$props.componentType,
                    props: {
                        ...self.allProps
                    },
                    on: {
                        cancel: self.cancelHandle,
                        confirm: self.confirmHandle,
                        change: self.changeHandle,
                        ...componentVModelHandle(self)
                    }
                })]
            })]
        })
    }
}
