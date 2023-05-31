<template>
    <div class="field-default-value">
        <bk-button size="small" theme="primary" @click="isLinkageDialogShow = true">{{ $t('配置联动规则') }}</bk-button>
        <linkage-rules
            :show.sync="isLinkageDialogShow"
            :disabled="disabled"
            :field="fieldData"
            @change="handleLinkageChange">
        </linkage-rules>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import LinkageRules from './linkage.vue'

    // 可设置联动规则的字段类型
    const CAN_SETTING_LINKAGE_FIELD_TYPES = ['STRING', 'TEXT', 'INT', 'DATE', 'DATETIME', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'MEMBER', 'MEMBERS']

    export default {
        name: 'FieldAssociationValue',
        components: {
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
        watch: {
            field (val) {
                this.fieldData = cloneDeep(val)
                this.initDefaultValConfig()
            }
        },
        created () {
            this.initDefaultValConfig()
        },
        methods: {
            initDefaultValConfig () {
                if (!('default_val_config' in this.field.meta)) {
                    this.$set(this.fieldData.meta, 'default_val_config', {
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
                        ]
                    })
                }
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
