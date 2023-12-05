<template>
    <setter-form-item :title="$t('字段名称')">
        <bk-radio-group
            class="g-prop-radio-group"
            :value="localVal.type"
            @change="handleSourceTypeChange">
            <bk-radio-button
                v-for="item in sourceTypeList"
                :key="item.id"
                :value="item.id">
                {{ item.name }}
            </bk-radio-button>
        </bk-radio-group>
        <bk-button
            v-if="value.type !== 'FUNCTION'"
            style="margin-top: 8px;"
            theme="primary"
            size="small"
            :title="$t('配置')"
            @click="handleOpenDialog">
            {{ $t('配置数据源') }}
        </bk-button>
        <function-data
            v-if="value.type === 'FUNCTION'"
            :key="field.key"
            :config="value.config"
            @update="updateValue('config', $event)">
        </function-data>
        <!-- 自定义数据 -->
        <custom-data
            :show.sync="customDataDialogShow"
            :list="value.data"
            :disabled="disabled"
            @update="updateValue('data', $event)">
        </custom-data>
        <worksheet-data
            :show.sync="worksheetDataDialogShow"
            :config="value.config"
            :field="field"
            :list="list"
            :disabled="disabled"
            @update="updateValue('config', $event)">
        </worksheet-data>
    </setter-form-item>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'
    import functionData from './components/function-data.vue'
    import customData from './components/custom-data.vue'
    import worksheetData from './components/worksheet-data.vue'

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
            worksheetData,
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean,
            list: {
                type: Array,
                default: () => []
            },
            value: {
                type: Object,
                default: () => ({
                    type: 'CUSTOM', // 取值有：CUSTOM(自定义)、FUNCTION(函数)、WORKSHEET(数据表)
                    config: {},
                    data: [
                        { id: 'xuanxiang1', label: this.$t('选项') + '1' },
                        { id: 'xuanxiang2', label: this.$t('选项') + '2' }
                    ]
                })
            }
        },
        data () {
            return {
                localVal: this.value,
                customDataDialogShow: false,
                worksheetDataDialogShow: false
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
            handleSourceTypeChange (val) {
                this.localVal.type = val
                if (val === 'FUNCTION') {
                    this.localVal.config = {
                        payload: {
                            methodData: {
                                methodCode: '',
                                params: []
                            }
                        },
                        returnedValue: [],
                        keys: {}
                    }
                    this.localVal.data = []
                } else if (val === 'CUSTOM') {
                    this.localVal.data = [
                        { id: 'xuanxiang1', label: this.$t('选项') + '1' },
                        { id: 'xuanxiang2', label: this.$t('选项') + '2' }
                    ]
                    this.localVal.config = {}
                } else if (val === 'WORKSHEET') {
                    this.localVal.config = {
                        tableName: '',
                        fieldKey: '',
                        logic: 'and',
                        conditions: []
                    }
                    this.localVal.data = []
                }
                this.change()
            },
            handleOpenDialog () {
                if (this.localVal.type === 'CUSTOM') {
                    this.customDataDialogShow = true
                } else {
                    this.worksheetDataDialogShow = true
                }
            },
            updateValue (key, val) {
                this.localVal[key] = val
                this.change()
            },
            change () {
                this.$emit('change', { ...this.localVal })
            },
        }
    }
</script>
<style lang="postcss" scoped>

</style>
