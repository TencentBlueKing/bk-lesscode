<template>
    <section>
        <setter-form-item :title="$t('开始日期')">
            <bk-select
                v-model="localConfig.startDate.key"
                :searchable="true"
                :clearable="false"
                :disabled="disabled"
                @change="dateSourceChange($event,'startDate')">
                <bk-option
                    v-for="option in allDateList"
                    :key="option.key"
                    :id="option.key"
                    :name="option.label" />
            </bk-select>
            <bk-date-picker
                v-show="localConfig.startDate.key === 'specify_date'"
                v-model="localConfig.startDate.value"
                class="specify-date-picker"
                type="datetime"
                :placeholder="$t('选择开始日期时间')"
                :disabled="disabled"
                :options="{
                    disabledDate: filterStartDate
                }"
                @change="dateChange($event, 'startDate')">
            </bk-date-picker>
        </setter-form-item>
        <setter-form-item :title="$t('结束日期')">
            <bk-select
                v-model="localConfig.endDate.key"
                :searchable="true"
                :clearable="false"
                :disabled="disabled"
                @change="dateSourceChange($event,'endDate')">
                <bk-option v-for="option in allDateList"
                    :key="option.key"
                    :id="option.key"
                    :name="option.label">
                </bk-option>
            </bk-select>
            <bk-date-picker
                v-show="localConfig.endDate.key === 'specify_date'"
                v-model="localConfig.endDate.value"
                class="specify-date-picker"
                type="datetime"
                :placeholder="$t('选择结束日期时间')"
                :searchable="true"
                :clearable="false"
                :disabled="disabled"
                :options="{
                    disabledDate: filterEndDate
                }"
                @change="dateChange($event,'endDate')">
            </bk-date-picker>
        </setter-form-item>
        <setter-form-item :title="$t('结果精度')">
            <bk-select
                v-model="localConfig.accuracyResult"
                :disabled="disabled"
                :clearable="false"
                @change="handleCalcDiff">
                <bk-option
                    v-for="option in accuracyResultList"
                    :key="option.value"
                    :id="option.value"
                    :name="option.label">
                </bk-option>
            </bk-select>
        </setter-form-item>
        <!-- 日期精度不是day且开始和结束日期精度都未到时分秒时显示该配置项 -->
        <setter-form-item
            v-show="localConfig.accuracyResult !== 'day' && isAccuracyDownToDay"
            :title="$t('日期字段为选择精确到时间时，默认为')">
            <bk-time-picker
                v-model="localConfig.defaultTime"
                :placeholder="$t('选择时间')"
                :disabled="disabled"
                @change="handleCalcDiff">
            </bk-time-picker>
        </setter-form-item>
    </section>
</template>
<script>
    import { mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import dayjs from 'dayjs'
    import setterFormItem from '../../../common/setter-form-item.vue'

    export default {
        name: 'compute-date',
        components: {
            setterFormItem
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
                dateList: [
                    {
                        key: 'creation_date',
                        label: this.$t('创建日期'),
                        value: ''
                    },
                    {
                        key: 'update_date',
                        label: this.$t('最近更新日期'),
                        value: ''
                    },
                    {
                        key: 'specify_date',
                        label: this.$t('指定日期'),
                        value: ''
                    }
                ],
                accuracyResultList: [
                    {
                        label: this.$t('天数'),
                        value: 'day'
                    },
                    {
                        label: this.$t('小时'),
                        value: 'hour'
                    },
                    {
                        label: this.$t('分钟'),
                        value: 'minutes'
                    }
                ],
                computDateDiffTimer: null
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            isAccuracyDownToDay () {
                const start = this.localConfig.startDate.value
                const end = this.localConfig.endDate.value
                const result = this.checkAccuracy(start, end)
                return result
            },
            allDateList () {
                const dateTypes = this.list.filter((item) => {
                    return item.type === 'date'
                }).map((item) => {
                    return {
                        key: item.configure.key,
                        label: this.$t('{n}（表单字段）', { n: item.configure.name }),
                        value: item.configure.value
                    }
                })
                return [...this.dateList, ...dateTypes]
            }
        },
        methods: {
            dateSourceChange (val, key) {
                if (val !== 'specify_date') {
                    this.localConfig[key].value = this.allDateList.find((item) => {
                        return item.key === val
                    })?.value
                }
                this.handleCalcDiff()
            },
            dateChange (value, key) {
                this.localConfig[key].value = value
                this.handleCalcDiff()
            },
            // 计算时间间隔
            handleCalcDiff () {
                if (this.computDateDiffTimer) {
                    clearTimeout(this.computDateDiffTimer)
                }
                this.computDateDiffTimer = setTimeout(() => {
                    this.field.default = this.getDiffResult()
                    this.update()
                }, 200)
            },
            getDiffResult () {
                const { startDate, endDate } = this.localConfig
                const { start, end } = this.setAccuracy(startDate.value, endDate.value, this.localConfig)
                let value = '--'
                if (start && end && (dayjs(end).diff(dayjs(start)) > 0)) {
                    // 结束日期-开始日期
                    const startDate = dayjs(start)
                    const endDate = dayjs(end)
                    const days = endDate.diff(startDate, 'day')
                    const hours = parseInt(endDate.diff(startDate, 'hour') - (days * 24))
                    const minutes = parseInt(endDate.diff(startDate, 'minute') - (days * 24 * 60 + hours * 60))
                    value = this.$t('{0}天', [days])
                    const accuracyResult = this.localConfig.accuracyResult
                    if (accuracyResult !== 'day') {
                        value += this.$t('{0}小时', [hours])
                        if (accuracyResult === 'minutes') {
                            value += this.$t('{0}分钟', [minutes])
                        }
                    }
                }
                return value
            },
            // 设置时间精度
            setAccuracy (start, end, computConfigInfo) {
                // 如果开始和结束日期的精度不是时分秒，且精度选择时或分
                if (this.checkAccuracy(start, end) && computConfigInfo.accuracyResult !== 'day') {
                    const defaultTime = computConfigInfo.defaultTime
                    if (defaultTime) {
                        start = `${dayjs(start).format('YYYY-MM-DD ')} ${defaultTime}`
                        end = `${dayjs(end).format('YYYY-MM-DD ')} ${defaultTime}`
                    } else {
                        start = ''
                        end = ''
                    }
                }
                return { start, end }
            },
            // 检查日期精度是否到天
            checkAccuracy (start, end) {
                if (!start || !end) {
                    return true
                }
                const startDate = dayjs(start).format('YYYY-MM-DD HH:mm:ss')
                const endDate = dayjs(end).format('YYYY-MM-DD HH:mm:ss')
                // 时间格式字符串以00:00:00则表示精度为天
                if (startDate.includes('00:00:00') || endDate.includes('00:00:00')) {
                    return true
                }

                this.localConfig.defaultTime = ''
                return false
            },
            // 过滤可选的开始日期
            filterStartDate (date) {
                const value = this.localConfig.endDate.value
                if (value) {
                    const start = dayjs(date)
                    const end = dayjs(value)
                    return end.diff(start) < 0
                }
            },
            // 过滤可选的结束日期
            filterEndDate (date) {
                const value = this.localConfig.startDate.value
                if (value) {
                    const start = dayjs(value)
                    const end = dayjs(date)
                    return end.diff(start) < 0
                }
            },
            update () {
                this.$emit('update', this.localConfig)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .specify-date-picker {
        margin-top: 5px;
    }
    /deep/ {
        .bk-date-picker {
            width: 100%;
        }
    }
</style>
