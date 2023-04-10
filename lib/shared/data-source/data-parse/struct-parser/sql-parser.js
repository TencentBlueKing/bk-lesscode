/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import { Parser } from 'node-sql-parser'
import { diff } from '../common'
import {
    TABLE_MODIFY_TYPE,
    FIELD_MODIFY_TYPE,
    INDEX_MODIFY_TYPE,
    UNIQUE_MODIFY_TYPE
} from '../../constant'

// 解析 sql
function transformSql2Json (sqls) {
    const sqlParser = new Parser()
    const tableJsons = []
    sqls.forEach((sql) => {
        const ast = sqlParser.astify(sql.content)
        // 一个 sql 文件可能会有多个 sql 语句
        ast?.forEach((singleAst) => {
            // 导入只解析 create 语句
            if (singleAst.type === 'create') {
                // 只取第一个创建的 table
                const [{ table: tableName }] = singleAst.table
                // 定义
                const definitions = singleAst.create_definitions
                // 字段信息
                const columnsDefinition = definitions.filter(definition => definition.resource === 'column')
                // 主键信息
                const indexsDefinition = definitions.filter(definition => definition.resource === 'index')
                // 索引信息
                const primaryDefinition = definitions.find(definition => definition.resource === 'constraint' && definition.constraint_type === 'primary key')
                // 唯一性约束
                const uniqueDefinition = definitions.find(definition => definition.resource === 'constraint' && definition.constraint_type === 'unique')

                // 构造完整字段 json
                const columns = columnsDefinition.map((columnDefinition) => {
                    const name = columnDefinition.column.column
                    const defaultVal = columnDefinition?.default_val?.value
                    // ast 转 lesscode 存储 json
                    return {
                        name,
                        type: columnDefinition?.definition?.dataType?.toLowerCase(),
                        primary: !!primaryDefinition?.definition.find(primary => primary.column === name),
                        index: !!indexsDefinition?.find(indexDefinition => indexDefinition.index === name),
                        unique: columnDefinition?.unique_or_primary === 'unique' || !!uniqueDefinition?.definition.find(unique => unique.column === name),
                        nullable: columnDefinition?.nullable?.value === 'null',
                        default: defaultVal?.value || '',
                        comment: columnDefinition?.comment?.value?.value || '',
                        createDate: defaultVal?.name === 'CURRENT_TIMESTAMP' && defaultVal?.over?.type !== 'on update',
                        updateDate: defaultVal?.name === 'CURRENT_TIMESTAMP' && defaultVal?.over?.type === 'on update',
                        length: columnDefinition?.definition?.length || 0,
                        generated: columnDefinition.auto_increment === 'auto_increment',
                        scale: columnDefinition?.definition?.scale || 0
                    }
                })
                tableJsons.push({
                    tableName,
                    columns
                })
            }
        })
    })
    return tableJsons
}

// 注释
function getComment (column) {
    return column.comment ? `COMMENT '${column.comment.replace(/'|"|`/g, '\\$&')}'` : ''
}

/**
 * 获取字段的sql信息
 * @param {*} column 当前行
 * @returns 字段信息的 sql 字符串
 */
function getTableColumnSql (column) {
    // 获取字段名称
    const getName = (column) => {
        return `\`${column.name}\``
    }
    // 获取字段类型
    const getType = (column) => {
        const length = column.length || 0
        const scale = column.scale || 0
        const typeMap = {
            int: 'int(11)',
            varchar: `varchar(${length}) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`,
            datetime: 'datetime(0)',
            text: 'text',
            decimal: `decimal(${length}, ${scale})`,
            json: 'json',
            date: 'date'
        }
        return typeMap[column.type]
    }
    // 非空
    const getNullable = (column) => {
        return column.nullable ? 'NULL' : 'NOT NULL'
    }
    // 自增
    const getGenerated = (column) => {
        return column.generated ? 'AUTO_INCREMENT' : ''
    }
    // 默认值
    const getDefault = (column) => {
        if (column.generated || ['json', 'text'].includes(column.type)) return ''

        if (column.createDate) return 'DEFAULT CURRENT_TIMESTAMP(0)'

        if (column.updateDate) return 'DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)'

        if (Reflect.has(column, 'default') && column.default !== '') {
            const defaultVal = column.default
            return typeof defaultVal === 'string' ? `DEFAULT '${defaultVal}'` : `DEFAULT ${defaultVal}`
        }
    }
    const sqlArray = [
        getName(column),
        getType(column),
        getNullable(column),
        getGenerated(column),
        getDefault(column),
        getComment(column)
    ]
    return sqlArray.filter(v => v).join(' ')
}

/**
 * 生成主键相关 sql
 * @param {*} data 所有的字段
 * @returns 主键相关 sql
 */
function getPrimaryKey (data) {
    if (data.primary) {
        return `PRIMARY KEY (\`${data.name}\`) USING BTREE`
    }
}

/**
 * 生成索引相关 sql
 * @param {*} columns 所有的字段
 * @returns 索引相关 sql
 */
