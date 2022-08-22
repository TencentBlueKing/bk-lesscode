<template>
    <div class="field-default-value">
        <bk-radio-group
            v-if="linkageTypes.includes(field.type)"
            class="g-prop-radio-group"
            :value="defaultValType"
            @change="handleTypeChange">
            <bk-radio-button value="determine">固定值</bk-radio-button>
            <bk-radio-button value="linkage">关联数据</bk-radio-button>
        </bk-radio-group>
        <determine-val
            v-if="!linkageTypes.includes(field.type) || defaultValType === 'determine'"
            :field="field"
            :disabled="disabled"
            @change="$emit('change', $event)">
        </determine-val>
        <template v-if="defaultValType === 'linkage'">
            <bk-button size="small" :text="true">配置联动规则</bk-button>
            <linkage-rules></linkage-rules>
        </template>
    </div>
</template>
<script>
    import DetermineVal from './determine.vue'
    import LinkageRules from './linkage.vue'

    // 可设置联动规则的字段类型
    const LINKAGE_TYPES = ['STRING', 'TEXT', 'INT', 'DATE', 'DATETIME', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO']

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
                linkageTypes: LINKAGE_TYPES
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
                    if (!('default_val_config' in this.field)) {
                        this.field.meta.default_val_config = {
                            enable: true,
                            can_modify: true
                        }
                    } else {
                        this.field.meta.default_val_config.enable = true
                    }
                } else {
                    this.field.meta.default_val_config.enable = false
                }
            },
            change () {
                this.$emit('change')
            }
        }
    }
</script>
