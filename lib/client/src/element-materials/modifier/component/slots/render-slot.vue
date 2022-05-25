<template>
    <variable-select
        :options="variableSelectOptions"
        :value="formData"
        :remote-config="remoteConfig"
        @change="handleVariableFormatChange">
        <template v-slot:title>
            <section class="slot-title-wrapper">
                <span
                    class="slot-name"
                    :class="{
                        'slot-tips': describe.tips
                    }"
                    v-bk-tooltips="computedSlotTip">
                    {{ describe.displayName }}
                    <span v-if="describe.type && describe.type.length <= 1">
                        ({{ formData.valueType | capFirstLetter }})
                    </span>
                </span>
                <template v-if="describe.name && describe.name.length > 1">
                    <span class="slot-label">组件标签</span>
                    <bk-radio-group
                        :value="formData.component"
                        @change="handleSlotComponentChange"
                        class="mb10">
                        <bk-radio-button
                            v-for="itemName in describe.name"
                            :value="itemName"
                            :key="itemName"
                            class="mr10">
                            {{ itemName | renderTypeText }}
                        </bk-radio-button>
                    </bk-radio-group>
                </template>
            </section>
        </template>
        <template v-if="describe.type && describe.type.length > 1">
            <span class="slot-label">数据类型</span>
            <bk-radio-group
                :value="formData.valueType"
                @change="handleValueTypeChange"
                class="mb10">
                <bk-radio-button
                    :value="type"
                    v-for="type in describe.type"
                    :key="type">
                    {{ type | renderTypeText }}
                </bk-radio-button>
            </bk-radio-group>
        </template>
        <component
            v-if="isRenderValueCom"
            :is="renderValueComponent"
            :remote-validate="describe.remoteValidate"
            :slot-val="slotTypeValueMemo[formData.valueType]"
            :slot-config="describe"
            :change="handleCodeChange" />
    </variable-select>
</template>