function getIndex ({ type, data }) {
    if (type === INDEX_MODIFY_TYPE.DROP) {
        return `INDEX \`${data.name}\``
    }
    if (type === INDEX_MODIFY_TYPE.ADD) {
        return `INDEX \`${data.name}\`(\`${data.name}\`) USING BTREE`
    }
}

/**
 * 生成唯一性相关 sql
 */
function getUnique ({ type, data }) {
    if (type === UNIQUE_MODIFY_TYPE.DROP) {
        return `INDEX \`_UNIQUE_${data.name}\``
    }
    if (type === UNIQUE_MODIFY_TYPE.ADD) {
        return `CONSTRAINT \`_UNIQUE_${data.name}\` UNIQUE(\`${data.name}\`)`
    }
}

/**
 * 生成创建表的sql
 * @param {*} data
 * @returns sql字符串
 */
function createTable (data, index, unique) {
    const { tableName, columns } = data
    const fields = ([
        ...columns.map(getTableColumnSql),
        ...columns.map(getPrimaryKey),
        ...index.map(getIndex),
        ...unique.map(getUnique)
    ]).filter(v => v).map(x => `    ${x}`)

    return (
        '-- ----------------------------\n'
        + `-- TABLE STRUCTURE FOR ${tableName}\n`
        + '-- ----------------------------\n'
        + `CREATE TABLE \`${tableName}\`  (\n`
        + fields.join(',\n')
        + '\n'
        + `) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ${getComment(data)} ROW_FORMAT = Dynamic;\n`
    )
}

/**
 * 生成修改表的sql
 * @param {*} data
 * @returns sql字符串
 */
function modifyTable (data, index = [], unique = []) {
    const { tableName, columns = [] } = data
    const sqlArr = []

    columns.forEach(({ type, data }) => {
        const columnDetailSql = getTableColumnSql(data)
        if (type === FIELD_MODIFY_TYPE.DROP_COLUMN) {
            sqlArr.push(`${type} \`${data.name}\``)
        } else {
            sqlArr.push(`${type} ${columnDetailSql}`)
        }
    })
    index.forEach((data) => {
        const indexDetailSql = getIndex(data)
        sqlArr.push(`${data.type} ${indexDetailSql}`)
    })
    unique.forEach((data) => {
        const uniqueDetailSql = getUnique(data)
        sqlArr.push(`${data.type} ${uniqueDetailSql}`)
    })

    return (
        '-- ----------------------------\n'
        + `-- MODIFY TABLE ${tableName}\n`
        + '-- ----------------------------\n'
        + `ALTER TABLE \`${tableName}\`\n`
        + sqlArr.join(',\n')
        + ';'
    )
}

/**
 * 生成删除表的sql
 * @param {*} data
 * @returns sql字符串
 */
function dropTable (data) {
    return (
        '-- ----------------------------\n'
        + `-- DROP TABLE ${data.tableName}\n`
        + '-- ----------------------------\n'
        + `DROP TABLE IF EXISTS \`${data.tableName}\`;\n`
    )
}

/**
 * 生成修改表名的sql
 * @param {*} data 修改后的数据
 * @param {*} originData 原始数据
 * @returns
 */
function renameTable (data, originData) {
    return (
        '-- ----------------------------\n'
        + `-- RENAME TABLE ${originData.tableName}\n`
        + '-- ----------------------------\n'
        + `ALTER TABLE \`${originData.tableName}\` RENAME TO \`${data.tableName}\`;\n`
    )
}

/**
 * 生成修改注释的sql
 * @param {*} data 修改后的数据
 * @returns 修改注释的sql
 */
function comment (data) {
    return (
        '-- ----------------------------\n'
        + `-- MODIFY COMMENT ${data.tableName}\n`
        + '-- ----------------------------\n'
        + `ALTER TABLE \`${data.tableName}\` ${getComment(data)};\n`
    )
}

/**
 * 通过对比，算出变化需要执行的sql
 * @param { originDatas, finalDatas } 导入前后的数据
 * @returns sql字符串
 */
function transformJson2Sql ({ originDatas, finalDatas }) {
    const diffResults = diff(originDatas, finalDatas)
    const sqlArray = []

    diffResults.forEach(({ type, data, originData, index, unique }) => {
        let sql
        switch (type) {
            case TABLE_MODIFY_TYPE.CREATE:
                sql = createTable(data, index, unique)
                break
            case TABLE_MODIFY_TYPE.MODIFY:
                sql = modifyTable(data, index, unique)
                break
            case TABLE_MODIFY_TYPE.DROP:
                sql = dropTable(data)
                break
            case TABLE_MODIFY_TYPE.RENAME:
                sql = renameTable(data, originData)
                break
            case TABLE_MODIFY_TYPE.COMMENT:
                sql = comment(data)
                break
        }
        sqlArray.push(sql)
    })

    return sqlArray.join('\n')
}

/**
 * sql 操作
 */
export class StructSqlParser {
    constructor (sql) {
        this.sql = sql
    }

    set (that = {}) {
        that.finalDatas = transformSql2Json(this.sql)
        return that
    }

    export (that) {
        return transformJson2Sql(that)
    }
}
