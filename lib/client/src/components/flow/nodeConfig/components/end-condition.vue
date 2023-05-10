<template>
    <div class="end-condition-wrapper">
        <div
            v-for="(group, index) in formData.expressions"
            class="condition-group-wrapper"
            :key="index">
            <p class="group-title">{{ $t('或-条件组')}}{{ index + 1 }}</p>
            <div class="condition-content">
                <div v-for="(expression, i) in group.expressions" class="expression-item" :key="i">
                    <bk-select
                        style="width: 200px; margin-right: 8px; background: #fff"
                        :clearable="false"
                        :loading="conditionListLoading"
                        :value="expression.key"
                        @selected="handleSelectCondition($event, expression)">
                        <bk-option v-for="item in conditionList" :key="item.key" :id="item.key" :name="item.name"></bk-option>
                    </bk-select>
                    <bk-select
                        v-model="expression.condition"
                        style="width: 100px; margin-right: 8px; background: #fff"
                        :clearable="false">
                        <bk-option v-for="item in relationList" :key="item.key" :id="item.key" :name="item.name"></bk-option>
                    </bk-select>
                    <div class="value-wrapper" style="width: 240px; margin-right: 8px; position: relative">
                        <bk-input
                            v-model="expression.value"
                            v-bk-tooltips="{
                                disabled: tipsContent(expression).length === 0,
                                content: tipsContent(expression),
                                placements: ['top']
                            }"
                            type="number"
                            :clearable="false"
                            :disabled="tipsContent(expression).length > 0"
                            :max="expression.meta.unit === 'INT' ? processorLength : 100"
                            :min="0"
                            :precision="0">
                        </bk-input>
                        <span v-if="expression.meta.unit === 'PERCENT'" class="percent-icon">%</span>
                    </div>
                    <div class="opt-btns">
                        <i class="bk-drag-icon bk-drag-add-fill" @click="handleAddCondition(i, index)"></i>
                        <i
                            :class="[
                                'bk-drag-icon',
                                'bk-drag-reduce-fill',
                                'delete-condition-icon',
                                { disabled: group.expressions.length === 1 }
                            ]"
                            @click="handleDeleteCondition(i, index)">
                        </i>
                    </div>
                </div>
            </div>
            <i class="bk-icon icon-close delete-icon" @click="handleDeleteGroup(index)"></i>
        </div>
        <div class="create-group-btn">
            <span @click="handleAddGroup">
                <i class="bk-icon icon-plus-circle" style="margin-right: 4px"></i>{{$t('添加“或”条件组')}}
            </span>
        </div>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import { mapState, mapGetters } from 'vuex'

    export default {
        name: 'EndCondition',
        data () {
            return {
                formData: cloneDeep(this.$store.state.nocode.nodeConfig.nodeData.finish_condition),
                conditionList: [],
                conditionListLoading: true,
                relationList: [
                    { name: '>=', key: '>=' },
                    { name: '>', key: '>' },
                    { name: '=', key: '==' },
                    { name: '<=', key: '<=' },
                    { name: '<', key: '<' }
                ]
            }
        },
        computed: {
            ...mapState('nocode/nodeConfig', ['nodeData']),
            ...mapGetters('nocode/nodeConfig', ['processorData']),
            processorLength () {
                return this.nodeData.processors.length > 0 ? this.nodeData.processors.split(',').length : 0
            }
        },
        watch: {
            formData: {
                handler (val) {
                    this.$store.commit('nocode/nodeConfig/setFinishCondition', val)
                },
                deep: true
            }
        },
        created () {
            this.getConditionList()
        },
        methods: {
            getEmptyExp () {
                return {
                    key: '',
                    condition: '>=',
                    value: '',
                    source: 'global',
                    type: 'INT',
                    meta: {
                        code: '',
                        unit: 'INT'
                    }
                }
            },
            // 获取提前结束可选条件
            async getConditionList () {
                try {
                    this.conditionListLoading = true
                    const res = await this.$store.dispatch('nocode/flow/getSignNodeConditions', this.nodeData.id)
                    this.conditionList = res.filter(item => item.meta.code !== 'NODE_APPROVE_RESULT')
                } catch (e) {
                    console.error(e)
                } finally {
                    this.conditionListLoading = false
                }
            },
            tipsContent (exp) {
                const { type } = this.processorData
                let tips = ''
                // 未选择条件
                if (!exp.key) {
                    tips = this.$t('请选择处理人')
                }
                // 条件为个人，但是处理人类型不是个人
                if (!['PASS_RATE', 'REJECT_RATE'].includes(exp.meta.code) && type !== 'PERSON') {
                    tips = this.$t('请选择个人类型处理人')
                }
                // 条件为个人，处理人类型为个人，但是没有填值
                if (!['PASS_RATE', 'REJECT_RATE'].includes(exp.meta.code) && type === 'PERSON' && this.processorLength === 0) {
                    tips = this.$t('请选择处理人')
                }
                return tips
            },
            handleAddGroup () {
                this.formData.expressions.push({ type: 'and', expressions: [this.getEmptyExp()] })
            },
            handleDeleteGroup (index) {
                if (this.formData.expressions.length === 1) {
                    this.$bkInfo({
                        type: 'warning',
                        title: this.$t('确定删除唯一的条件组？'),
                        subTitle: this.$t('若删除，则必须所有人处理完成才结束'),
                        confirmFn: () => {
                            this.formData.expressions.splice(index, 1)
                        }
                    })
                } else {
                    this.formData.expressions.splice(index, 1)
                }
            },
            handleAddCondition (index, groupIndex) {
                this.formData.expressions[groupIndex].expressions.splice(index + 1, 0, this.getEmptyExp())
            },
            handleDeleteCondition (index, groupIndex) {
                if (this.formData.expressions[groupIndex].expressions.length === 1) {
                    return
                }
                this.formData.expressions[groupIndex].expressions.splice(index, 1)
            },
            handleSelectCondition (val, exp) {
                const condition = this.conditionList.find(item => item.key === val)
                const { code, unit } = condition.meta
                exp.key = val
                exp.meta.code = code
                exp.meta.unit = unit || 'INT'
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .condition-group-wrapper {
        position: relative;
        margin-top: 10px;
        .group-title {
            margin-bottom: 6px;
            color: #63656e;
            font-weight: 700;
            font-size: 14px;
        }
        .condition-content {
            padding: 24px;
            background: #fafbfd;
            border: 1px solid #dcdee5;
            .expression-item {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: space-between;
                &:not(:first-of-type) {
                    margin-top: 16px;
                }
            }
            .percent-icon {
                position: absolute;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 30px;
                width: 30px;
                top: 1px;
                right: 1px;
                color: #63656e;
                font-size: 12px;
                border-left: 1px solid #c4c6cc;
                background: #f2f4f8;
            }
            .opt-btns {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 40px;
                i {
                    color: #c4c6cc;
                    cursor: pointer;
                    &:not(.disabled):hover {
                    color: #979ba5;
                    }
                    &.disabled {
                    cursor: not-allowed;
                    }
                }
            }
        }
        .delete-icon {
            position: absolute;
            top: 40px;
            right: 6px;
            font-size: 18px;
            color: #c4c6cc;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
            }
        }
    }
    .create-group-btn {
        & > span {
            display: inline-flex;
            align-items: center;
            margin-top: 15px;
            font-size: 14px;
            line-height: 1;
            color: #3a84ff;
            cursor: pointer;
        }
    }
</style>
