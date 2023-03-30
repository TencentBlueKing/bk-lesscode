<template>
    <div>
        <div class="row-box">
            <span>开始日期</span>
            <bk-select
                v-model="computConfigInfo.dateTime.startDate.key"
                @change="($event) => {
                    dateSourceChange($event,'startDate')
                }"
                searchable>
                <bk-option v-for="option in allDateList"
                    :key="option.key"
                    :id="option.key"
                    :name="option.label">
                </bk-option>
            </bk-select>
            <bk-date-picker
                class="mg-top-5 w-272"
                v-show="computConfigInfo.dateTime.startDate.key === 'specify_date'"
                @change="($event) => {
                    dateChange($event,'startDate')
                }"
                :options="{
                    disabledDate: filterStartDate
                }"
                v-model="computConfigInfo.dateTime.startDate.value"
                :placeholder="'选择开始日期时间'"
                :type="'datetime'">
            </bk-date-picker>
        </div>
        <div class="row-box">
            <span>结束日期</span>
            <bk-select
                v-model="computConfigInfo.dateTime.endDate.key"
                @change="($event) => {
                    dateSourceChange($event,'endDate')
                }"
                searchable>
                <bk-option v-for="option in allDateList"
                    :key="option.key"
                    :id="option.key"
                    :name="option.label">
                </bk-option>
            </bk-select>
            <bk-date-picker
                class="mg-top-5 w-272"
                v-show="computConfigInfo.dateTime.endDate.key === 'specify_date'"
                @change="($event) => {
                    dateChange($event,'endDate')
                }"
                :options="{
                    disabledDate: filterEndDate
                }"
                v-model="computConfigInfo.dateTime.endDate.value"
                :placeholder="'选择结束日期时间'"
                :type="'datetime'">
            </bk-date-picker>
        </div>
        <div class="row-box">
            <span>结果精度</span>
            <bk-select
                v-model="computConfigInfo.dateTime.accuracyResult"
                @change="computDateDiff">
                <bk-option v-for="option in accuracyResultList"
                    :key="option.value"
                    :id="option.value"
                    :name="option.label">
                </bk-option>
            </bk-select>
        </div>
        <!-- 日期精度不是day且开始和结束日期精度都未到时分秒时显示该配置项 -->
        <div class="row-box" v-show="checkAccuracy && computConfigInfo.dateTime.accuracyResult !== 'day'">
            <span>日期字段为选择精确到时间时，默认为</span>
            <bk-time-picker v-model="computConfigInfo.dateTime.defaultTime" :placeholder="'选择时间'" @change="computDateDiff"></bk-time-picker>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import dayjs from 'dayjs'
    import { checkAccuracy, computDateDiff } from '@/components/flow-form-comp/form/util/index.js'

    export default {
        name: 'BkLesscodeComputDate',
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            computConfigInfo: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                dateList: [
                    {
                        key: 'creation_date',
                        label: '创建日期',
                        value: ''
                    }, {
                        key: 'update_date',
                        label: '最近更新日期',
                        value: ''
                    }, {
                        key: 'specify_date',
                        label: '指定日期',
                        value: ''
                    }
                ],
                accuracyResultList: [
                    {
                        label: '天数',
                        value: 'day'
                    }, {
                        label: '小时',
                        value: 'hour'
                    }, {
                        label: '分钟',
                        value: 'minutes'
                    }
                ],
                computDateDiffTimer: null
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            ...mapGetters('nocode/formSetting', ['fieldsList']),

            checkAccuracy () {
                const startDateValue = this.computConfigInfo.dateTime.startDate.value
                const endDateValue = this.computConfigInfo.dateTime.endDate.value
                const bool = checkAccuracy(startDateValue, endDateValue)
                if (!bool) {
                    this.computConfigInfo.dateTime.defaultTime = ''
                }
                return bool
            },
            allDateList () {
                const dateTypes = this.fieldsList.filter((item) => {
                    return item.type === 'DATE'
                }).map((item) => {
                    return {
                        key: item.key,
                        label: `${item.name}（表单字段）`,
                        value: item.default
                    }
                })
                return [...this.dateList, ...dateTypes]
            }
        },
        watch: {
            pageDetail: {
                handler (val) {
                    this.allDateList[0].value = val.createTime
                    this.allDateList[1].value = val.updateTime
                },
                immediate: true
            }
        },
        methods: {
            // 开始或结束日期
            dateSourceChange (value, key) {
                if (value !== 'specify_date') {
                    this.computConfigInfo.dateTime[key].value = this.allDateList.find((item) => {
                        return item.key === value
                    })?.value
                }
                this.computDateDiff()
            },
            dateChange (value, key) {
                this.computConfigInfo.dateTime[key].value = value
                this.computDateDiff()
            },
            // 计算时间间隔
            computDateDiff () {
                if (this.computDateDiffTimer) {
                    clearTimeout(this.computDateDiffTimer)
                }
                this.computDateDiffTimer = setTimeout(() => {
                    this.field.default = computDateDiff(this.computConfigInfo)
                    this.update()
                }, 200)
            },
            // 过滤可选的开始日期
            filterStartDate (date) {
                const value = this.computConfigInfo.dateTime.endDate.value
                if (value) {
                    const startDateValue = dayjs(date)
                    const endDateValue = dayjs(value)
                    return endDateValue.diff(startDateValue) < 0
                }
            },
            // 过滤可选的结束日期
            filterEndDate (date) {
                const value = this.computConfigInfo.dateTime.startDate.value
                if (value) {
                    const startDateValue = dayjs(value)
                    const endDateValue = dayjs(date)
                    return endDateValue.diff(startDateValue) < 0
                }
            },
            update () {
                this.$emit('change', this.field)
            }
           
        }
    }
</script>

<style lang="postcss" scoped>
.row-box{
    margin: 10px 0 ;
    font-size: 12px;
}
.w-272{
    width: 272px;
}
.mg-top-5{
    margin-top: 5px;
}
</style>
