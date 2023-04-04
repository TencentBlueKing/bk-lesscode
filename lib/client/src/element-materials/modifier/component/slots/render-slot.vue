<template>
    <variable-select
        :options="variableSelectOptions"
        :value="formData"
        :remote-config="remoteConfig"
        :show="variableSelectEnable"
        :show-content="isShowSlot"
        @change="handleVariableFormatChange">
        <template v-slot:title>
            <section class="slot-title-wrapper">
                <span class="slot-name">
                    <i
                        :class="{
                            'bk-icon icon-angle-down': true,
                            close: !isShowSlot
                        }"
                        @click="toggleShowSlot"
                    ></i>
                    <span
                        :class="{
                            'slot-tips': describe.tips
                        }"
                        v-bk-tooltips="computedSlotTip"
                    >
                        {{ $t(describe.displayName) }}
                        <span v-if="describe.type && describe.type.length <= 1">
                            ({{ formData.valueType | capFirstLetter }})
                        </span>
                    </span>
                </span>
                <template v-if="describe.name && describe.name.length > 1">
                    <span class="slot-label">{{ $t('组件标签') }}</span>
                    <bk-radio-group
                        :value="formData.component"
                        @change="handleSlotComponentChange"
                        class="g-prop-radio-group">
                        <bk-radio-button
                            v-for="itemName in describe.name"
                            :value="itemName"
                            :key="itemName"
                        >
                            {{ itemName | renderTypeText }}
                        </bk-radio-button>
                    </bk-radio-group>
                </template>
            </section>
        </template>

        <template v-if="showInnerVariable">
            <span class="g-prop-sub-title g-mb6">{{ $t('变量类型') }}</span>
            <choose-build-in-variable
                class="g-mb4"
                :build-in-variable="buildInVariable"
                :build-in-variable-type="formData.buildInVariableType"
                :component-id="componentId"
                :name="describe.displayName"
                :payload="formData.payload"
                :option="variableSelectOptions"
                @change="handleBuildInVariableChange"
            />
        </template>

        <template v-if="describe.type && describe.type.length > 1">
            <span class="g-prop-sub-title g-mb6 g-mt8" v-if="showInnerVariable">{{ $t('属性初始值来源') }}</span>
            <bk-radio-group
                class="g-prop-radio-group"
                :value="formData.valueType"
                @change="handleValueTypeChange"
            >
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
            :slot-val="slotVal"
            :slot-config="describe"
            :type="formData.valueType"
            :change="handleCodeChange"
            @option-change="(val) => handleSlotChange('keyOptions', val)" />
        <select-key
            v-show="describe.keys && describe.keys.length && formData.valueType !== describe.type[0]"
            :keys="describe.keys"
            :value="formData.valueKeys"
            :value-type="formData.valueType"
            :options="slotVal.keyOptions"
            @change="(val) => handleSlotChange('valueKeys', val)"
        />
    </variable-select>
</template>