<script>
    import { transformTipsWidth } from '@/common/util'
    import variableSelect from '@/components/variable/variable-select'

    import {
        getDefaultValueByType,
        isEmpty,
        toPascal
    } from '../utils'

    import slotList from './components/list'
    import slotRemote from './components/remote'
    import slotTable from './components/table'
    import slotHtml from './components/slot-html'
    import slotText from './components/text'
    import slotTextArea from './components/textarea'
    import slotDataSource from './components/data-source.vue'
    import slotSelectDataSource from './components/select-data-source.vue'

    const comMap = {
        list: slotList,
        remote: slotRemote,
        html: slotHtml,
        text: slotText,
        textarea: slotTextArea,
        'table-list': slotTable,
        'data-source': slotDataSource,
        'select-data-source': slotSelectDataSource
    }

    const typeTextMap = {
        'object': '对象',
        'number': '数字',
        'string': '字符串',
        'array': '数组',
        'remote': '远程函数',
        'data-source': '数据源',
        'list': '数据列表',
        'table-list': '数据列表',
        'select-data-source': '数据源'
    }

    export default {
        components: {
            variableSelect
        },

        filters: {
            renderTypeText (type) {
                return typeTextMap[type] || toPascal(type)
            },
            capFirstLetter (val = '') {
                return toPascal(val)
            }
        },

        props: {
            name: {
                type: String
            },
            lastValue: {
                type: Object,
                default: () => ({})
            },
            describe: {
                type: Object,
                default: () => ({})
            }
        },

        data () {
            return {
                formData: {},
                isRenderValueCom: false
            }
        },

        computed: {
            /**
             * @desc 配置为值类型时的设置组件
             * @returns { Object }
             */
            renderValueComponent () {
                return comMap[this.formData.valueType]
            },
            /**
             * @desc tips
             * @returns { Object }
             */
            computedSlotTip () {
                const transformTips = transformTipsWidth(this.describe.tips)
                const tips = typeof transformTips === 'string' ? { content: transformTips } : transformTips
                const disabled = !this.describe.tips
                return {
                    ...(tips || {}),
                    disabled
                }
            },
            /**
             * @desc 支持远程函数配置是的 config 信息
             * @returns { Object }
             */
            remoteConfig () {
                if (this.describe.type.includes('remote')) {
                    return {
                        show: true,
                        name: '',
                        value: this.formData.renderValue
                    }
                }
                return {
                    show: false,
                    value: ''
                }
            }
        },
        watch: {
            lastValue: {
                handler (lastValue) {
                    if (this.isInnerChange) {
                        this.isInnerChange = false
                        return
                    }
                    // setTimeout 让 watch 第一次执行时在 created 之后
                    setTimeout(() => {
                        if (lastValue && lastValue.valueType) {
                            this.formData = Object.freeze({
                                ...this.formData,
                                format: lastValue.format,
                                component: lastValue.component,
                                code: lastValue.code,
                                payload: lastValue.payload || {},
                                valueType: lastValue.valueType
                            })
                            this.slotTypeValueMemo[lastValue.valueType] = {
                                val: lastValue.code,
                                payload: lastValue.payload,
                                component: lastValue.component
                            }
                        }
                        this.isRenderValueCom = true
                    })
                },
                immediate: true
            }
        },
        created () {
            const {
                val,
                name,
                type
            } = this.describe
            const defaultValue = val
            const component = Array.isArray[name] ? name : [name]

            // 构造 variable-select 的配置
            this.variableSelectOptions = {
                type: 'slot',
                prop: this.name,
                format: 'value',
                formatInclude: ['value', 'variable', 'expression'],
                code: defaultValue,
                valueTypeInclude: undefined
            }

            // slot 的初始值
            this.formData = Object.freeze({
                format: 'value',
                component: component[0],
                code: defaultValue,
                payload: {},
                valueType: type[0],
                renderValue: defaultValue
            })

            // 编辑状态缓存
            this.slotTypeValueMemo = {
                [this.formData.valueType]: {
                    val: defaultValue,
                    payload: {},
                    component: this.formData.component
                }
            }
        },
        methods: {
            /**
             * @desc 同步更新用户操作
             */
            triggerChange (from) {
                // 缓存用户本地编辑值
                this.slotTypeValueMemo[this.formData.valueType] = {
                    val: this.formData.code,
                    payload: this.formData.payload,
                    component: this.formData.component
                }
                // 如果切换 format 导致到时 code 为空，
                // 为了页面渲染效果将 slotTypeValue 重置为默认
                if (from === 'format' && !this.formData.code) {
                    this.slotTypeValueMemo[this.formData.valueType].val = this.formData.renderValue
                }
                this.isInnerChange = true
                this.$emit('on-change', this.name, {
                    ...this.formData
                })
            },
            /**
             * @desc format 更新
             * @param { Object } variableSelectData
             */
            handleVariableFormatChange (variableSelectData) {
                const {
                    format,
                    renderValue
                } = variableSelectData
                let { code } = variableSelectData

                // format 切换为 value，这个时候 code 为空
                // 如果有缓存对应 valueType 的值切换后默认使用缓存值
                if (format === 'value'
                    && code === ''
                    && this.slotTypeValueMemo[this.formData.valueType]) {
                    code = this.slotTypeValueMemo[this.formData.valueType].val
                }
                this.formData = Object.freeze({
                    ...this.formData,
                    format,
                    code,
                    renderValue
                })
                this.triggerChange('format')
            },
            /**
             * @desc slot 组件类型切换
             */
            handleSlotComponentChange (component) {
                this.format = Object.freeze({
                    ...this.format,
                    component
                })
                this.triggerChange()
            },
            /**
             * @desc format 等于 value 时，value 的类型切换
             * @param { String } valueType
             */
            handleValueTypeChange (valueType) {
                let code = null
                let payload = {}
                if (this.slotTypeValueMemo.hasOwnProperty(valueType)) {
                    code = this.slotTypeValueMemo[valueType].val
                    payload = this.slotTypeValueMemo[valueType].payload
                } else if (['remote', 'data-source', 'select-data-source'].includes(valueType)) {
                    // fix: 配置远程函数类型，
                    // 接口数据没返回时使用配置文件设置的默认值
                    code = this.describe.val
                } else {
                    // 切换值类型时，通过类型获取默认值
                    code = getDefaultValueByType(valueType)
                }
                this.formData = Object.freeze({
                    ...this.formData,
                    code,
                    valueType,
                    renderValue: code,
                    payload
                })
                this.triggerChange()
            },
            /**
             * @desc format 等于 value 时，编辑 code 的值
             * @param { Object } valueData
             */
            handleCodeChange (valueData) {
                let code = null
                let renderValue = ''
                
                if (this.formData.valueType === 'remote') {
                    // 配置的是远程函数
                    // code 此时无效设置为 null
                    // api 返回数据不为空才应用接口数据（fix: 数据为空可能导致组件无法显示）
                    if (!isEmpty(valueData.val)) {
                        renderValue = valueData.val
                    }
                } else {
                    code = valueData.val
                    renderValue = valueData.val
                    // 用户设置数据为空时显示配置默认值（fix: 数据为空可能导致组件无法显示）
                    if (isEmpty(renderValue)) {
                        renderValue = this.describe.val
                    }
                }
                this.formData = Object.freeze({
                    ...this.formData,
                    code,
                    payload: valueData.payload,
                    renderValue
                })
                
                this.triggerChange()
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .slot-name {
        line-height: 32px;
    }
    .slot-tips {
        border-bottom: 1px dashed #979ba5;
        cursor: pointer;
    }
    .slot-label {
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        color: #63656E;
        display: block;
    }
    /deep/ .slot-title {
        height: 28px;
        font-size: 12px;
        font-weight: bold;
        color: #63656E;
    }
</style>
