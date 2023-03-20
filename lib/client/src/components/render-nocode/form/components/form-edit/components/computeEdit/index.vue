<template>
    <div>
        <div class="row-box">
            <bk-radio-group v-model="computConfigInfo.type">
                <bk-radio :value="'numberComput'">数值计算</bk-radio>
                <bk-radio :value="'dateTime'">时间日期</bk-radio>
            </bk-radio-group>
        </div>
        <!-- 计算日期 -->
        <ComputeDate
            v-if="computConfigInfo.type === 'dateTime'" :field="fieldData"
            :comput-config-info="computConfigInfo"
            @change="$emit('change', $event)" />
        <!-- 计算数值 -->
        <ComputeNumber v-else
            :field="fieldData"
            :comput-config-info="computConfigInfo"
            @change="$emit('change', $event)" />
    </div>
</template>

<script>
    import cloneDeep from 'lodash.clonedeep'
    import ComputeDate from './computeDate.vue'
    import ComputeNumber from './computeNumber.vue'
    import { computDateDiff } from '@/components/flow-form-comp/form/util/index.js'

    export default {
        name: 'BkLesscodeComputEdit',
        components: {
            ComputeDate, ComputeNumber
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                fieldData: cloneDeep(this.field),
                computConfigInfo: this.initComputConfig()
            }
        },
        watch: {
            field (val) {
                this.fieldData = cloneDeep(val)
                this.setMeta()
            },
            'computConfigInfo.type': {
                handler (val) {
                    if (val === 'dateTime') {
                        this.fieldData.default = computDateDiff(this.computConfigInfo)
                    } else {
                        this.fieldData.default = '--'
                    }
                    this.$emit('change', this.fieldData)
                }
            }
            
        },
        created () {
            this.setMeta()
        },
        methods: {
            initComputConfig () {
                return {
                    type: 'numberComput', // numberComput(数值计算)，dateTime(时间日期)
                    dateTime: {
                        startDate: {
                            key: '',
                            value: ''
                        },
                        endDate: {
                            key: '',
                            value: ''
                        },
                        accuracyResult: 'day',
                        defaultTime: ''
                    },
                    numberComput: {
                        formula: '',
                        customizeFormula: [],
                        computeFields: [],
                        unit: {
                            value: '',
                            position: ''
                        },
                        decimal: 0
                    }
                }
            },
            setMeta () {
                if (!this.field.meta.hasOwnProperty('compute_config_info')) {
                    this.$set(this.fieldData.meta, 'compute_config_info', this.initComputConfig())
                }
                this.computConfigInfo = this.fieldData.meta.compute_config_info
            }
           
        }
    }
</script>

<style lang="postcss" scoped>
.row-box{
    margin: 10px 0 ;
}
.mg-top-5{
    margin-top: 5px;
}
</style>
