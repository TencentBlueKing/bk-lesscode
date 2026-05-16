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
import { getTypeByValue } from '../../../util'
import { DATA_TYPES } from '../../../constant'

/**
 * xlsx 转 json
 * @param {*} xlsxs xlsx 文件
 * @returns 数据 json
 */
async function transformXlsx2Json (xlsxs) {
    const result = []
    for (const { content } of xlsxs) {
        result.push(await parseFirstSheetToJson(content, { raw: false, cellDates: true }))
    }
    return result
}

async function transformJson2Xlsx (finalDatas) {
    const result = []
    for (const { tableName, list } of finalDatas) {
        const header = Object.keys(list[0])
        const body = []
        list.forEach((data) => {
            const dataValues = header.map((key) => {
                const value = Reflect.has(data, key) ? data[key] : ''
                if (getTypeByValue(value) === DATA_TYPES.OBJECT.VAL) {
                    return JSON.stringify(value)
                }
                return value
            })
            body.push(dataValues)
        })
        const content = await buildXlsxBufferFromAoa(tableName, [header, ...body])
        result.push({ tableName, content })
    }
    return result
}

/**
 * xlsx 操作
 */
export class DataXlsxParser {
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
