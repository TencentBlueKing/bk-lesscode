<template>
    <bk-dialog
        title="配置联动规则"
        class="default-val-linkage-dialog"
        width="560"
        render-directive="if"
        header-position="left"
        :position="{ top: 100 }"
        :value="show"
        :close-icon="false"
        :auto-close="false"
        :mask-close="false"
        @confirm="handleConfirm"
        @cancel="close">
        <bk-form class="linkage-config-wrapper" form-type="vertical">
            <bk-form-item label="联动内容">
                <bk-radio-group :value="configData.type" @change="handleRuleTypeChange">
                    <bk-radio value="currentTable">本表字段</bk-radio>
                    <bk-radio value="otherTable">他表字段</bk-radio>
                    <bk-radio
                        v-if="['DATE', 'DATETIME'].includes(field.type)"
                        value="createTicketTime">
                        默认为提交{{ `${field.type === 'DATE' ? '日期' : '时间'}` }}
                    </bk-radio>
                </bk-radio-group>
            </bk-form-item>
            <bk-form-item v-if="configData.type === 'otherTable'" label="联动数据表">
                <bk-select
                    style="width: 50%;"
                    size="small"
                    v-model="configData.tableName"
                    :loading="formListLoading">
                    <bk-option
                        v-for="form in formList"
                        :key="form.tableName"
                        :id="form.tableName"
                        :name="`${form.formName}(${form.tableName})`">
                    </bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item
                label="关联规则"
                desc-type="icon"
                :desc="associationRuleTips">
                <relation-rules
                    :disabled="disabled"
                    :rules="configData.rules"
                    :field="field"
                    :form-list-loading="formListLoading"
                    :other-table-fields="otherTableFields"
                    :is-current-table="configData.type === 'currentTable'"
                    @change="configData.rules = $event">
                </relation-rules>
            </bk-form-item>
        </bk-form>
    </bk-dialog>
