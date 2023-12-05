<template>
    <bk-dialog
        header-position="left"
        ext-cls="data-source-worksheet-dialog"
        title="配置表单数据源"
        :mask-close="false"
        :auto-close="false"
        :width="720"
        :show-type-select="false"
        :value="show"
        @confirm="onConfirm"
        @cancel="close">
        <div class="worksheet-data-wrapper">
            <bk-form ref="sourceForm" class="select-worksheet" form-type="vertical" :model="localVal" :rules="sourceRules">
                <bk-form-item :label="$t('数据表')" property="tableName" :required="true" error-display-type="normal">
                    <bk-select
                        :placeholder="$t('请选择数据表')"
                        :value="localVal.tableName"
                        :clearable="false"
                        :searchable="true"
                        :disabled="tableLoading"
                        :loading="tableLoading"
                        @selected="handleSelectForm">
                        <bk-option
                            v-for="item in tableList"
                            :key="item.tableName"
                            :id="item.tableName"
                            :name="`${item.formName || item.tableName}(${item.tableName})`">
                        </bk-option>
                    </bk-select>
                </bk-form-item>
                <bk-form-item :label="$t('字段')" property="fieldKey" :required="true" error-display-type="normal">
                    <bk-select
                        v-model="localVal.fieldKey"
                        :placeholder="$t('请选择字段')"
                        :clearable="false"
                        :searchable="true"
                        :disabled="fieldListLoading"
                        :loading="fieldListLoading">
                        <bk-option
                            v-for="item in fieldList"
                            :key="item.key"
                            :id="item.key"
                            :name="`${item.name}(${item.key})`">
                        </bk-option>
                    </bk-select>
                </bk-form-item>
            </bk-form>
            <div class="filter-rules-wrapper">
                <div class="connector-rule">
                    <label>{{ $t('筛选条件') }}</label>
                    <bk-radio-group v-model="localVal.logic">
                        <bk-radio value="and">{{ $t('且') }}</bk-radio>
                        <bk-radio value="or">{{ $t('或') }}</bk-radio>
                    </bk-radio-group>
                </div>
                <div v-if="localVal.conditions.length > 0" class="condition-list">
                    <div class="condition-item" v-for="(condition, index) in localVal.conditions" :key="index">
                        <bk-select
                            class="field-selector"
                            :value="condition.key"
                            :placeholder="$t('字段')"
                            :clearable="false"
                            @selected="handleSelectField(index, $event)">
                            <bk-option
                                v-for="item in fieldList"
                                :key="item.key"
                                :id="item.key"
                                :name="`${item.name}(${item.key})`">
                            </bk-option>
                        </bk-select>
                        <bk-select
                            v-model="condition.logic"
                            class="logic-selector"
                            :placeholder="$t('逻辑')"
                            :clearable="false">
                            <bk-option
                                v-for="item in getLogicOptions(condition.key)"
                                :key="item.id"
                                :id="item.id"
                                :name="item.name">
                            </bk-option>
                        </bk-select>
                        <bk-select
                            v-model="condition.type"
                            class="type-selector"
                            :placeholder="$t('值类型')"
                            :clearable="false"
                            @selected="condition.value = ''">
                            <bk-option id="const" :name="$t('值')"></bk-option>
                            <bk-option id="field" :name="$t('引用变量')"></bk-option>
                        </bk-select>
                        <bk-select
                            v-if="condition.type === 'field'"
                            v-model="condition.value"
                            class="var-selector"
                            :placeholder="$t('选择变量')"
                            :clearable="false"
                            :loading="relationListLoading"
                            :disabled="relationListLoading">
                            <bk-option
                                v-for="item in relationList"
                                :key="item.key"
                                :id="item.key"
                                :name="`${item.name}(${item.key})`">
                            </bk-option>
                        </bk-select>
                        <field-value
                            v-else
                            :style="{ width: '216px' }"
                            :field="getField(condition.key)"
                            :value="condition.value"
                            @change="condition.value = $event">
                        </field-value>
                        <div class="operate-btns" style="margin-left: 8px">
                            <i class="icon bk-drag-icon bk-drag-add-fill" @click="handleAddCondition(index)"></i>
                            <i class="icon bk-drag-icon bk-drag-reduce-fill" @click="handleDeleteCondition(index)">
                            </i>
                        </div>
                    </div>
                </div>
                <div v-else class="data-empty" @click="handleAddCondition(0)">{{ $t('点击添加') }}</div>
            </div>
        </div>
    </bk-dialog>
