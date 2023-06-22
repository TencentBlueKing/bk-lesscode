<template>
    <section>
        <bk-table :data="filterVariableList"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            class="variable-table"
            size="medium"
        >
            <bk-table-column :label="$t('table_变量名称')" prop="variableName" :render-header="renderHeaderAddTitle" show-overflow-tooltip></bk-table-column>
            <bk-table-column :label="$t('变量标识')" prop="variableCode" :render-header="renderHeaderAddTitle" show-overflow-tooltip></bk-table-column>
            <bk-table-column :label="$t('table_初始类型')" prop="valueType" :render-header="renderHeaderAddTitle" :formatter="valueTypeFormatter" show-overflow-tooltip></bk-table-column>
            <bk-table-column :label="$t('默认值')" width="240" show-overflow-tooltip>
                <template slot-scope="props">
                    <span v-for="(val, key) in getDisplayDefaultValue(props.row)" :key="key" class="default-value" v-bk-overflow-tips>{{ `【${nameMap[key]}】${val}` }}</span>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('引用')" width="100" show-overflow-tooltip>
                <template slot-scope="props">
                    <span v-bk-tooltips.light="{ content: getUseInfoTips(props.row.useInfo).join('<br>'), disabled: !getUseInfoTips(props.row.useInfo).length, maxWidth: 400 }" class="use-info">
                        {{ getUseInfoTips(props.row.useInfo).length }}
                    </span>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('table_生效范围')" prop="effectiveRange" :render-header="renderHeaderAddTitle" :formatter="effectiveRangeFormatter" show-overflow-tooltip></bk-table-column>
            <template v-if="!simpleDisplay">
                <bk-table-column :label="$t('table_变量说明')" prop="description" :render-header="renderHeaderAddTitle" show-overflow-tooltip>
                    <template slot-scope="props">
                        <span>{{ props.row.description || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('table_更新人')" prop="updateUser" show-overflow-tooltip min-width="100"></bk-table-column>
                <bk-table-column :label="$t('table_更新时间')" prop="updateTime" :render-header="renderHeaderAddTitle" :formatter="timeFormatter" show-overflow-tooltip></bk-table-column>
            </template>
            <bk-table-column :label="$t('操作')" width="120">
                <template slot-scope="props">
                    <span @click="showVariableForm(props.row)"
                        v-bk-tooltips="{ content: getEditStatus(props.row), disabled: !getEditStatus(props.row), maxWidth: 400 }"
                        :class="{ 'table-btn': true, disable: getEditStatus(props.row) }"
                    >{{ $t('编辑') }}</span>
                    <span @click="showDeleteVariable(props.row)"
                        v-bk-tooltips="{ content: getDeleteStatus(props.row), disabled: !getDeleteStatus(props.row), maxWidth: 400 }"
                        :class="{ 'table-btn': true, disable: getDeleteStatus(props.row) }"
                    >{{ $t('删除') }}</span>
                </template>
            </bk-table-column>
            <empty-status slot="empty" :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
        </bk-table>
        <slot>
            <span class="variable-tip">
                {{ $t('提示：') }} <br>1. {{ $t('可以在组件属性和指令的配置面板中使用该变量') }}
                <br>2. {{ $t('在函数插槽中可以使用【lesscode.变量标识】唤醒编辑器自动补全功能选择对应变量，来获取或者修改该变量的值') }}
                <br>3. {{ $t('在远程函数中，参数 Api Url 的值可用') }} <span v-text="$store.state.Language === 'en' ? '{{ variable identification }}' : '{{变量标识}}'"></span> {{ $t('来获取变量值，请求参数中可以通过选择变量的形式获取变量值') }}
            </span>
        </slot>

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
        />
    </section>
</template>

<script>
    import dayjs from 'dayjs'
    import { mapGetters, mapActions, mapState } from 'vuex'
    import VariableForm from '@/components/variable/variable-form/index.vue'
    import { renderHeaderAddTitle } from '@/common/util'

    export default {
        components: {
            VariableForm
        },

        props: {
            simpleDisplay: {
                type: Boolean,
                default: false
            },
            searchTxt: {
                type: String,
                default: ''
            }
        },

        data () {
            return {
                nameMap: {
                    all: this.$t('所有环境'),
                    stag: this.$t('预发布环境'),
                    prod: this.$t('生产环境')
                },
                deleteObj: {
                    visible: false,
                    code: '',
                    loading: false
                },
                projectVariableList: [],
                variableFormData: {
                    isShow: false,
                    formData: {}
                }
            }
        },

        computed: {
            ...mapGetters('variable', ['variableList']),
            ...mapState(['user']),
            ...mapGetters('page', ['pageDetail']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),

            filterVariableList () {
                return (this.variableList || []).filter((variable) => {
                    return (variable.variableName || '').includes(this.searchTxt) || (variable.variableCode || '').includes(this.searchTxt)
                })
            },

            projectId () {
                return this.$route.params.projectId
            },

            emptyType () {
                if (this.searchTxt?.length > 0) {
                    return 'search'
                }
                return 'noData'
            }
        },

        created () {
            this.getProjectVariableList()
        },

        methods: {
            ...mapActions('variable', ['deleteVariable', 'getAllVariable', 'getAllProjectVariable']),

            // 变量存在页面变量使用全局变量的情况，所以需要获取应用所有变量来展示
            getProjectVariableList () {
                this.getAllProjectVariable({ projectId: this.projectId, versionId: this.versionId }).then((res) => {
                    this.projectVariableList = res || []
                })
            },

            getEditStatus (row) {
                let tip = ''
                if (this.simpleDisplay && row.effectiveRange === 0) tip = this.$t('应用级变量，请到变量管理进行修改')
                return tip
            },

            getDeleteStatus (row) {
                let tip = ''
                if (this.getUseInfoTips(row.useInfo).length > 0) tip = this.$t('该变量被引用，无法删除')
                if (this.simpleDisplay && row.effectiveRange === 0) tip = this.$t('应用级变量，请到变量管理进行删除')
                return tip
            },

            showVariableForm (formData = {}) {
                const isDisable = this.getEditStatus(formData)
                if (isDisable) return
                this.variableFormData = {
                    isShow: true,
                    formData
                }
            },

            showDeleteVariable (row) {
                const isDisable = this.getDeleteStatus(row)
                if (isDisable) return
                this.deleteObj.id = row.id
                this.deleteObj.code = row.variableCode
                this.deleteObj.visible = true
            },

            requestDeleteVariable (id) {
                this.deleteObj.loading = true
                this.deleteVariable(id).then(() => {
                    return this.refreshVariable()
                }).catch((err) => {
                    this.$bkMessage({ theme: 'error', message: err.message || err })
                }).finally(() => {
                    this.deleteObj.loading = false
                    this.deleteObj.visible = false
                })
            },

            refreshVariable () {
                const routerParams = this.$route.params || {}
                const params = { projectId: routerParams.projectId, effectiveRange: 0 }
                if (routerParams.pageId) {
                    params.pageCode = this.pageDetail.pageCode
                }
                return this.getAllVariable(params)
            },

            handleDeleteCancel () {
                this.deleteObj.visible = false
            },

            timeFormatter (obj, con, val) {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'
            },

            getDisplayDefaultValue (row) {
                const valList = {}
                const defaultVal = row.defaultValue || {}
                const showKeyList = row.defaultValueType === 0 ? ['all'] : ['prod', 'stag']
                showKeyList.forEach((key) => {
                    let val = defaultVal[key]
                    if (![3, 4].includes(row.valueType)) val = JSON.stringify(val)
                    valList[key] = val
                })
                return valList
            },

            effectiveRangeFormatter (obj, con, val) {
                const rangeMap = {
                    0: this.$t('本应用'),
                    1: this.$t('页面【{0}】', [obj.pageCode])
                }
                return rangeMap[val]
            },

            valueTypeFormatter (obj, con, val) {
                const valueTypeMap = {
                    0: 'String',
                    1: 'Number',
                    2: 'Boolean',
                    3: 'Array',
                    4: 'Object',
                    5: this.$t('图片地址'),
                    6: this.$t('计算变量')
                }
                return valueTypeMap[obj.valueType]
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
            },

            handlerClearSearch (searchName) {
                this.$emit('clearSearch', searchName)
            },
            renderHeaderAddTitle
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .variable-table {
        margin-bottom: 12px;
        &:before {
            height: 0;
        }
        /deep/ .bk-table-body-wrapper {
            @mixin scroller;
            max-height: calc(100vh - 350px);
            overflow-y: auto;
            .bk-table-1-column-4 div {
                -webkit-line-clamp: 2;
            }
        }
        .table-btn {
            margin-right: 15px;
            cursor: pointer;
            color: #3a84ff;
            &.disable {
                cursor: not-allowed;
                color: #dcdee5;
            }
        }
        .use-info {
            color: #3a84ff;
            cursor: pointer;
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
    }
    .variable-tip {
        font-size: 12px;
        color: #979ba5;
        line-height: 16px;
    }
    /deep/ .delete-dialog-wrapper {
        text-align: center;
        .bk-dialog-footer {
            text-align: center;
            padding: 0 65px 40px;
            background-color: #fff;
            border: none;
            border-radius: 0;
        }
        .dialog-footer {
            button {
                width: 86px;
            }
        }
    }
</style>
