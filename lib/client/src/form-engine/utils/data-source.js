// 将数据源配置转换为实际的数据值
export async function transDataSourceValue (dataSource, instance) {
    const { type, config, data } = dataSource
    if (type === 'FUNCTION') {
        const { returnedValue, keys } = config
        const list = []
        if (Array.isArray(returnedValue)) {
            const idKey = keys.id || 'id'
            const nameKey = keys.name || 'name'
            returnedValue.forEach(valItem => {
                list.push({
                    id: valItem[idKey],
                    label: valItem[nameKey]
                })
            })
        }
        return list
    } else if (type === 'WORKSHEET') {
        try {
            const list = []
            const { fieldKey, logic, conditions, tableName } = config
            if (tableName && fieldKey) {
                const params = {
                    field: fieldKey,
                    group: fieldKey,
                    conditions: {
                        connector: logic.toLowerCase(),
                        expressions: conditions.filter(item => item.key).map(item => {
                            const { key, logic, type, value } = item
                            return { key, type, value, condition: logic }
                        })
                    }
                }
                const resp = await instance.$http.post(`/nocode/filterTableData/conditions/tableName/${tableName}`, params)
                console.log('resp data -------------------------------------------------->', resp)
                resp.data.forEach((item) => {
                    const val = item[fieldKey]
                    if (val !== undefined) {
                        list.push({ id: val, label: val })
                    }
                })
            }
            return list
        } catch (e) {
            console.error(e)
        }
    }

    return data
}
