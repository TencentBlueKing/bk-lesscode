/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import {
    buildXlsxBufferFromAoa,
    parseFirstSheetToJson
} from '../../../excel'
import {
    ORM_KEYS
} from '../../constant'

/**
 * 把 xlsx 导出为 json 格式的内容
 * @param {[{ tableName, content }]} xlsxs xlsx 数据
 * @returns [{ tableName: 表名, columns: 列信息 }]
 */
async function transformXlsx2Json (xlsxs) {
    const result = []
    for (const { tableName, content } of xlsxs) {
        const columns = await parseFirstSheetToJson(content, { cellDates: true })
        result.push({
            tableName,
            columns
        })
    }
    return result
}

/**
 * 把 json 导出为 xlsx 格式的内容
 * @param {*} finalDatas table json
 * @returns [{ tableName: 表名, content: 文件内容 }]
 */
async function transformJson2Xlsx (finalDatas) {
    const result = []
    for (const { tableName, columns } of finalDatas) {
        const header = ORM_KEYS.filter(x => x !== 'columnId')
        const body = []
        columns.forEach((column) => {
            const columnValue = header.map((key) => {
                return (Reflect.has(column, key) ? column[key] : '')
            })
            body.push(columnValue)
        })
        const content = await buildXlsxBufferFromAoa(tableName, [header, ...body])
        result.push({ tableName, content })
    }
    return result
}

/**
 * xlsx 操作
 */
export class StructXlsxParser {
    constructor (xlsxs) {
        this.xlsxs = xlsxs
    }

    async set (that = {}) {
        that.finalDatas = await transformXlsx2Json(this.xlsxs)
        return that
    }

    async export (that) {
        return transformJson2Xlsx(that.finalDatas)
    }
}
