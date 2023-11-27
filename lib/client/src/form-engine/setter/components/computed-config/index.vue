<template>
    <section class="computed-config">
        <setter-form-item :title="$t('计算类型')">
            <bk-radio-group v-model="localVal.type" @change="handleTypeChange">
                <bk-radio :value="'number'" :disabled="disabled">{{ $t('数值计算') }}</bk-radio>
                <bk-radio :value="'dateTime'" :disabled="disabled">{{ $t('时间日期') }}</bk-radio>
            </bk-radio-group>
        </setter-form-item>
        <!-- 计算日期 -->
        <compute-date
            v-if="localVal.type === 'dateTime'"
            :field="field"
            :disabled="disabled"
            :config="localVal.config"
            @update="handleConfigUpdate" />
        <!-- 计算数值 -->
        <compute-number
            v-else
            :field="field"
            :list="list"
            :disabled="disabled"
            :config="localVal.config"
            @update="handleConfigUpdate" />
    </section>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import setterFormItem from '../../common/setter-form-item.vue'
    import computeNumber from './components/compute-number.vue'
    import computeDate from './components/compute-date.vue'

    export default {
        name: 'computed-config',
        inheritAttrs: false,
        components: {
            setterFormItem,
            computeNumber,
            computeDate
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
            disabled: Boolean,
            value: {
                type: Object
            }
        },
        data () {
            return {
                localVal: cloneDeep(this.value)
            }
        },
        methods: {
            handleTypeChange (val) {
                if (val === 'dateTime') {
                    this.localVal.config = {
                        startDate: { key: '', value: '' },
                        endDate: { key: '', value: '' },
                        accuracyResult: 'day',
                        defaultTime: ''
                    }
                } else {
                    this.localVal.config = {
                        formula: '',
                        customizeFormula: [],
                        computeFields: [],
                        unit: { value: '', position: 'prefix' },
                        decimal: 0
                    }
                }
                this.change()
            },
            handleConfigUpdate (config) {
                console.log('config: ', config)
                this.localVal.config = config
                this.change()
            },
            change () {
                this.$emit('change', this.localVal)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    /deep/ {
        .bk-form-radio {
            margin-right: 24px;
        }
        .bk-radio-text {
            font-size: 12px;
        }
    }
</style>
