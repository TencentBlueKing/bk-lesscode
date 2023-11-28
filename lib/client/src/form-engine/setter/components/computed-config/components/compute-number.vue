<template>
    <section>
        <setter-form-item :title="$t('计算公式')">
            <bk-select
                v-model="localConfig.formula"
                size="small"
                :clearable="false"
                :disabled="disabled"
                @change="update">
                <bk-option v-for="option in formulaList"
                    :key="option.id"
                    :id="option.id"
                    :name="option.label">
                </bk-option>
            </bk-select>
        </setter-form-item>
        <setter-form-item v-if="localConfig.formula !== 'customize'" :title="$t('计算字段')">
            <bk-select
                v-model="localConfig.computeFields"
                searchable
                multiple
                size="small"
                :disabled="disabled"
                @change="update">
                <bk-option v-for="option in intFields"
                    :key="option.key"
                    :id="option.key"
                    :name="option.name">
                </bk-option>
            </bk-select>
        </setter-form-item>
        <bk-button
            v-else
            text
            class="formula-btn"
            size="small"
            title="primary"
            @click="isShowFormulaDialog = true">
            {{ $t('配置公式') }}
        </bk-button>
        <setter-form-item :title="$t('单位')">
            <bk-input
                v-model="localConfig.unit.value"
                clearable
                size="small"
                :disabled="disabled"
                @change="update">
                <bk-select
                    v-model="localConfig.unit.position"
                    slot="prepend"
                    class="unit-position-select"
                    size="small"
                    :clearable="false"
                    :disabled="disabled">
                    <bk-option id="prefix" :name="$t('前缀')" />
                    <bk-option id="suffix" :name="$t('后缀')" />
                </bk-select>
            </bk-input>
        </setter-form-item>
        <setter-form-item :title="$t('保留小数位数')">
            <bk-input
                type="number"
                size="small"
                :value="localConfig.decimal"
                :disabled="disabled"
                :max="10"
                :min="0"
                @change="decimalChange" />
        </setter-form-item>
        <formula-dialog
            :show.sync="isShowFormulaDialog"
            :list="intFields"
            :formula="localConfig.customizeFormula"
            :disabled="disabled"
            @confirm="handleCustomFormulaChange"/>
    </section>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import setterFormItem from '../../../common/setter-form-item.vue'
    import formulaDialog from './formula-dialog.vue'

    export default {
        name: 'compute-number',
        components: {
            setterFormItem,
            formulaDialog
        },
        props: {
            config: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean,
            field: {
                type: Object,
                default: () => ({})
            },
            list: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                localConfig: cloneDeep(this.config),
                isShowFormulaDialog: false,
                isDropdownShow: false,
                formulaList: [
                    { id: 'sum', label: this.$t('求和') },
                    { id: 'averageValue', label: this.$t('平均值') },
                    { id: 'median', label: this.$t('中位数') },
                    { id: 'product', label: this.$t('乘积') },
                    { id: 'maxValue', label: this.$t('最大值') },
                    { id: 'minValue', label: this.$t('最小值') },
                    { id: 'customize', label: this.$t('自定义') }
                ]
            }
        },
        computed: {
            intFields () {
                return this.list.filter((item) => {
                    return item.type === 'int'
                }).map((item) => {
                    const { key, name, value } = item.configure
                    return { key, name, value }
                })
            }
        },
        methods: {
            decimalChange (val) {
                this.localConfig.decimal = parseInt(val)
                this.update()
            },
            handleCustomFormulaChange (val) {
                this.localConfig.customizeFormula = val
                this.update()
            },
            update () {
                this.$emit('update', this.localConfig)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .formula-btn {
        margin-top: 8px;
        padding: 0;
        height: 20px;
        line-height: 20px;
    }
    .unit-position-select {
        width: 85px;
        border: none;
    }
</style>
