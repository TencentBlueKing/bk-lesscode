<template>
    <setter-form-item title="字段名称">
        <bk-radio-group class="g-prop-radio-group" :value="value.type" @change="handleSourceTypeChange">
            <bk-radio-button
                v-for="item in sourceTypeList"
                :key="item.id"
                :value="item.id">
                {{ item.name }}
            </bk-radio-button>
        </bk-radio-group>
        <function-data
            v-if="value.type === 'FUNCTION'"
            :key="field.key"
            :config="value.config"
            @change="handleFunctionDataSourceChange">
        </function-data>
        <bk-button
            v-else
            style="margin-top: 8px;"
            theme="primary"
            size="small"
            :title="$t('配置')"
            @click="dataSourceDialogShow = true">
            {{ $t('配置数据源') }}
        </bk-button>
        <data-source-dialog
            :show.sync="dataSourceDialogShow"
            :source-type="value.type"
            :field-type="field.type"
            :value="value.config"
            @confirm="handleDataSourceChange">
        </data-source-dialog>
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'
    import functionData from './components/function-data.vue'
    import dataSourceDialog from './components/data-source-dialog.vue'

    const FIELDS_SOURCE_TYPE = [
        {
            id: 'CUSTOM',
            name: window.i18n.t('自定义数据')
        },
        {
            id: 'FUNCTION',
            name: window.i18n.t('函数')
        },
        {
            id: 'WORKSHEET',
            name: window.i18n.t('表单数据')
        },
    ]

    export default {
        name: 'setter-data-source',
        components: {
            setterFormItem,
            functionData,
            dataSourceDialog
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            value: {
                type: Object,
                default: () => ({
                    type: 'CUSTOM', // 取值有：CUSTOM(自定义)、FUNCTION(函数)、WORKSHEET(数据表)
                    config: {},
                    data: [
                        { id: 'xuanxiang1', label: '选项1' },
                        { id: 'xuanxiang2', label: '选项2' }
                    ]
                })
            }
        },
        data () {
            return {
                locVal: this.value,
                dataSourceDialogShow: false
            }
        },
        computed: {
            sourceTypeList () {
                if (this.field.type === 'table') {
                    return FIELDS_SOURCE_TYPE.filter(item => item.id === 'CUSTOM')
                }
                return FIELDS_SOURCE_TYPE
            },
        },
        methods: {
            handleSourceTypeChange () {},
            handleDataSourceChange () {},
            handleFunctionDataSourceChange () {}
        }
    }
</script>
<style lang="postcss" scoped>

</style>
