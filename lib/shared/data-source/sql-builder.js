/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import {
    isEmpty
} from '../util'

/**
 * 通过查询 json 生成 sql
 * @param {*} condition 查询 json
 * @param {*} tableList 配置的表列表
 * @returns sql
 */
export const generateSqlByCondition = (condition = {}, tableList) => {
    const fieldIdNameMap = genFieldIdNameMap(tableList)
    let sql = generateTableSql(condition.table, fieldIdNameMap)
        + generateWhereSql(condition.where, fieldIdNameMap)
        + generateGroupBySql(condition.groupBy, fieldIdNameMap)
        + generateOrderBySql(condition.orderBy, fieldIdNameMap)
        + generateLimitSql(condition.limit)
    if (sql) sql = `${sql};`
    return sql
}

/**
 * sql 关键字包含一层
 * @param {*} key 关键字
 * @returns 包含后的 sql
 */
const getKeyWithWrapper = (key) => {
    return `\`${key}\``
}

/**
 * 通过表配置实时查询字段名
 * @param {*} fieldId id
 * @param {*} tableName 表名
 * @param {*} tableList 表列表
 * @returns 字段名
 */
const genFieldIdNameMap = (tableList) => {
    const fieldIdNameMap = {}
    tableList?.forEach((table) => {
        table.columns.forEach((column) => {
            fieldIdNameMap[`${table.tableName}_${column.columnId}`] = getKeyWithWrapper(column.name)
        })
        fieldIdNameMap[`${table.tableName}_*`] = '*'
    })
    return fieldIdNameMap
}

const getConnectionExpression = ({ expression, value }) => {
    const transValue2Array = (value) => {
        return value
            .split(',')
            .filter(v => v)
            .map(x => `'${x}'`)
    }
    let sql = ''
    switch (expression) {
        case '=':
        case '>':
        case '<':
        case '>=':
        case '<=':
        case '!=':
            sql = `${expression} '${value}'`
            break
        case 'LIKE':
            sql = `LIKE '%${value}%'`
            break
        case 'BETWEEN':
            sql = `BETWEEN ${transValue2Array(value)[0]} AND ${transValue2Array(value)[1]}`
            break
        case 'IN':
        case 'NOT IN':
            sql = `${expression}(${transValue2Array(value).join(', ')})`
            break
        case 'IS NULL':
            sql = 'IS NULL'
            break
        case 'NOT NULL':
            sql = 'IS NOT NULL'
            break
    }
    return sql
}

const getConnectionSql = (item, index, key, fieldIdNameMap) => {
    let sql = `${getKeyWithWrapper(item.tableName)}.${fieldIdNameMap[`${item.tableName}_${item.fieldId}`]} ${getConnectionExpression(item)}`
    if (index > 0) {
        sql = `  ${item.type} ${sql}`
    } else {
        sql = `${key} ${sql}`
    }
    return sql
}

