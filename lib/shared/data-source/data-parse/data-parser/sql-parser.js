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
import { diffDatas } from '../common'
import { DATA_MODIFY_TYPE } from '../../constant'

/**
 * sql 转 json
 * @param {*} sqls sql 文件列表
 * @returns 数据json
 */
function transformSql2Json (sqls) {
    const sqlParser = new Parser()
    return sqls.map(({ content }) => {
        const ast = sqlParser.astify(content)
        // 数据解析只支持 insert
        const datas = []
        const insertDefinitions = ast.filter(insertDefinition => insertDefinition.type === 'insert')
        insertDefinitions.forEach(({ columns, values }) => {
            values.forEach(value => {
                const data = columns.reduce((acc, cur, index) => {
                    acc[cur] = value.value[index].value
                    return acc
                }, {})
                datas.push(data)
            })
        })
        return datas
    })
}

/**
 * 对比修改前后的数据列表，返回sql字符串
 * data 数据结构：{ tableName: '', list: [] }
 * @param {*} originDatas 原始数据
 * @param {*} finalDatas 修改后的数据
 * @returns sql字符串
 */
function transformJson2Sql (originDatas, finalDatas) {
    const sqlArr = []
    const diffResult = diffDatas(originDatas, finalDatas)
    diffResult.forEach(({ type, data, tableName }) => {
        const tableKeys = Object.keys(data)
        const tableValues = Object.values(data)
        const updateValues = tableKeys.reduce((acc, cur) => {
            acc.push(`\`${cur}\`='${data[cur]}'`)
            return acc
        }, [])
        switch (type) {
            case DATA_MODIFY_TYPE.INSERT:
                sqlArr.push(`INSERT INTO \`${tableName}\`(\`${tableKeys.join('\`,\`')}\`) VALUES('${tableValues.join('\',\'')}');`)
                break
            case DATA_MODIFY_TYPE.UPDATE:
                sqlArr.push(`UPDATE \`${tableName}\` SET ${updateValues.join(',')} WHERE \`id\` = ${data.id};`)
                break
            case DATA_MODIFY_TYPE.DELETE:
                sqlArr.push(`DELETE FROM \`${tableName}\` WHERE \`id\` = ${data.id};`)
                break
        }
    })
    return sqlArr.join('\n')
}

/**
 * sql 操作
 */
export class DataSqlParser {
    constructor (sqls) {
        this.sqls = sqls
    }

    set (that = {}) {
        that.finalDatas = transformSql2Json(this.sqls)
        return that
    }

    export (that) {
        return transformJson2Sql(that.originDatas, that.finalDatas)
    }
}
