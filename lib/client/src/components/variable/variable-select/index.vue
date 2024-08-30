<template>
    <section class="select-variable">
        <section class="header">
            <slot name="title"></slot>
            <bk-select
                v-if="show"
                class="format-list"
                :value="formData.format || 'value'"
                :clearable="false"
                :disabled="readonly"
                style="width: 68px;"
                behavior="simplicity"
                ext-popover-cls="select-popover-variable"
                @change="handleFormatChange">
                <bk-option
                    v-for="(val, key) in renderFormatMap"
                    :key="key"
                    :id="key"
                    :name="val">
                </bk-option>
            </bk-select>
        </section>
        <template v-if="showContent">
            <div
                v-if="readonly"
                class="readonly-text">
                {{ formData.code }}
            </div>
            <div v-else class="display-content">
                <div v-if="Object.hasOwnProperty.call(describe, 'example')"
                    class="edit-text mb5"
                    @click="() => {
                        $refs.example.isShow = true
                    }">
                    {{ $t('数据示例') }}</div>
                <slot v-if="formData.format === 'value' || !formData.format" />
                <render-variable
                    v-if="formData.format === 'variable'"
                    :options="options"
                    :form-data="formData"
                    :remote-config="remoteConfig"
                    @on-change="handleChange" />
                <render-expression
                    v-if="formData.format === 'expression'"
                    :options="options"
                    :form-data="formData"
                    @on-change="handleChange"
                />
                <render-table
                    v-if="formData.format === 'dataSource'"
                    :show-data-button="false"
                    :value="formData.code"
                    :data-source-type="formData.dataSourceType"
                    :third-part-d-b-name="formData.thirdPartDBName"
                    @choose-table="handleChooseTable"
                />
                <bk-input
                    v-if="formData.format === 'event'"
                    :value="$t('参数值由组件事件提供')"
                    disabled
                ></bk-input>
            </div>
        </template>
        <Example :data="{
            name: '',
            value: describe.example
        }" ref="example"></Example>
    </section>
</template>
<script>
    import _ from 'lodash'
    import RenderVariable from './components/variable'
    import RenderExpression from './components/expression'
    import RenderTable from '@/components/choose-data-table.vue'
    import Example from '@/element-materials/modifier/component/props/components/strategy/remote-example'

    const genFormData = ({
        format,
        code = '',
        valueType = [],
        renderValue,
        dataSourceType,
        thirdPartDBName
    }) => ({
        // 类型（value、variable、expression）
        format,
        // 对应 变量code 和 expression
        code,
        // 最终值的类型
        valueType,
        // 编辑器渲染值
        renderValue,
        // 数据源类型
        dataSourceType,
        // 第三方数据源名称
        thirdPartDBName
    })

    const formatTypeMap = {
        value: window.i18n.t('值'),
        variable: window.i18n.t('变量'),
        dataSource: window.i18n.t('数据表'),
        expression: window.i18n.t('表达式'),
        event: window.i18n.t('事件')
    }

    export default {
        components: {
            RenderVariable,
            RenderExpression,
            RenderTable,
            Example
        },
        props: {
            show: {
                type: Boolean,
                default: true
            },
            describe: {
                type: Object,
                default: () => ({})
            },
            // 是否展示内容区
            showContent: {
                type: Boolean,
                default: true
            },
            /**
             * @desc 配置数据
             *
             * {
             *      type: '',
             *      prop: '',
             *      format: '',
             *      formatInclude: [] | undefined, // undefined 表示支持所有 format
             *      code: '',
             *      valueTypeInclude: [] | undefined // undefined 表示支持所有值类型
             * }
             */
            options: {
                type: Object,
                default: () => ({})
            },
            /**
             * @desc 值数据
             *
             * {
             *      format: '',
             *      code: '',
             *      valueType: '',
             *      renderValue: ''
             * }
             */
            value: Object,
            // 只读
            readonly: {
                type: Boolean,
                default: false
            },
            remoteConfig: {
                type: Object,
                default: () => ({
                    show: false,
                    value: '',
                    name: ''
                })
            }
        },

        data () {
            return {
                formData: {}
            }
        },

        computed: {
            renderFormatMap () {
                if (!this.options.formatInclude) {
                    return {
                        ...formatTypeMap
                    }
                }
                return this.options.formatInclude.reduce((result, format) => {
                    if (formatTypeMap[format]) {
                        result[format] = formatTypeMap[format]
                    }
                    return result
                }, {})
            }
        },
        watch: {
            value: {
                handler (value) {
                    if (this.innerChange) {
                        this.innerChange = false
                        return
                    }
                    this.formData = genFormData(value)
                },
                immediate: true
            }
        },
        methods: {
            triggerChange () {
                this.innerChange = true
                this.$emit('change', {
                    ...this.formData
                })
            },
            /**
             * 选择数据源的时候
             */
            handleChooseTable ({ tableName, dataSourceType, thirdPartDBName }) {
                this.formData.code = tableName
                this.formData.dataSourceType = dataSourceType
                this.formData.thirdPartDBName = thirdPartDBName
                this.triggerChange()
            },
            /**
             * @desc 格式改变
             * @param { String } format
             * code 代表 选择的变量 或者 填写的表达式
             * format 改变时需要重置 code 的值
             */
            handleFormatChange (format) {
                if (format === this.formData.format) {
                    return
                }
                this.formData.format = format
                this.formData.code = ''
                this.formData.thirdPartDBName = ''
                this.triggerChange()
            },
            /**
             * @desc 选中变量、更新表单式
             * @param { Object } payload
             */
            handleChange: _.throttle(function (payload) {
                this.formData = {
                    ...this.formData,
                    ...payload
                }
                this.triggerChange()
            }, 60)
        }
    }
</script>
<style lang="postcss" scoped>
    .select-variable {
        position: relative;
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #63656E;
            word-break: keep-all;
            width: 100%;
        }
        .format-list {
            position: absolute;
            right: 0;
            border: none;
            /deep/ .bk-select-angle {
                font-size: 16px;
                top: 7px;
                color: #b1b4bc;
            }
            /deep/ .bk-select-name {
                padding: 0 20px 0 0;
                text-align: right;
                font-size: 12px;
                color: #b1b4bc;
                transform: scale(0.9);
                line-height: 32px;
            }
        }
        .readonly-text {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 32px;
            padding: 0 2px 0 10px;
            border: 1px solid #c4c6cc;
            cursor: pointer;
            border-radius: 2px;
            font-size: 12px;
            .select-variable-placeholder {
                color: #c3cdd7;
                pointer-events: none;
            }
            &.is-focus {
                border-color: #3a84ff;
                box-shadow: 0 0 4px rgb(58 132 255 / 40%);
            }
            .bk-icon {
                font-size: 20px;
                display: inline-block;
                &.icon-angle-down {
                    color: #979ba5;
                }
                &.icon-flip {
                    transform: rotate(-180deg);
                }
                &.icon-close-circle-shape {
                    color: #c4c6cc;
                    cursor: pointer;
                    font-size: 14px;
                    display: none;
                }
            }
            &:hover {
                .has-val.icon-close-circle-shape {
                    display: inline-block;
                    margin-right: 4px;
                }
                .has-val.icon-angle-down {
                    display: none;
                }
            }
        }
        .display-content {
            width: 100%;
            margin-bottom: 16px;
            .edit-text {
                font-size: 12px;
                cursor: pointer;
                color: #3a84ff;
                margin-top: 4px;
            }
        }
    }
</style>