<script>
    import _ from 'lodash'
    import { mapActions } from 'vuex'
    import { camelCase, camelCaseTransformMerge } from 'change-case'
    import { transformTipsWidth } from '@/common/util'
    import VariableSelect from '@/components/variable/variable-select'
    import ChooseBuildInVariable from '@/components/variable/choose-build-in-variable'
    import SelectKey from './components/common/select-key.vue'
    import {
        determineShowSlotInnerVariable,
        BUILDIN_VARIABLE_TYPE_LIST
    } from 'shared/variable'

    import {
        getDefaultValueByType,
        isEmpty,
        toPascal
    } from 'shared/util'

    import slotList from './components/list'
    import slotRemote from './components/remote'
    import slotTable from './components/table'
    import slotHtml from './components/slot-html'
    import slotText from './components/text'
    import slotTextArea from './components/textarea'
    import slotDataSource from './components/data-source.vue'
    import slotSelectDataSource from './components/select-data-source.vue'
    import slotSelectRemote from './components/select-remote'

    const comMap = {
        list: slotList,
        remote: slotRemote,
        html: slotHtml,
        text: slotText,
        textarea: slotTextArea,
        'table-list': slotTable,
        'data-source': slotDataSource,
        'select-data-source': slotSelectDataSource,
        'select-remote': slotSelectRemote
    }

    const typeTextMap = {
        'object': window.i18n.t('对象'),
        'number': window.i18n.t('数字'),
        'string': window.i18n.t('字符串'),
        'array': window.i18n.t('数组'),
        'remote': window.i18n.t('函数'),
        'data-source': window.i18n.t('数据表'),
        'list': window.i18n.t('数据列表'),
        'table-list': window.i18n.t('数据列表'),
        'select-data-source': window.i18n.t('数据表'),
        'select-remote': window.i18n.t('函数')
    }

    // slot 类型转为可接受的值类型
    const getSlotValueType = (type) => {
        // slot 如果配置多个，第一个为真实的值类型，后面是远程函数等
        const describeValueType = Array.isArray(type) ? type[0] : type
        const valueMap = {
            'list': 'array',
            'html': 'string',
            'text': 'string',
            'textarea': 'string',
            'table-list': 'array'
        }
        return [valueMap[describeValueType] || describeValueType]
    }

    export default {
        components: {
            VariableSelect,
            ChooseBuildInVariable,
            SelectKey
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
            componentId: {
                type: String
            },
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
                isRenderValueCom: false,
                isShowSlot: true
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
                const transformTips = transformTipsWidth(window.i18n.t(this.describe.tips))
                const tips = typeof transformTips === 'string' ? { content: transformTips } : transformTips
                const disabled = !this.describe.tips
                return {
                    ...(tips || {}),
                    disabled,
                    placements: ['left-start'],
                    boundary: 'window'
                }
            },
            /**
             * slot 类型组件需要完整的slot值
             */
            slotVal () {
                return {
                    val: this.slotTypeValueMemo[this.formData.valueType].val,
                    payload: this.slotTypeValueMemo[this.formData.valueType].payload,
                    component: this.slotTypeValueMemo[this.formData.valueType].component,
                    keyOptions: this.slotTypeValueMemo[this.formData.valueType].keyOptions
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
            },
            /**
             * @desc type 支持 remote 类型的不支持配置变量
             * @returns { Boolean }
             */
            variableSelectEnable () {
                // 远程函数不使用变量，只使用内置变量
                const noRemote = !this.describe.type.includes('remote')
                // 已启用的依然启用
                const hasEnable = ['expression', 'variable'].includes(this.formData.format)
                return noRemote || hasEnable
            },
            /**
             * @desc 是否展示内置变量
             * @returns { Boolean }
             */
            showInnerVariable () {
                return determineShowSlotInnerVariable(this.describe.type)
            },
            /**
             * 内置变量名
             */
            buildInVariable () {
                const perVariableName = camelCase(this.componentId, { transform: camelCaseTransformMerge })
                return `${perVariableName}Slot${this.name}`
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
                                valueType: lastValue.valueType,
                                buildInVariableType: lastValue.buildInVariableType,
                                renderValue: lastValue.renderValue,
                                valueKeys: lastValue.valueKeys || {},
                                keyOptions: lastValue.keyOptions || []
                            })

                            this.slotTypeValueMemo[lastValue.valueType] = {
                                val: lastValue.renderValue,
                                component: lastValue.component,
                                keyOptions: lastValue.keyOptions || [],
                                payload: lastValue.payload || {}
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
            const defaultValue = val || ''
            this.defaultValue = _.cloneDeep(defaultValue)
            const component = Array.isArray[name] ? name : [name]
            const valueTypes = getSlotValueType(type)

            // 构造 variable-select 的配置
            this.variableSelectOptions = {
                type: 'slot',
                prop: this.name,
                format: 'value',
                formatInclude: ['value', 'variable', 'expression'],
                code: defaultValue,
                valueTypeInclude: valueTypes
            }

            // slot 的初始值
            this.formData = Object.freeze({
                format: 'value',
                component: component[0],
                code: defaultValue,
                payload: {},
                valueType: type[0],
                renderValue: defaultValue,
                buildInVariableType: '',
                valueKeys: {},
                keyOptions: []
            })

            // 编辑状态缓存
            this.slotTypeValueMemo = {
                [this.formData.valueType]: {
                    val: defaultValue,
                    component: this.formData.component,
                    keyOptions: [],
                    payload: {}
                }
            }
        },
        methods: {
            ...mapActions('variable', ['updateVariable']),
            /**
             * @desc 同步更新用户操作
             */
            triggerChange () {
                // 缓存用户本地编辑值
                this.slotTypeValueMemo[this.formData.valueType] = {
                    val: this.formData.renderValue,
                    component: this.formData.component,
                    keyOptions: this.formData.keyOptions,
                    payload: this.formData.payload
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
                    format
                } = variableSelectData
                let {
                    code,
                    renderValue
                } = variableSelectData
                
                // 切换 format 时还没设置具体值 renderValue 取默认配置
                if (isEmpty(renderValue)) {
                    if (this.slotTypeValueMemo[this.formData.valueType]) {
                        renderValue = this.slotTypeValueMemo[this.formData.valueType].val
                    } else {
                        renderValue = _.cloneDeep(this.defaultValue)
                    }
                }
                // format 切换为 value 时，将 renderValue 回调到 code
                if (format === 'value' && code === '') {
                    code = renderValue
                }
                
                this.formData = Object.freeze({
                    ...this.formData,
                    format,
                    code,
                    renderValue
                })
                this.triggerChange()
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
                if (this.slotTypeValueMemo.hasOwnProperty(valueType)) {
                    // 有缓存的值
                    code = this.slotTypeValueMemo[valueType].val
                } else if ([
                    'remote',
                    'data-source',
                    'select-data-source'
                ].includes(valueType)) {
                    // 切换到数据表和远程函数此时还没有获取API数据
                    // code 和 rendervalue 保持不变
                    code = _.cloneDeep(this.formData.renderValue)
                } else {
                    // 切换值类型时，通过类型获取默认值
                    code = getDefaultValueByType(valueType)
                }
                this.formData = Object.freeze({
                    ...this.formData,
                    code,
                    valueType,
                    renderValue: code,
                    payload: this.slotTypeValueMemo[valueType]?.payload || {},
                    keyOptions: this.slotTypeValueMemo[valueType]?.keyOptions || []
                })
                this.triggerChange()
                this.triggerUpdateVariable()
            },
            /**
             * @desc format 等于 value 时，编辑 code 的值
             * @param { Object } valueData
             */
            handleCodeChange (valueData, type) {
                // 快速切换的情况下，如果type对不上，就不更新
                if (this.formData.valueType !== type) return

                let code = null
                let renderValue = this.formData.renderValue
                
                if (this.formData.valueType === 'remote') {
                    // 配置的是远程函数
                    // code 此时无效设置为 null
                    // api 返回数据不为空才应用接口数据（fix: 数据为空可能导致组件无法显示）
                    if (!isEmpty(valueData.val)) {
                        renderValue = valueData.val
                        code = valueData.val
                    }
                } else {
                    code = valueData.val
                    // 用户设置数据为空时显示配置默认值（fix: 数据为空可能导致组件无法显示）  如果允许为空(emptyable)，则同样可以change
                    if (!isEmpty(code) || this.describe.emptyable) {
                        renderValue = code
                    }
                }
                // 更新值
                this.formData = Object.freeze({
                    ...this.formData,
                    code,
                    payload: {
                        customVariableCode: this.formData?.payload?.customVariableCode,
                        ...valueData.payload
                    },
                    renderValue
                })
                
                this.triggerChange()
                this.triggerUpdateVariable()
            },
            /**
             * 切换展示 slot 配置区域
             */
            toggleShowSlot () {
                this.isShowSlot = !this.isShowSlot
            },
            /**
             * 内置变量数据变化回调
             */
            handleBuildInVariableChange ({ buildInVariableType, payload }) {
                this.formData = Object.freeze({
                    ...this.formData,
                    buildInVariableType,
                    payload: Object.assign(this.formData.payload, payload)
                })
                this.triggerChange()
                this.triggerUpdateVariable()
            },
            // 如果是自定义变量需要更新变量列表
            triggerUpdateVariable () {
                if (this.formData.buildInVariableType === BUILDIN_VARIABLE_TYPE_LIST[1].VAL) {
                    this.updateVariable({
                        [this.formData.payload.customVariableCode]: this.formData.renderValue
                    })
                }
            },
            /**
             * slot 变化
             * @param {*} key slot 的key
             * @param {*} val slot 的值
             */
            handleSlotChange (key, val) {
                this.formData = Object.freeze({
                    ...this.formData,
                    [key]: val
                })
                this.triggerChange()
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .slot-title-wrapper {
        width: 100%;
    }
    .slot-name {
        height: 40px;
        font-size: 12px;
        font-weight: bold;
        color: #313238;
        word-break: keep-all;
        width: 100%;
        display: flex;
        align-items: center;
        border-top: 1px solid #EAEBF0;
        .icon-angle-down {
            cursor: pointer;
            font-size: 20px;
            margin-left: -5px;
            margin-right: 3px;
            transition: transform 200ms;
            &.close {
                transform: rotate(-90deg);
            }
        }
    }
    .slot-tips {
        border-bottom: 1px dashed #979ba5;
        cursor: pointer;
        line-height: 19px;
    }
    /deep/ .slot-title {
        height: 28px;
        font-size: 12px;
        font-weight: bold;
        color: #63656E;
    }
</style>
