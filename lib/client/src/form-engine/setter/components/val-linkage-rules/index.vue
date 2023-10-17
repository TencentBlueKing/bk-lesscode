<template>
    <setter-form-item title="值联动规则">
        <bk-button
            size="small"
            theme="primary"
            @click="isLinkageDialogShow = true">
            {{ $t('配置联动规则') }}
        </bk-button>
        <linkage-rules
            :show.sync="isLinkageDialogShow"
            :field="field"
            :value="value"
            @change="handleLinkageChange">
        </linkage-rules>
    </setter-form-item>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import setterFormItem from '../../common/setter-form-item.vue'
    import linkageRules from './components/linkage.vue'

    export default {
        name: 'setter-val-linkage-rules',
        components: {
            setterFormItem,
            linkageRules
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            value: {
                type: Object
            }
        },
        data () {
            return {
                isLinkageDialogShow: false
            }
        },
        methods: {
            handleLinkageChange (val) {
                this.$emit('change', val)
            }
        }
    }
</script>