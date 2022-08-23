<template>
    <bk-dialog
        title="配置联动规则"
        class="default-val-linkage-dialog"
        width="560"
        render-directive="if"
        header-position="left"
        :position="{ top: 100 }"
        :value="show"
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
                v-if="configData.type !== 'createTicketTime'"
                label="关联规则"
                :desc="configData.type === 'otherTable' ? '若设置的条件无法检索到单条数据，则默认值将无法正常带出' : ''">
                <relation-rules
                    :disabled="disabled"
                    :rules="configData.rules"
                    :field="field"
                    :other-table-fields="otherTableFields"
                    :is-current-table="configData.type === 'currentTable'"
                    @change="configData.rules = $event">
                </relation-rules>
                <div class="end-value">
                    <span style="margin-right: 8px; white-space: nowrap;">若以上规则都不满足，则默认值为</span>
                    <determine-val
                        style="width: 200px;"
                        :field="endValueField"
                        :disabled="disabled"
                        @change="configData.end_value = $event">
                    </determine-val>
                </div>
            </bk-form-item>
            <bk-form-item label="支持用户修改默认值">
                <bk-radio-group v-model="configData.can_modify">
                    <bk-radio :value="true">是</bk-radio>
                    <bk-radio :value="false">否</bk-radio>
                </bk-radio-group>
            </bk-form-item>
        </bk-form>
    </bk-dialog>
</template>
<script>
    import { mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import RelationRules from './relation-rules.vue'
    import DetermineVal from './determine.vue'

    export default {
        name: 'Linkage',
        components: {
            RelationRules,
            DetermineVal
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
                fieldList: []
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
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
            },
            endValueField () {
                return { ...this.field, default: this.configData.end_value }
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
                let valid = true
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
                                message: `请选择【规则${index + 1}】默认值类型`
                            })
                            return true
                        }
                        if (group.target.type === 'VAR' && !group.target.value) {
                            this.$bkMessage({
                                theme: 'error',
                                message: `请选择【规则${index + 1}】默认值变量`
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
                            valid = false
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
                            message: '请选择满足关联规则时的默认值变量'
                        })
                        return false
                    }
                }
                return valid
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
    }
</style>
<style lang="postcss">
    .default-val-linkage-dialog {
        .bk-dialog-body {
            padding: 0;
        }
    }
</style>
