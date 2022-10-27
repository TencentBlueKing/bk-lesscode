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
 * @param {*} useParam 是否使用参数配置生成 sql
 * @returns sql
 */
export const generateSqlByCondition = (condition = {}, tableList, useParam = true) => {
    const fieldIdNameMap = genFieldIdNameMap(tableList)
    const hasMultTable = condition.table.length > 1
    // 构造 sql
    let sql = generateTableSql(condition.table, fieldIdNameMap, hasMultTable, useParam)
        + generateWhereSql(condition.where, fieldIdNameMap, hasMultTable, useParam)
        + generateGroupBySql(condition.groupBy, fieldIdNameMap, hasMultTable, useParam)
        + generateOrderBySql(condition.orderBy, fieldIdNameMap, hasMultTable, useParam)
        + generateLimitSql(condition.limit, useParam)
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
 * 获取展示的字段值
 * @param {*} value 值
 * @param {*} param 参数
 * @param {*} useParam 是否使用参数
 * @param {*} isArray 值是不是数组
 * @returns 待展示的值
 */
const getShowValue = (value, param, useParam, isArray) => {
    if (isArray) {
        return useParam
            ? transValue2Array(param).map(val => `'\$\{${val}\}'`)
            : transValue2Array(value).map(val => `'${val}'`)
    }
    return useParam ? `\$\{${param}\}` : value
}

/**
 * 将值字符串转换成数组
 * @param {*} value 值字符串
 * @returns 数组
 */
const transValue2Array = (value) => {
    return value
        .split(',')
        .filter(v => v)
}

/**
 * 生成表和字段 sql
 * @param {*} tableName 表名
 * @param {*} fieldId 字段 id
 * @param {*} fieldIdNameMap 字段id和name的map
 * @param {*} hasMultTable 是不是多表查询
 * @returns 返回sql
 */
const getTableFieldSql = (tableName, fieldId, fieldIdNameMap, hasMultTable) => {
    let sql = fieldIdNameMap[`${tableName}_${fieldId}`]
    if (hasMultTable) {
        sql = `${getKeyWithWrapper(tableName)}.${sql}`
    }
    return sql
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

const getConnectionExpression = ({ expression, value, param }, useParam) => {
    let sql = ''
    switch (expression) {
        case '=':
        case '>':
        case '<':
        case '>=':
        case '<=':
        case '!=':
            sql = `${expression} '${getShowValue(value, param, useParam)}'`
            break
        case 'LIKE':
            sql = `LIKE '%${getShowValue(value, param, useParam)}%'`
            break
        case 'BETWEEN':
            const valArr = getShowValue(value, param, useParam, true)
            sql = `BETWEEN ${valArr[0]} AND ${valArr[1]}`
            break
        case 'IN':
        case 'NOT IN':
            sql = `${expression}(${getShowValue(value, param, useParam, true).join(', ')})`
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

const getConnectionSql = (item, index, key, fieldIdNameMap, hasMultTable, useParam) => {
    let sql = `${getTableFieldSql(item.tableName, item.fieldId, fieldIdNameMap, hasMultTable)} ${getConnectionExpression(item, useParam)}`
    if (index > 0) {
        sql = `  ${item.type} ${sql}`
    } else {
        sql = `${key} ${sql}`
    }
    return sql
}

const generateTableSql = (table, fieldIdNameMap, hasMultTable) => {
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
            let name = getTableFieldSql(field.tableName, field.fieldId, fieldIdNameMap, hasMultTable)
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

const generateWhereSql = (where, fieldIdNameMap, hasMultTable, useParam) => {
    if (!where || where.length <= 0) return ''

    let sql = ''
    where.forEach((whereItem, index) => {
        if (!isEmpty(whereItem.tableName) && !isEmpty(whereItem.fieldId)) {
            sql += `\r\n${getConnectionSql(whereItem, index, 'WHERE', fieldIdNameMap, hasMultTable, useParam)}`
        }
    })
    return sql
}

const generateGroupBySql = (groupBy, fieldIdNameMap, hasMultTable, useParam) => {
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
                    sql += ` ${getTableFieldSql(field.tableName, field.fieldId, fieldIdNameMap, hasMultTable)}`
                }
            })
        groupBy
            ?.having
            ?.forEach((item, index) => {
                if (!isEmpty(item.tableName) && !isEmpty(item.fieldId)) {
                    sql += `\r\n  ${getConnectionSql(item, index, 'HAVING', fieldIdNameMap, hasMultTable, useParam)}`
                }
            })
    }
    return sql
}

const generateOrderBySql = (orderBy, fieldIdNameMap, hasMultTable) => {
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
            sql += ` ${getTableFieldSql(item.tableName, item.fieldId, fieldIdNameMap, hasMultTable)} ${item.type}`
        }
    })
    return sql
}

const generateLimitSql = (limit, useParam) => {
    if (!limit) return ''

    return `\r\nLIMIT ${getShowValue(limit.index, limit.indexParam, useParam)}, ${getShowValue(limit.length, limit.lengthParam, useParam)}`
}
