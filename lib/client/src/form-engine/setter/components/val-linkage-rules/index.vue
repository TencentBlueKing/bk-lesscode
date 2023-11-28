<template>
    <setter-form-item :title="$t('form_值联动规则')">
        <bk-button
            size="small"
            theme="primary"
            @click="isLinkageDialogShow = true">
            {{ $t('配置联动规则') }}
        </bk-button>
        <linkage-rules
            :show.sync="isLinkageDialogShow"
            :disabled="disabled"
            :field="field"
            :current-table-fields="currentTableFields"
            :current-form-id="currentFormId"
            :value="value"
            @change="handleLinkageChange">
        </linkage-rules>
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'
    import linkageRules from './components/linkage.vue'

    export default {
        name: 'setter-val-linkage-rules',
        inheritAttrs: false,
        components: {
            setterFormItem,
            linkageRules
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            list: {
                type: Array,
                default: () => []
            },
            currentFormId: [Number, String],
            disabled: Boolean,
            value: {
                type: Object
            }
        },
        data () {
            return {
                isLinkageDialogShow: false
            }
        },
        computed: {
            currentTableFields () {
                return this.list.filter(item => item.configure.key !== this.field.configure.key)
            }
        },
        methods: {
            handleLinkageChange (val) {
                this.$emit('change', val)
            }
        }
    }
</script>