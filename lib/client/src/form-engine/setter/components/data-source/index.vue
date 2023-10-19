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
            @click="handleOpenDialog">
            {{ $t('配置数据源') }}
        </bk-button>
        <!-- 自定义数据 -->
        <custom-data
            v-if="value.type === 'CUSTOM'"
            :show.sync="customDataDialogShow"
            :list="value.data"
            :disabled="disabled"
            @update="handleUpdateData">
        </custom-data>
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'
    import functionData from './components/function-data.vue'
    import customData from './components/custom-data.vue'
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
        inheritAttrs: false,
        components: {
            setterFormItem,
            functionData,
            customData,
            dataSourceDialog
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean,
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
                customDataDialogShow: false,
                formDataDialogShow: false
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
            handleOpenDialog () {
                if (this.locVal.type === 'CUSTOM') {
                    this.customDataDialogShow = true
                } else {
                    this.formDataDialogShow = true
                }
            },
            handleDataSourceChange () {},
            handleFunctionDataSourceChange () {},
            handleUpdateData (data) {
                const config = { ...this.value, data }
                this.$emit('change', config)
            }
        }
    }
</script>
<style lang="postcss" scoped>

</style>
