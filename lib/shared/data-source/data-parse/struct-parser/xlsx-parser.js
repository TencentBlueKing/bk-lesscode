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
import * as XLSX from 'xlsx'
import {
    ORM_KEYS
} from '../../constant'

/**
 * 把 xlsx 导出为 json 格式的内容
 * @param {[{ tableName, content }]} xlsxs xlsx 数据
 * @returns [{ tableName: 表名, columns: 列信息 }]
 */
function transformXlsx2Json (xlsxs) {
    return xlsxs.map(({ tableName, content }) => {
        const workBook = XLSX.read(content, { type: 'binary', cellDates: true })
        // 读取第一个 sheet
        const columns = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]])
        return {
            tableName,
            columns
        }
    })
}

/**
 * 把 json 导出为 xlsx 格式的内容
 * @param {*} finalDatas table json
 * @returns [{ tableName: 表名, content: 文件内容 }]
 */
function transformJson2Xlsx (finalDatas) {
    return finalDatas.map(({ tableName, columns }) => {
        // 生成表头
        const header = ORM_KEYS.filter(x => x !== 'columnId')

        // 生成字段值
        const body = []
        columns.forEach((column) => {
            const columnValue = header.map((key) => {
                return (Reflect.has(column, key) ? column[key] : '')
            })
            body.push(columnValue)
        })

        // 构造 xlsx 文件
        const workBook = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([header, ...body])
        XLSX.utils.book_append_sheet(workBook, ws, tableName)
        const content = XLSX.write(workBook, { bookType: 'xlsx', bookSST: false, type: 'buffer' })

        return { tableName, content }
    })
}

/**
 * xlsx 操作
 */
export class StructXlsxParser {
    constructor (xlsxs) {
        this.xlsxs = xlsxs
    }

    set (that = {}) {
        that.finalDatas = transformXlsx2Json(this.xlsxs)
        return that
    }

    export (that) {
        return transformJson2Xlsx(that.finalDatas)
    }
}