</template>
<script>
    import { mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import RelationRules from './relation-rules.vue'

    export default {
        name: 'Linkage',
        components: {
            RelationRules
        },
        props: {
            show: Boolean,
            disabled: Boolean,
            field: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                configData: cloneDeep(this.field.meta.default_val_config),
                formList: [],
                formListLoading: false,
                fieldList: [],
                associationRuleTips: {
                    placement: 'right-end',
                    content: `
                        <p>1.本表字段联动，若存在多条满足条件的关联规则，排序在后的规则优先级更高</p>
                        <p>2.他表字段联动，若设置的条件无法检索到单条数据，则关联值将无法正常带出</p>
                        <p>3.若没有满足关联规则时，字段将会保持当前值
                    `
                }
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            ...mapGetters('nocode/formSetting', ['fieldsList']),
            // 日期、时间类型字段
            isDateTypeField () {
                return ['DATE', 'DATETIME'].includes(this.field.type)
            },
            otherTableFields () {
                if (this.configData.tableName) {
                    const form = this.formList.find(item => item.tableName === this.configData.tableName)
                    if (form) {
                        return JSON.parse(form.content)
                    }
                }
                return []
            }
        },
        watch: {
            show (val) {
                if (val) {
                    this.configData = cloneDeep(this.field.meta.default_val_config)
                }
            }
        },
        created () {
            this.getFormList()
        },
        methods: {
            async getFormList () {
                try {
                    this.formListLoading = true
                    const params = {
                        projectId: this.$route.params.projectId,
                        versionId: this.versionId
                    }
                    const res = await this.$store.dispatch('nocode/formSetting/getFormList', params)
                    this.formList = res
                    this.formListLoading = false
                } catch (e) {
                    console.error(e)
                }
            },
            handleRuleTypeChange (val) {
                this.configData.type = val
                const rules = [
                    {
                        relations: [{
                            field: '',
                            type: '',
                            value: ''
                        }],
                        target: {
                            type: '',
                            value: ''
                        }
                    }
                ]
                if (val === 'otherTable') {
                    rules[0].target.type = 'VAR'
                }
                this.configData.rules = rules
            },
            handleConfirm () {
                if (!this.validate()) {
                    return
                }
                this.$emit('change', this.configData)
                this.close()
            },
            validate () {
                if (this.configData.type === 'currentTable') {
                    return !this.configData.rules.some((group, index) => {
                        const hasRelationFormEmpty = group.relations.some(item => {
                            let msg
                            if (!item.field) {
                                msg = '表单字段不能为空'
                            } else if (!item.type) {
                                msg = '表单字段值类型不能为空'
                            } else if (item.type === 'VAR' && !item.value) {
                                msg = '表单字段变量值不能为空'
                            }
                            if (msg) {
                                this.$bkMessage({
                                    theme: 'error',
                                    message: `【规则${index + 1}】的${msg}`
                                })
                                return true
                            }
                        })
                        if (hasRelationFormEmpty) {
                            return true
                        }
                        if (!group.target.type) {
                            this.$bkMessage({
                                theme: 'error',
                                message: `请选择【规则${index + 1}】值类型`
                            })
                            return true
                        }
                        if (group.target.type === 'VAR' && !group.target.value) {
                            this.$bkMessage({
                                theme: 'error',
                                message: `请选择【规则${index + 1}】值变量`
                            })
                            return true
                        }
                        if (this.checkLoopReference(this.configData.rules, this.field.key)) {
                            this.$bkMessage({
                                theme: 'error',
                                message: '当前字段联动规则存在循环配置的情况，请修改后保存'
                            })
                            return true
                        }
                    })
                } else if (this.configData.type === 'otherTable') {
                    if (!this.configData.tableName) {
                        this.$bkMessage({
                            theme: 'error',
                            message: '请选择联动数据表'
                        })
                        return false
                    }
                    const hasRelationFormEmpty = this.configData.rules[0].relations.some(item => {
                        let msg
                        if (!item.field) {
                            msg = '关联规则的表单字段不能为空'
                        } else if (!item.type) {
                            msg = '关联规则的表单字段值类型不能为空'
                        } else if (item.type === 'VAR' && !item.value) {
                            msg = '关联规则的表单字段变量值不能为空'
                        }
                        if (msg) {
                            this.$bkMessage({
                                theme: 'error',
                                message: msg
                            })
                            return true
                        }
                    })
                    if (hasRelationFormEmpty) {
                        return false
                    }
                    if (!this.configData.rules[0].target.value) {
                        this.$bkMessage({
                            theme: 'error',
                            message: '请选择满足关联规则时的值变量'
                        })
                        return false
                    }
                }
                return true
            },
            // 本表字段关联时，检查是否存在字段间循环关联的情况
            checkLoopReference (rules, key) {
                let looped = false
                rules.some(rule => {
                    return rule.relations.some(relation => {
                        const relField = this.fieldsList.find(item => item.key === relation.field)
                        if (relField && relation.field === key) {
                            looped = true
                            return true
                        }
                        const { type: relType, rules: relRules } = relField?.meta.default_val_config || {}
                        if (relType === 'currentTable' && Array.isArray(relRules)) {
                            looped = this.checkLoopReference(relField.meta.default_val_config.rules, key)
                        }
                    })
                })
                return looped
            },
            close () {
                this.$emit('update:show', false)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .linkage-config-wrapper {
        padding: 0 24px 20px;
        max-height: 500px;
        overflow: auto;
        @mixin scroller;

        >>> .bk-form .bk-form-item + .bk-form-item {
            margin-top: 15px;
        }
        >>> .bk-form-content {
            font-size: 12px;
            .bk-form-radio {
                margin-right: 30px;
                .bk-radio-text {
                    font-size: 12px;
                }
            }
        }
        .end-value {
            display: flex;
            align-items: center;
            margin-top: 12px;
        }
    }
    >>> .determine-value {
        .bk-form-content {
            line-height: initial;
        }
        .bk-date-picker-rel .bk-date-picker-editor,
        .bk-date-picker-rel .icon-wrapper,
        .bk-select,
        .bk-form-input {
            height: 26px;
            line-height: 26px;
        }
        .bk-select-name {
            height: 24px;
        }
        .bk-select-clear {
            top: 5px;
        }
        .bk-select-angle {
            top: 1px;
        }
        .bk-select-loading {
            top: 4px;
        }
    }
</style>
<style lang="postcss">
    .default-val-linkage-dialog {
        .bk-dialog-body {
            padding: 0;
        }
    }
</style>
