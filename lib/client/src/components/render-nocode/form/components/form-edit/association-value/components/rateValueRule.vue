<template>
    <div>
        <div
            class="row-box"
            v-for="(relation, index) in rule.relations"
            :key="`${relation.field}_${relation.type}_${index}`">
            <span>当表单中</span>
            <bk-select
                v-model="relation.field"
                style="width: 350px;"
                size="small"
                placeholder="表单字段"
                :loading="!isCurrentTable && formListLoading"
                @change="ruleChange">
                <bk-option
                    v-for="item in relFieldList"
                    :key="item.key"
                    :id="item.key"
                    :name="item.name">
                </bk-option>
            </bk-select>
            <span>的值处于</span>
        </div>
        <div class="interval-row" v-for="(item,intervalIndex) in rule.intervals " :key="intervalIndex">
            <bk-input v-model="item.min" @change="changeTargetValue" style="width: 120px;" type="number" size="small"></bk-input>
            ~
            <bk-input v-model="item.max" @change="changeTargetValue" style="width: 120px;" type="number" size="small"></bk-input>
            <span>区间值为</span>
            <bk-rate :rate="item.value" :edit="false"></bk-rate>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'BkLesscodeRateValueRule',
        props: {
            rule: {
                type: Object,
                default: () => ({})
            },
            formListLoading: Boolean,
            isCurrentTable: { // 是否为本表字段联动
                type: Boolean,
                default: true
            },
            relFieldList: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                intervals: [
                    {
                        level: 1,
                        min: 0,
                        max: 10,
                        value: 1
                    }, {
                        level: 2,
                        min: 10,
                        max: 20,
                        value: 2
                    }, {
                        level: 3,
                        min: 20,
                        max: 30,
                        value: 3
                    }, {
                        level: 4,
                        min: 30,
                        max: 40,
                        value: 4
                    }, {
                        level: 5,
                        min: 40,
                        max: 50,
                        value: 5
                    }
                ],
                bindField: {}
            }
        },
        watch: {
            isCurrentTable: {
                handler (val) {
                    if (val) {
                        this.rule.intervals = this.rule.intervals || this.intervals
                        this.changeBindField()
                        this.changeTargetValue()
                    }
                },
                immediate: true
            }
        },
        methods: {
            changeTargetValue () {
                let interval = {}
                this.rule.intervals.forEach((item) => {
                    const defValue = this.bindField?.default * 1
                    if (item.min <= defValue && defValue < item.max) {
                        interval = item
                    }
                })
                this.rule.target.value = interval?.value || 0
                this.ruleChange()
            },
            changeBindField () {
                this.bindField = this.relFieldList.find((item, index) => {
                    return item.key === this.rule.relations[0].field
                })
            },
            ruleChange () {
                this.rule.relations[0].value = this.rule.relations[0].field
                this.rule.relations[0].type = 'VAR'
                this.rule.target.type = 'CONST'
                this.changeBindField()
                this.$emit('change', this.rule)
            }
        }
    }
</script>

<style lang="postcss" scoped>
.row-box,.interval-row{
    display: flex;
    justify-content: space-around;
    align-items: center;
}
.interval-row{
    margin-top: 8px;
}
</style>