const generateTableSql = (table, fieldIdNameMap) => {
    if (!table || table.length <= 0) return ''
    let sql = ''
    const fieldList = table
        .reduce((acc, cur) => {
            if (cur.fields) {
                acc.push(...cur.fields)
            }
            return acc
        }, [])
        .sort((a, b) => (a.distinct - b.distinct))
    // 拼接字段
    fieldList.forEach((field, index) => {
        if (field.fieldId) {
            let name = fieldIdNameMap[`${field.tableName}_${field.fieldId}`]
            // 多表需要加表名前缀
            if (table.length > 1) {
                name = `${getKeyWithWrapper(field.tableName)}.${name}`
            }
            // 去重
            if (field.distinct) {
                name = `DISTINCT ${name}`
            }
            // 函数
            if (field.functionName) {
                name = `${field.functionName}(${name})`
            }
            // 别名
            if (field.alias) {
                name += ` AS \`${field.alias}\``
            }
            // 逗号间隔
            if (index > 0) {
                name = `, ${name}`
            }
            // 首句
            if (index <= 0) {
                name = `SELECT ${name}`
            }
            sql += name
        }
    })

    // 拼接连接表
    table.forEach((table, index) => {
        if (!isEmpty(table.tableName) && !isEmpty(fieldList[0]?.fieldId)) {
            if (index <= 0) {
                sql += `\r\nFROM ${getKeyWithWrapper(table.tableName)}`
            } else if (
                !isEmpty(table.on)
                && !isEmpty(table.on[0].left.tableName)
                && !isEmpty(table.on[0].left.fieldId)
                && !isEmpty(table.on[0].right.tableName)
                && !isEmpty(table.on[0].right.fieldId)
            ) {
                sql += `\r\n${table.joinType} ${getKeyWithWrapper(table.tableName)}`
                table.on.forEach(({ left, right, type }, index) => {
                    if (
                        !isEmpty(left.tableName)
                        && !isEmpty(left.fieldId)
                        && !isEmpty(right.tableName)
                        && !isEmpty(right.fieldId)
                    ) {
                        let connectSql = `${getKeyWithWrapper(left.tableName)}.${fieldIdNameMap[`${left.tableName}_${left.fieldId}`]} = ${getKeyWithWrapper(right.tableName)}.${fieldIdNameMap[`${right.tableName}_${right.fieldId}`]}`
                        if (index > 0) {
                            connectSql = `\r\n    ${type} ${connectSql}`
                        } else {
                            connectSql = `\r\n  ON ${connectSql}`
                        }
                        sql += connectSql
                    }
                })
            }
        }
    })
    return sql
}

const generateWhereSql = (where, fieldIdNameMap) => {
    if (!where || where.length <= 0) return ''

    let sql = ''
    where.forEach((whereItem, index) => {
        if (!isEmpty(whereItem.tableName) && !isEmpty(whereItem.fieldId)) {
            sql += `\r\n${getConnectionSql(whereItem, index, 'WHERE', fieldIdNameMap)}`
        }
    })
    return sql
}

const generateGroupBySql = (groupBy, fieldIdNameMap) => {
    if (!groupBy) return ''

    let sql = ''
    if (
        !isEmpty(groupBy.fields)
        && !isEmpty(groupBy.fields[0].tableName)
        && !isEmpty(groupBy.fields[0].fieldId)
    ) {
        sql = '\r\nGROUP BY'
        groupBy
            .fields
            .forEach((field, index) => {
                if (!isEmpty(field.tableName) && !isEmpty(field.fieldId)) {
                    if (index > 0) {
                        sql += ','
                    }
                    sql += ` ${getKeyWithWrapper(field.tableName)}.${fieldIdNameMap[`${field.tableName}_${field.fieldId}`]}`
                }
            })
        groupBy
            ?.having
            ?.forEach((item, index) => {
                if (!isEmpty(item.tableName) && !isEmpty(item.fieldId)) {
                    sql += `\r\n  ${getConnectionSql(item, index, 'HAVING', fieldIdNameMap)}`
                }
            })
    }
    return sql
}

const generateOrderBySql = (orderBy, fieldIdNameMap) => {
    if (isEmpty(orderBy)) return ''

    let sql = ''
    if (!isEmpty(orderBy[0].tableName) && !isEmpty(orderBy[0].fieldId)) {
        sql = '\r\nORDER BY'
    }
    orderBy.forEach((item, index) => {
        if (!isEmpty(item.tableName) && !isEmpty(item.fieldId)) {
            if (index > 0) {
                sql += ','
            }
            sql += ` ${getKeyWithWrapper(item.tableName)}.${fieldIdNameMap[`${item.tableName}_${item.fieldId}`]} ${item.type}`
        }
    })
    return sql
}

const generateLimitSql = (limit) => {
    if (!limit) return ''

    return `\r\nLIMIT ${limit.index}, ${limit.length}`
}
