<template>
    <div>
        <div
            :class="{
                'select-variable-value': true,
                'is-focus': isShowVariable
            }"
            v-bk-tooltips="htmlConfig"
            ref="tooltipsHtml">
            <bk-input
                class="choose-variable"
                :placeholder="$t('请选择变量')"
                :value="formData.code"
                readonly />
            <i
                :class="[
                    'choose-icon bk-icon icon-angle-down',
                    {
                        'hover-hidden': formData.code
                    }
                ]"
            ></i>
            <i
                :class="[
                    'choose-icon bk-icon icon-close-circle-shape',
                    {
                        'hover-show': formData.code
                    }
                ]"
                @click.stop="handleClear"
            ></i>
        </div>
        <div class="variable-list">
            <bk-input
                :placeholder="$t('请输入变量名称或者标识进行搜索')"
                behavior="simplicity"
                class="variable-input"
                left-icon="bk-icon icon-search"
                v-model="searchText"
                @change="handleSearch" />
            <bk-table
                :data="renderVarialbeList"
                :outer-border="false"
                :header-border="false"
                :header-cell-style="{ background: '#f0f1f5' }"
                :row-class-name="getVariableListRowClassName"
                class="variable-table"
                @row-click="handleVariableChange"
                @row-mouse-enter="handleRowMouseEnter">
                <bk-table-column
                    label=""
                    prop="variableName"
                    show-overflow-tooltip width="35">
                    <template slot-scope="props">
                        <bk-radio
                            :value="props.row.variableCode === formData.code"
                            :disabled="props.row.useInfo.disabled" />
                    </template>
                </bk-table-column>
                <bk-table-column
                    :label="$t('table_变量名称')"
                    prop="variableName"
                    show-overflow-tooltip
                    width="120" />
                <bk-table-column
                    :label="$t('变量标识')"
                    prop="variableCode"
                    show-overflow-tooltip
                    width="120" />
                <bk-table-column
                    :label="$t('table_初始类型')"
                    show-overflow-tooltip
                    width="90">
                    <template slot-scope="props">
                        <span>{{ getVariableTypeText(props.row) }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column
                    :label="$t('table_生效范围')"
                    show-overflow-tooltip
                    width="100">
                    <template slot-scope="props">
                        <span>{{ getEffectiveRangeText(props.row) }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column
                    :label="$t('默认值')"
                    width="180">
                    <template slot-scope="props">
                        <span
                            v-for="(val, key) in getVariableDefaultValue(props.row)"
                            :key="key"
                            class="default-value"
                            v-bk-overflow-tips>
                            {{ `【${envTextMap[key]}】${val}` }}
                        </span>
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('引用')" width="70" show-overflow-tooltip>
                    <template slot-scope="props">
                        <span v-bk-tooltips.light="{ content: getUseInfoTips(props.row.useRecord).join('<br>'), disabled: !getUseInfoTips(props.row.useRecord).length, maxWidth: 400 }" class="table-btn">
                            {{ getUseInfoTips(props.row.useRecord).length }}
                        </span>
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('操作')" width="100">
                    <template slot-scope="props">
                        <span>
                            <bk-button
                                text
                                @click.native.stop="handleEditVariable(props.row)"
                            >
                                {{ $t('编辑') }} </bk-button>
                        </span>

                        <span @click.stop="showDeleteVariable(props.row)"
                            v-bk-tooltips="{ content: getDeleteStatus(props.row), disabled: !getDeleteStatus(props.row), maxWidth: 400 }"
                            :class="{ 'table-btn': true, disable: getDeleteStatus(props.row) }"
                            style="margin-left: 6px;"
                        >{{ $t('删除') }}</span>
                    </template>
                </bk-table-column>
            </bk-table>
            <footer class="variable-footer">
                <bk-button
                    :text="true"
                    title="primary"
                    @click="handleEditVariable()">
                    <i class="bk-drag-icon bk-drag-add-line"></i>
                    {{ $t('新建变量') }} </bk-button>
                <bk-button
                    :text="true"
                    title="primary"
                    @click="handleGoGlobalVariableManage">
                    <i class="bk-drag-icon bk-drag-jump-link"></i>
                    {{ $t('管理应用级公共变量') }} </bk-button>
            </footer>
        </div>
        <div v-if="remoteConfig.show">
            <span
                class="remote-example"
                @click="handleShowRemoteExample">
                {{ $t('数据示例') }} </span>
            <remote-example
                ref="example"
                :data="remoteConfig" />
        </div>
        <bk-dialog v-model="deleteObj.visible"
            render-directive="if"
            theme="primary"
            ext-cls="delete-dialog-wrapper"
            :title="$t('删除变量')"
            width="400"
            footer-position="center"
            :mask-close="false"
            :auto-close="false">
            {{ $t('确定删除变量【{0}】', [deleteObj.code]) }}<div class="dialog-footer" slot="footer">
                <bk-button
                    theme="danger"
                    :loading="deleteObj.loading"
                    @click="requestDeleteVariable(deleteObj.id)"
                >{{ $t('删除') }}</bk-button>
                <bk-button @click="handleDeleteCancel" :disabled="deleteObj.loading">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
        <variable-form
            :is-show.sync="variableFormData.isShow"
            :form-data="variableFormData.formData"
            :show-save-use="true"
            :value-type-include="options.valueTypeInclude"
            @save-use="handleVariableChange"
        />
    </div>
</template>
<script>
    import _ from 'lodash'
    import { mapGetters, mapActions } from 'vuex'
    import remoteExample from '@/element-materials/modifier/component/props/components/strategy/remote-example'
    import { VARIABLE_TYPE, VARIABLE_VALUE_TYPE } from 'shared/variable/index.js'
    import VariableForm from '@/components/variable/variable-form/index.vue'
    import LC from '@/element-materials/core'

    const typeEnum = {
        0: 'string',
        1: 'number',
        2: 'boolean',
        3: 'array',
        4: 'object',
        5: 'string',
        6: 'all'
    }

    export default {
        components: {
            remoteExample,
            VariableForm
        },
        props: {
            options: {
                type: Object,
                required: true
            },
            formData: Object,
            remoteConfig: Object,
            isChooseCustomVariable: Boolean
        },
        data () {
            return {
                isShowVariable: false,
                renderVarialbeList: [],
                searchText: '',
                variableFormData: {
                    isShow: false,
                    formData: {}
                },
                deleteObj: {
                    visible: false,
                    code: '',
                    loading: false
                },
                customVariableMap: {}
            }
        },
        computed: {
            ...mapGetters('variable', ['variableList']),

            wholeVariableList () {
                return this.variableList.map(variable => {
                    // 变量类型名
                    const variableValueTypeStr = typeEnum[variable.valueType]
                    const customVariableInfo = this.customVariableMap[variable.variableCode]
                    // 是否不可用
                    const useInfo = {
                        disabled: false
                    }
                    if (variableValueTypeStr !== 'all'
                        && (this.options.valueTypeInclude
                            && !this.options.valueTypeInclude.includes(variableValueTypeStr))) {
                        useInfo.disabled = true
                        useInfo.tips = this.$t('变量初始类型不适合该属性')
                    } else if (customVariableInfo) {
                        useInfo.disabled = true
                        useInfo.tips = this.$t('该变量使用在组件【ID：{0}】的【{1}】的自定义变量中，不可重复使用', [customVariableInfo.componentId, customVariableInfo.key])
                    }
                    const useRecord = variable.useInfo
                    return {
                        ...variable,
                        useInfo,
                        useRecord
                    }
                })
            }
        },

        created () {
            this.getVariableList()
            this.renderVarialbeList = Object.freeze(this.wholeVariableList)

            this.envTextMap = {
                all: this.$t('所有环境'),
                stag: this.$t('预发布环境'),
                prod: this.$t('生产环境')
            }
            this.htmlConfig = {
                allowHtml: true,
                width: 850,
                trigger: 'click',
                theme: 'light',
                content: '.variable-list',
                placement: 'bottom-start',
                boundary: 'window',
                onShow: () => {
                    this.isShowVariable = true
                    this.handleSearch(this.searchText)
                },
                onHide: () => {
                    this.isShowVariable = false
                }
            }
        },
        methods: {
            ...mapActions('variable', ['deleteVariable', 'getAllVariable']),
            // 获取已使用的自定义变量 map
            getVariableList () {
                const recTree = node => {
                    if (!node) {
                        return
                    }
                    Object.keys(node.variable).forEach(variablePathKey => {
                        const variable = node.variable[variablePathKey]
                        if (variable.type === 'buildIn') {
                            let key = variable.key
                            // slot 取配置的 displayname
                            if (variable.source === 'slot') {
                                key = node.material?.slots?.[key]?.displayName
                            }
                            this.customVariableMap[variable.code] = {
                                key,
                                componentId: node.componentId
                            }
                        }
                    })
                    node.children.forEach(childNode => recTree(childNode))
                }
                // 自定义变量互相不能选择，其余根据值类型过滤
                if (this.isChooseCustomVariable) {
                    recTree(LC.getRoot())
                }
            },
            /**
             * @desc 获取变量的默认值
             * @returns { Boolean }
             */
            getVariableDefaultValue (row) {
                const valList = {}
                const defaultVal = row.defaultValue || {}
                const showKeyList = row.defaultValueType === VARIABLE_VALUE_TYPE.SAME ? ['all'] : ['prod', 'stag']
                showKeyList.forEach((key) => {
                    let val = defaultVal[key]
                    if (![VARIABLE_TYPE.ARRAY.VAL, VARIABLE_TYPE.OBJECT.VAL].includes(row.valueType)) val = JSON.stringify(val)
                    valList[key] = val
                })
                return valList
            },
            /**
             * @desc 变量类型展示文本
             * @returns { String }
             */
            getVariableTypeText ({ valueType }) {
                const variableType = Object.keys(VARIABLE_TYPE).find((variableTypeKey) => VARIABLE_TYPE[variableTypeKey].VAL === valueType)
                return VARIABLE_TYPE[variableType].NAME
            },
            /**
             * @desc 生效范围展示文本
             * @returns { String }
             */
            getEffectiveRangeText ({ effectiveRange }) {
                const rangeMap = {
                    0: '本应用',
                    1: '本页面'
                }
                return window.i18n.t(rangeMap[effectiveRange])
            },
            /**
             * @desc 变量列表行样式
             * @param { Boolean } name
             * @returns { Boolean }
             */
            getVariableListRowClassName ({ row }) {
                return row.useInfo.disabled ? 'variable-disabled' : ''
            },
            /**
             * @desc 鼠标移入 tips
             * @param { Number } index
             * @param { Object } event
             * @param { Object } row
             */
            handleRowMouseEnter (index, event, row) {
                const rowEl = event.currentTarget
                const targetEl = rowEl?.cells?.[0]?.querySelector('.bk-form-radio')
                if (!targetEl || targetEl._tippy || !row.useInfo.disabled) return
                const instance = this.$bkPopover(targetEl, {
                    content: row.useInfo.tips,
                    arrow: true,
                    extCls: 'variable-disabled-tips',
                    triggerTarget: rowEl,
                    placement: 'top',
                    boundary: 'window'
                })
                instance.show()
            },
            /**
             * @desc 变量列表搜索
             * @param { String } searchText
             */
            handleSearch: _.throttle(function (searchText) {
                this.searchText = searchText.trim()
                if (this.searchText === '') {
                    this.renderVarialbeList = Object.freeze(this.wholeVariableList)
                    return
                }
                this.renderVarialbeList = Object.freeze(this.wholeVariableList.reduce((result, variable) => {
                    if (variable.variableName.includes(this.searchText) || variable.variableCode.includes(this.searchText)) {
                        result.push(variable)
                    }
                    return result
                }, []))
            }, 60),
            /**
             * @desc 选中变量
             * @param { Object } variableData
             */
            handleVariableChange (variableData) {
                if (variableData?.useInfo?.disabled) {
                    return
                }

                this.$refs.tooltipsHtml._tippy.hide()

                const getVariableValue = ({ valueType, defaultValueType, defaultValue }) => {
                    if (valueType === VARIABLE_TYPE.COMPUTED.VAL) {
                        return this.formData.renderValue
                    }

                    let value
                    if (defaultValueType === VARIABLE_VALUE_TYPE.SAME) {
                        value = defaultValue.all
                    } else if (defaultValueType === VARIABLE_VALUE_TYPE.DIFFERENT) {
                        value = defaultValue.preview
                    }
                    if ([VARIABLE_TYPE.ARRAY.VAL, VARIABLE_TYPE.OBJECT.VAL].includes(valueType)) {
                        value = JSON.parse(value)
                    }
                    return value
                }

                this.$emit('on-change', {
                    code: variableData.variableCode,
                    renderValue: getVariableValue(variableData)
                })
            },
            /**
             * @desc 新建,编辑变量
             */
            handleEditVariable (formData = {}) {
                this.$refs.tooltipsHtml._tippy.hide()
                this.variableFormData = {
                    isShow: true,
                    formData
                }
            },
            /**
             * @desc 新建全局变量
             */
            handleGoGlobalVariableManage () {
                const projectId = this.$route.params.projectId
                window.open(`/project/${projectId}/variable-manage`, '_blank')
            },
            handleShowRemoteExample () {
                this.$refs.example.isShow = true
            },
            /**
             * 清空 code
             */
            handleClear () {
                this.$emit('on-change', {
                    code: '',
                    renderValue: this.formData.renderValue
                })
            },
            showDeleteVariable (row) {
                const isDisable = this.getDeleteStatus(row)
                this.$refs.tooltipsHtml._tippy.hide()
                if (isDisable) return
                this.deleteObj.id = row.id
                this.deleteObj.code = row.variableCode
                this.deleteObj.visible = true
            },
            requestDeleteVariable (id) {
                this.deleteObj.loading = true
                this.deleteVariable(id).then(() => {
                    this.$bkMessage({ theme: 'success', message: window.i18n.t('删除成功') })
                }).catch((err) => {
                    this.$bkMessage({ theme: 'error', message: err.message || err })
                }).finally(() => {
                    this.deleteObj.loading = false
                    this.deleteObj.visible = false
                })
            },
            handleDeleteCancel () {
                this.deleteObj.visible = false
            },
            getDeleteStatus (row) {
                let tip = ''
                if (this.getUseInfoTips(row.useRecord).length > 0) tip = this.$t('该变量被引用，无法删除')
                if (this.simpleDisplay && row.effectiveRange === 0) tip = this.$t('应用级变量，请到变量管理进行删除')
                return tip
            },

            getUseInfoTips (useInfo) {
                const tips = [];
                (useInfo || []).forEach((item) => {
                    const { pageCode, funcCode, type, useInfo, parentVariableId } = item
                    switch (type) {
                        case 'func':
                            tips.push(this.$t('函数【{0}】', [funcCode]))
                            break
                        case 'var':
                            const variable = this.projectVariableList.find((variable) => (variable.id === parentVariableId)) || {}
                            tips.push(this.$t('变量【{0}】', [variable.variableCode]))
                            break
                        default:
                            (useInfo || []).forEach((detail) => {
                                if (detail.type === 'v-bind') {
                                    const modifiers = (detail.modifiers || []).join('.')
                                    const modifierStr = modifiers ? '，' + this.$t('修饰符为{0}', [modifiers]) : ''
                                    tips.push(this.$t('页面【{0}】内组件【{1}】的【{2}】属性{3}', [pageCode, detail.componentId, detail.prop, modifierStr]))
                                } else if (detail.source === 'prop') {
                                    tips.push(this.$t('页面【{0}】内组件【{1}】的【{2}】属性', [pageCode, detail.componentId, detail.key]))
                                } else if (detail.source === 'slot') {
                                    tips.push(this.$t('页面【{0}】内组件【{1}】的【{2}】插槽', [pageCode, detail.componentId, detail.key]))
                                } else if (detail.type === 'slots') {
                                    tips.push(this.$t('页面【{0}】内组件【{1}】的【{2}】插槽', [pageCode, detail.componentId, detail.slot]))
                                } else if (detail.source === 'lifecycle') {
                                    tips.push(this.$t('页面【{0}】的【{1}】的生命周期', [pageCode, detail.key]))
                                } else if (detail.source === 'event') {
                                    tips.push(this.$t('页面【{0}】内组件【{1}】的【{2}】事件', [pageCode, detail.componentId, detail.key]))
                                } else {
                                    tips.push(this.$t('页面【{0}】内组件【{1}】的【{2}】指令', [pageCode, detail.componentId, (detail.type || detail.source)]))
                                }
                            })
                            break
                    }
                })
                return tips
            }
        }
    }
</script>
<style lang="postcss">
    .select-popover-variable .bk-option-content {
        padding: 0 10px;
        .bk-option-content-default {
            padding: 0;
        }
    }
    .variable-list .bk-table-body-wrapper .bk-table-row.variable-disabled {
        cursor: not-allowed;
    }
    .variable-disabled-tips .tippy-content {
        font-size: 12px;
    }
</style>
<style lang="postcss" scoped>
    .select-variable-value {
        position: relative;
        .choose-variable {
            width: 100%;
            cursor: pointer;
            ::v-deep .bk-form-input[readonly] {
                background-color: #ffffff !important;
                border-color: #c4c6cc !important;
                cursor: pointer;
            }
        }
        .choose-icon {
            cursor: pointer;
            position: absolute;
            right: 4px;
            top: 4px;
            color: #979ba5;
            font-size: 22px;
            z-index: 2;
            &.icon-close-circle-shape {
                display: none;
                position: absolute;
                right: 8px;
                top: 8px;
                text-align: center;
                font-size: 14px;
                z-index: 100;
                color: #c4c6cc;
                &:hover {
                    color: #979ba5;
                }
            }
        }
        &:hover {
            .hover-hidden {
                display: none;
            }
            .hover-show {
                display: block;
            }
        }
        &.is-focus {
            .icon-angle-down {
                transform: rotate(180deg);
            }
            /deep/ .choose-variable .bk-input-text input {
                border-color: #3a84ff !important;
                box-shadow: 0 0 4px rgb(58 132 255 / 40%);
            }
        }
    }
    .variable-list {
       .variable-table:before {
           height: 0;
       }
       /deep/ .bk-table-header {
           th, .cell, .bk-table-header-label {
               height: 32px;
               line-height: 32px;
           }
       }
       /deep/ .bk-table-body-wrapper {
            max-height: 500px;
            overflow-y: auto;
            .bk-table-1-column-4 div {
                -webkit-line-clamp: 2;
            }
            .bk-table-row {
                cursor: pointer;
            }
            .bk-table-empty-text {
                padding: 30px 0 10px;
            }
        }
        .variable-footer {
            margin: 17px 0 8px;
            display: flex;
            justify-content: space-between;
            padding: 0 16px 0 4px;
            /deep/ .bk-button-text {
                font-size: 12px;
                line-height: 16px;
                span {
                    display: flex;
                    align-items: center;
                }
                .bk-drag-icon {
                    font-size: 14px !important;
                    margin-right: 5px;
                }
            }
        }
        .variable-input {
            margin-bottom: 8px;
            /deep/ .control-icon.left-icon {
                left: 0;
            }
            /deep/ .bk-input-text .bk-form-input {
                padding-left: 23px;
            }
        }
        .default-value {
            display: block;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: normal;
            word-break: break-all;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
        }
        .table-btn {
            color: #3a84ff;
            cursor: pointer;
            &.disable {
                cursor: not-allowed;
                color: #dcdee5;
            }
        }
   }
   .remote-example {
        color: #3a84ff;
        cursor: pointer;
        font-size: 12px;
        margin-top: 5px;
    }
</style>
