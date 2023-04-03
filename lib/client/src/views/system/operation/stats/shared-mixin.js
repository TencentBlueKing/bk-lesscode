import dayjs from 'dayjs'

export default {
    filters: {
        formatCount (value) {
            const count = Number(value)
            if (isNaN(count)) {
                return '--'
            }
            return count.toLocaleString()
        },
        formatTime (value) {
            if (!value) return '--'
            return dayjs(value).format('YYYY-MM-DD HH:mm')
        }
    },
    computed: {
        timeParam () {
            if (!this.filters.dateRange) {
                return
            }

            const dateRange = this.filters.dateRange.filter(item => item)
            if (!dateRange.length) {
                return
            }

            return ([
                +new Date(`${dateRange[0]}`),
                +new Date(`${dateRange[1]}`)
            ])
        }
    },
    data () {
        const dates = [
            [[window.i18n.t('今天'), 0], [window.i18n.t('近7天'), 7], [window.i18n.t('近15天'), 15], [window.i18n.t('近30天'), 30], [window.i18n.t('近90天'), 90], [window.i18n.t('近180天'), 90]],
            [[window.i18n.t('近1周'), 7], [window.i18n.t('近1个月'), 30], [window.i18n.t('近3个月'), 90], [window.i18n.t('近半年'), 180], [window.i18n.t('近1年'), 365], [window.i18n.t('近2年'), 730], [window.i18n.t('近3年'), 1095]]
        ]
        return {
            dateShortcuts: dates.map(dateSeq => {
                return dateSeq.map((date) => ({
                    text: date[0],
                    value () {
                        const end = new Date()
                        const start = new Date()
                        if (date[1] === 0) {
                            start.setTime(new Date(new Date().toLocaleDateString()).getTime())
                        } else {
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * date[1])
                        }
                        return [start, end]
                    }
                }))
            })
        }
    },
    methods: {
        handlePageChange (page) {
            this.pagination.current = page
            this.fetchData()
        },
        handlePageLimitChange (limit) {
            this.pagination.limit = limit
            this.pagination.current = 1
            this.fetchData()
        },
        handleTimeChange () {
            if (this.pagination) {
                this.pagination.current = 1
            }
            this.fetchData()

            // “按时间”维度下获取总数
            if (this.fetchTotalData) {
                this.fetchTotalData()
            }
        },
        handleTimeTypeChange () {
            this.fetchData()
        },
        handleKeywordClear () {
            this.pagination.current = 1
            this.fetchData()
        },
        handleKeywordEnter () {
            this.pagination.current = 1
            this.fetchData()
        },
        handleDateShortcutChange (value, index) {
            this.dateShortcutSelectedIndex = index
        },
        setFilterDateTime () {
            let timeRange = this.filters.dateRange
            if (this.dateShortcutSelectedIndex !== -1) {
                timeRange = this.dateShortcuts[1][this.dateShortcutSelectedIndex].value()
            }

            timeRange = timeRange.filter(item => item)
            if (timeRange.length) {
                this.filters.time = [+new Date(`${timeRange[0]}`), +new Date(`${timeRange[1]}`)]
            }
        }
    }
}
