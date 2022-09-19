export default {
    data () {
        return {
            systemQS: ['pageCode', 'activeTab', 'activeNode'] // 系统内置的querystring参数
        }
    },
    methods: {
        // 根据queryString参数设置查询条件初始值
        setInitFilterData () {
            const { query } = this.$route
            const allFields = [...this.systemFields, ...this.fields]
            const filtersData = {}
            Object.keys(query).forEach(key => {
                if (this.systemQS.includes(key)) { // 预览页面url内值固定参数
                    return
                }
                const field = allFields.find(item => item.key === key)
                const val = query[key]
                if (field) {
                    filtersData[key] = ['DATE', 'DATETIME', 'MULTISELECT', 'CHECKBOX'].includes(field.type) ? val.split(',') : val
                }
            })
            this.filtersData = filtersData
        },
        // 查询条件更新到queryString
        updateQueryString () {
            const { path, hash, params, query } = this.$route
            const tableQuerys = {}
            Object.keys(query).forEach(key => {
                if (this.systemQS.includes(key)) {
                    tableQuerys[key] = query[key]
                }
            })
            Object.keys(this.filtersData).forEach(key => {
                if (this.systemQS.includes(key)) { // 预览页面url内值固定参数
                    return
                }
                const val = this.filtersData[key]
                if (Array.isArray(val)) {
                    if (val.some(item => !!item)) {
                        tableQuerys[key] = val.join(',')
                    }
                } else {
                    if (val) {
                        tableQuerys[key] = val
                    }
                }
            })
            this.$router.replace({ path, hash, params, query: { ...tableQuerys } })
        }
    }
}
