// select、multiselect、checkbox、radio 组件支持配置表单数据源
// 数据源类型分为 custom（用户手动输入）、api（第三方系统接口返回）、worksheet（其他表单字段）
export default {
    props: {
        useFixedDataSource: { // 使用静态数据，不通过接口请求远程数据源
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            sourceDataLoading: false, // 数据源loading
            sourceData: [], // 表单数据源数据
            isOpenApi: ''
        }
    },
    watch: {
        'field.meta.data_config' () {
            this.setSourceData()
        }
    },
    created () {
        this.setSourceData()
    },
    methods: {
        setSourceData () {
            const { source_type: sourceType } = this.field
            if (sourceType === 'CUSTOM') {
                this.sourceData = this.field.choice
            } else if (sourceType === 'FUNCTION') {
                this.setFunctionData()
            } else if (!this.useFixedDataSource) {
                if (sourceType === 'WORKSHEET') {
                    this.setWorksheetData()
                }
            }
        },
        async setWorksheetData () {
            try {
                const { field, conditions, tableName } = this.field.meta.data_config
                if (!tableName) {
                    return
                }
                this.sourceDataLoading = true
                // 如果字段配置了表单数据源，并且筛选条件使用了变量，则去掉该条件
                // const expressions = conditions.expressions.slice()
                // conditions.expressions = expressions.filter(item => item.type === 'const')
                const params = {
                    field,
                    group: field,
                    conditions
                }
                const resp = await this.$http.post(`/nocode/filterTableData/conditions/tableName/${tableName}`, params)
                this.sourceData = resp.data.map((item) => {
                    const val = item[field]
                    return { key: val, name: val }
                })
                this.sourceDataLoading = false
            } catch (e) {
                console.error(e)
            }
        },
        setFunctionData () {
            const { returnedValue, keys } = this.field.meta.function_data_source_config
            if (Array.isArray(returnedValue)) {
                const data = []
                const idKey = keys.id || 'id'
                const nameKey = keys.name || 'name'
                returnedValue.forEach(valItem => {
                    data.push({
                        key: valItem[idKey],
                        name: valItem[nameKey]
                    })
                })
                this.sourceData = data
            }
        }
    }
}
