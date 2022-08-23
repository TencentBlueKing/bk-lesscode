<template>
    <div class="field-default-value">
        <bk-radio-group
            class="g-prop-radio-group"
            :value="defaultValType"
            @change="handleTypeChange">
            <bk-radio-button value="determine">固定值</bk-radio-button>
            <bk-radio-button value="linkage" :disabled="!canSettingLinkageFieldTypes.includes(field.type)">关联数据</bk-radio-button>
        </bk-radio-group>
        <determine-val
            v-if="defaultValType === 'determine'"
            :field="field"
            :disabled="disabled"
            @change="handleDeterMineValChange">
        </determine-val>
        <div v-if="defaultValType === 'linkage'">
            <bk-button size="small" theme="primary" @click="isLinkageDialogShow = true">配置联动规则</bk-button>
            <linkage-rules
                :show.sync="isLinkageDialogShow"
                :disabled="disabled"
                :field="fieldData"
                @change="handleLinkageChange">
            </linkage-rules>
        </div>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import DetermineVal from './determine.vue'
    import LinkageRules from './linkage.vue'
    import { getTypeDefaultVal } from 'shared/no-code'

    // 可设置联动规则的字段类型
    const CAN_SETTING_LINKAGE_FIELD_TYPES = ['STRING', 'TEXT', 'INT', 'DATE', 'DATETIME', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'MEMBER', 'MEMBERS']

    export default {
        name: 'FieldDefaultValue',
        components: {
            DetermineVal,
            LinkageRules
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                fieldData: cloneDeep(this.field),
                canSettingLinkageFieldTypes: CAN_SETTING_LINKAGE_FIELD_TYPES,
                isLinkageDialogShow: false
            }
        },
        computed: {
            // 默认值类型
            defaultValType () {
                return this.field.meta.default_val_config?.enable ? 'linkage' : 'determine'
            }
        },
        methods: {
            handleTypeChange (val) {
                if (val === 'linkage') {
                    if (!('default_val_config' in this.field.meta)) {
                        this.$set(this.fieldData.meta, 'default_val_config', {
                            enable: true,
                            type: 'currentTable', // currentTable(本表字段)、otherTable(他表字段)、createTicketTime(提交时间)
                            tableName: '',
                            rules: [
                                {
                                    relations: [{ // 关联的字段信息
                                        field: '',
                                        type: '', // CONST常量、VAR变量
                                        value: ''
                                    }],
                                    target: { // 满足关联条件的默认值
                                        type: '', // CONST常量、VAR变量
                                        value: ''
                                    }
                                }
                            ],
                            end_value: getTypeDefaultVal(this.field.type),
                            can_modify: true
                        })
                    } else {
                        this.fieldData.meta.default_val_config.enable = true
                    }
                } else {
                    this.fieldData.meta.default_val_config.enable = false
                }
                this.change()
            },
            handleDeterMineValChange (val) {
                const formattedValue = ['MULTISELECT', 'CHECKBOX', 'MEMBER', 'MEMBERS'].includes(this.fieldData.type)
                    ? val.join(',')
                    : val
                this.fieldData.default = formattedValue
                this.change()
            },
            handleLinkageChange (val) {
                this.fieldData.meta.default_val_config = val
                this.change()
            },
            change () {
                this.$emit('change', this.fieldData)
            }
        }
    }
</script>