</template>
<script>
    import { mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import fieldValue from '../../../common/default-value.vue'

    export default {
        name: 'WorksheetData',
        components: {
            fieldValue
        },
        props: {
            show: Boolean,
            config: {
                type: Object,
                default: () => ({
                    tableName: '',
                    fieldKey: '',
                    logic: 'and',
                    conditions: []
                })
            },
            field: {
                type: Object,
                default: () => ({})
            },
            list: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                localVal: {
                    tableName: '',
                    fieldKey: '',
                    logic: 'and',
                    conditions: []
                },
                tableLoading: false,
                tableList: [], // 数据表列表
                fieldList: [], // 所选择数据表字段
                fieldListLoading: false,
                relationList: [],
                relationListLoading: false,
                errorTips: false,
                sourceRules: {
                    tableName: [
                        {
                            required: true,
                            message: this.$t('数据表为必填项'),
                            trigger: 'blur'
                        }
                    ],
                    fieldKey: [
                        {
                            required: true,
                            trigger: 'blur',
                            message: this.$t('字段为必填项')
                        }
                    ]
                }
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' })
        },
        watch: {
            async show (val) {
                if (val) {
                    this.localVal = cloneDeep(this.config)
                    await this.getTableList()
                    if (this.config.tableName) {
                        this.getFieldList(this.config.tableName)
                    }
                    this.getRelationList()
                }
            }
        },
        methods: {
            async getTableList () {
                try {
                    this.tableLoading = true
                    const projectId = this.$route.params.projectId
                    const [forms, tablesRes] = await Promise.all([
                        this.$store.dispatch('nocode/form/getNewFormList', { projectId, versionId: this.versionId }),
                        this.$store.dispatch('dataSource/list', { projectId})
                    ])
                    console.log(forms)
                    const tableList = []
                    tablesRes.list.forEach(table => {
                        if (table.source === 'nocode') {
                            const form = forms.find(item => item.tableName === table.tableName)
                            if (form) {
                                const { formName, tableName, content } = form
                                const fields = JSON.parse(content).map(item => {
                                    const { key, name } = item.configure
                                    return { key, name: name || key, type: item.type }
                                })
                                tableList.push({ formName, tableName, fields })
                            }
                        } else {
                            const { tableName, columns } = table
                            const fields = columns.map(item => {
                                const { columnId, name } = item
                                // 自定义数据表字段没有表单类型，统一设置为customTable类型
                                return { key: columnId, name, type: 'customTable' }
                            })
                            tableList.push({ formName: tableName, tableName, fields })
                        }
                    })
                    this.tableList = tableList
                    this.tableLoading = false
                } catch (e) {
                    console.error(e)
                }
            },
            getFieldList (tableName) {
                const table = this.tableList.find(table => table.tableName === tableName)
                this.fieldList = table ? table.fields : []
            },
            getRelationList () {
                // 引用本表的下拉框和单选框字段
                const data = []
                this.list.forEach(item => {
                    if (item.configure.key === this.field.configure.key) {
                        return
                    }

                    if (!['description', 'divider', 'auto-counting'].includes(item.type)) {
                        const { key, name } = item.configure
                        data.push({ key, name })
                    }
                })
                this.relationList = data
            },
            getFieldLogics (type) {
                if (['input', 'textarea', 'date', 'select', 'multiple-select', 'member', 'members', 'rich-text', 'desc', 'link'].includes(type)) {
                    return [
                        { id: '==', name: '等于' },
                        { id: 'in', name: '包含' }
                    ]
                }
                return [
                    { id: '==', name: '等于' },
                    { id: '>', name: '大于' },
                    { id: '<', name: '小于' },
                    { id: '>=', name: '大于等于' },
                    { id: '<=', name: '小于等于' }
                ]
            },
            // 筛选条件字段逻辑选项，不同类型的字段有不同的逻辑关系
            getLogicOptions (key) {
                if (key) {
                    const field = this.fieldList.find(i => i.key === key)
                    return field ? this.getFieldLogics(field.type) : []
                }
                return []
            },
            // 筛选条件字段
            getField (key) {
                if (key) {
                    return this.fieldList.find(item => item.key === key)
                }
                return {}
            },
            // 选择表单，清空已选数据
            handleSelectForm (val) {
                this.getFieldList(val)
                const table = this.tableList.find(item => item.tableName === val)
                this.localVal.tableName = table.tableName
                this.localVal.conditions = []
                this.localVal.fieldKey = ''
            },
            // 增加筛选条件
            handleAddCondition (index) {
                this.localVal.conditions.splice(index + 1, 0, {
                    key: '',
                    logic: '',
                    type: '',
                    value: ''
                })
            },
            // 删除筛选条件
            handleDeleteCondition (index) {
                this.localVal.conditions.splice(index, 1)
            },
            handleSelectField (index, val) {
                const condition = this.localVal.conditions[index]
                condition.key = val
                condition.logic = ''
                condition.type = ''
                condition.value = ''
            },
            validate () {
                this.$refs.sourceForm.validate()
                const sourceFormValid = this.localVal.tableName && this.localVal.fieldKey
                return sourceFormValid
            },
            onConfirm () {
                if (!this.validate()) {
                    return
                }
                this.$emit('update', cloneDeep(this.localVal))
                this.close()
            },
            update () {
                this.$emit('update', cloneDeep(this.localVal))
            },
            close () {
                this.$emit('update:show', false)
            }
        }
    }
</script>
<style lang="postcss" scoped>
@import "@/css/mixins/scroller";
.worksheet-data-wrapper {
    padding: 3px 24px 26px;
    max-height: 384px;
    overflow: auto;
    @mixin scroller;
    .select-worksheet {
        display: flex;
        align-items: top;

        .bk-form-item {
        margin-top: 0;
        width: calc(50% - 10px);
        /deep/ {
            .bk-form-content{
                line-height: unset;
            }
            .bk-label {
                font-size: 12px;
            }
        }
        &:not(:last-of-type) {
            margin-right: 20px;
        }
        }
    }
    .filter-rules-wrapper {
        margin-top: 24px;
    }
    .connector-rule {
        display: flex;
        align-items: center;
        height: 20px;

        & > label {
        position: relative;
        margin-right: 30px;
        color: #63656e;
        font-size: 12px;
        white-space: nowrap;
        }
        /deep/ {
            .bk-form-radio {
                margin-right: 24px;
            }
            .bk-radio-text {
                font-size: 12px;
            }
        }
    }
    .condition-item {
        display: flex;
        align-items: center;
        margin-top: 16px;
        .field-selector {
            width: 250px;
            margin-right: 8px;
        }
        .logic-selector {
            width: 100px;
            margin-right: 8px;
        }
        .type-selector {
            width: 100px;
            margin-right: 8px;
        }
        .var-selector {
            width: 140px;
        }
        .operate-btns {
        width: 44px;
        color: #c4c6cc;
        cursor: pointer;
        user-select: none;
            .disabled {
                color: #dcdee5;
                cursor: not-allowed;
            }
        }
    }
    .data-empty {
        margin-top: 16px;
        padding: 24px 0;
        font-size: 12px;
        text-align: center;
        color: #dcdee5;
        border: 1px dashed #dcdee5;
        cursor: pointer;

        &:not(.disabled):hover {
        border-color: #3a84ff;
        color: #3a84ff;
        }
        &.disabled {
        cursor: not-allowed;
        }
    }
}
</style>
<style lang="postcss">
    .data-source-worksheet-dialog .bk-dialog-body {
        padding: 0;
    }
</style>
