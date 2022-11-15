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

/**
 * xlsx 转 json
 * @param {*} xlsxs xlsx 文件
 * @returns 数据 json
 */
function transformXlsx2Json (xlsxs) {
    return xlsxs.map(({ content }) => {
        const workBook = XLSX.read(content, { type: 'binary', cellDates: true })
        // 读取第一个 sheet
        return XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]])
    })
}

function transformJson2Xlsx (finalDatas) {
    return finalDatas.map(({ tableName, list }) => {
        // 生成表头
        const header = Object.keys(list[0])

        // 生成字段值
        const body = []
        list.forEach((data) => {
            const dataValues = header.map((key) => {
                return (Reflect.has(data, key) ? data[key] : '')
            })
            body.push(dataValues)
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
export class DataXlsxParser {
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
