<template>
    <section class="table-pagination">
        <section>
            <span class="g-prop-sub-title pagination-title">{{ $t('分页类型') }}</span>
            <bk-radio-group
                class="g-prop-radio-group"
                :value="paginationPayload.type"
                @change="handleTypeChange(...arguments)"
            >
                <bk-radio-button value="none">
                    {{ $t('无分页') }} </bk-radio-button>
                <bk-radio-button value="local">
                    {{ $t('本地分页') }} <i
                        class="bk-icon icon-info"
                        v-bk-tooltips="{
                            content: $t('本地分页下，属性【data】需传入全部数据，系统会自动处理分页逻辑'),
                            width: 300
                        }"
                    ></i>
                </bk-radio-button>
                <bk-radio-button value="remote">
                    {{ $t('远程分页') }} <i
                        class="bk-icon icon-info"
                        v-bk-tooltips="{
                            content: $t('远程分页下，如果属性【data】的属性初始值来源是【数据表】，系统会通过远程接口自动处理分页逻辑。否则需要用户在【page-change和page-limit-change】事件中处理分页逻辑。注意：当属性【data】的属性初始值来源是【数组、函数】，表格会展示整个data的数据，用户需要传递正确的分页数据'),
                            width: 300
                        }"
                    ></i>
                </bk-radio-button>
            </bk-radio-group>
        </section>

        <template v-if="paginationPayload.type !== 'none'">
            <template v-for="config in paginationConfig">
                <template v-if="config.name === 'count'">
                    <div
                        class="g-prop-sub-title pagination-title"
                        :key="config.name + 'name'"
                    >
                        <span
                            class="bottom-line"
                            v-bk-tooltips="{
                                content: config.tips,
                                placements: ['left-start'],
                                boundary: 'window',
                                maxWidth: 400
                            }"
                        >
                            count
                        </span>
                    </div>
                    <choose-build-in-variable
                        class="g-mb6"
                        name="pagination.count"
                        :key="config.name + 'variable'"
                        :build-in-variable="buildInVariable"
                        :component-id="componentId"
                        :build-in-variable-type="paginationPayload.val.count.buildInVariableType"
                        :payload="{ customVariableCode: paginationPayload.val.count.customVariableCode }"
                        :option="{ valueTypeInclude: ['number'] }"
                        @change="handleBuildInVariableChange"
                    />
                </template>
                <variable-select
                    v-else
                    :key="config.name"
                    :options="{
                        valueTypeInclude: [config.type],
                        formatInclude: ['value', 'variable', 'expression']
                    }"
                    :value="{
                        format: paginationPayload.val[config.name].format,
                        code: paginationPayload.val[config.name].code
                    }"
                    @change="handleVariableFormatChange(config.name, ...arguments)">
                    <template v-slot:title>
                        <div class="g-prop-sub-title pagination-title">
                            <span
                                class="bottom-line"
                                v-bk-tooltips="{
                                    content: config.tips,
                                    placements: ['left-start'],
                                    boundary: 'window',
                                    maxWidth: 400
                                }"
                            >
                                {{ config.name }}
                            </span>
                        </div>
                    </template>
                    <bk-select
                        v-if="config.options"
                        :value="paginationPayload.val[config.name].val"
                        @change="(val) => handleValueChange(config.name, +val)"
                    >
                        <bk-option v-for="option in config.options"
                            :key="option"
                            :id="option"
                            :name="option">
                        </bk-option>
                    </bk-select>
                    <bk-input
                        v-else-if="config.type === 'number'"
                        type="number"
                        :value="paginationPayload.val[config.name].val"
                        @change="(val) => handleValueChange(config.name, +val)"
                    ></bk-input>
                    <bk-switcher
                        v-else
                        theme="primary"
                        size="small"
                        :value="paginationPayload.val[config.name].val"
                        @change="(val) => handleValueChange(config.name, val)"
                    ></bk-switcher>
                </variable-select>
            </template>
        </template>
    </section>
</template>

<script>
    import {
        defineComponent,
        ref
    } from '@vue/composition-api'
    import {
        isEmpty
    } from 'shared/util.js'
    import variableSelect from '@/components/variable/variable-select'
    import chooseBuildInVariable from '@/components/variable/choose-build-in-variable'
    import { camelCase, camelCaseTransformMerge } from 'change-case'

    export default defineComponent({
        components: {
            variableSelect,
            chooseBuildInVariable
        },

        props: {
            name: String,
            type: String,
            defaultValue: Object,
            payload: Object,
            change: Function,
            componentId: String
        },

        setup (props) {
            const paginationConfig = [
                {
                    name: 'show-total-count',
                    tips: window.i18n.t('是否显示总数'),
                    type: 'boolean'
                },
                {
                    name: 'count',
                    tips: window.i18n.t('数据总数，当属性【data】的属性初始值来源为【函数】时，该属性需要在函数中结合变量进行修改'),
                    type: 'number'
                },
                {
                    name: 'show-limit',
                    tips: window.i18n.t('是否显示切换分页条数'),
                    type: 'boolean'
                },
                {
                    name: 'limit',
                    tips: window.i18n.t('分页每页条数'),
                    type: 'number',
                    options: [
                        10,
                        20,
                        50,
                        100
                    ]
                },
                {
                    name: 'current',
                    tips: window.i18n.t('分页当前页码'),
                    type: 'number'
                }
            ]
            const paginationPayload = ref({
                'type': 'none',
                'val': {
                    'show-total-count': {
                        format: 'value',
                        val: true,
                        code: ''
                    },
                    'count': {
                        buildInVariableType: 'SYSTEM',
                        customVariableCode: ''
                    },
                    'show-limit': {
                        format: 'value',
                        val: true,
                        code: ''
                    },
                    'limit': {
                        format: 'value',
                        val: 10,
                        code: ''
                    },
                    'current': {
                        format: 'value',
                        val: 1,
                        code: ''
                    }
                },
                ...props.payload
            })
            const buildInVariable = `${camelCase(props.componentId, { transform: camelCaseTransformMerge })}paginationCount`

            const handleVariableFormatChange = (name, { code, format, renderValue }) => {
                paginationPayload.value.val[name].format = format
                paginationPayload.value.val[name].code = code
                if (!isEmpty(renderValue)) {
                    paginationPayload.value.val[name].val = renderValue
                }
                triggleChange()
            }

            const handleTypeChange = (val) => {
                paginationPayload.value.type = val
                triggleChange()
            }

            const handleValueChange = (name, val) => {
                paginationPayload.value.val[name].val = val
                triggleChange()
            }

            const handleBuildInVariableChange = ({ buildInVariableType, payload }) => {
                paginationPayload.value.val.count.buildInVariableType = buildInVariableType
                paginationPayload.value.val.count.customVariableCode = payload.customVariableCode
                triggleChange()
            }

            const triggleChange = () => {
                props.change(
                    props.name,
                    props.defaultValue,
                    props.type,
                    paginationPayload.value
                )
            }

            return {
                paginationConfig,
                paginationPayload,
                buildInVariable,
                handleVariableFormatChange,
                handleTypeChange,
                handleValueChange,
                handleBuildInVariableChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .pagination-title {
        line-height: 30px;
    }
    .bottom-line {
        border-bottom: 1px dashed #313238;
        cursor: pointer;
    }
    .table-pagination {
        /deep/ .display-content {
            margin-top: 0;
            margin-bottom: 8px;
        }
        /deep/ .format-list {
            top: 0;
        }
    }
</style>
