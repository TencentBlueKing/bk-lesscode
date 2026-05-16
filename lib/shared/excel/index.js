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
import ExcelJS from 'exceljs'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function binaryStringToUint8Array (content) {
    const bytes = new Uint8Array(content.length)
    for (let i = 0; i < content.length; i++) {
        bytes[i] = content.charCodeAt(i) & 0xff
    }
    return bytes
}

function normalizeLoadInput (content) {
    if (typeof content === 'string') {
        return binaryStringToUint8Array(content)
    }
    return content
}

function getCellValue (cell, { raw = false } = {}) {
    if (!cell) {
        return ''
    }
    const { value } = cell
    if (value === null || value === undefined) {
        return ''
    }
    if (!raw) {
        if (cell.text !== undefined && cell.text !== null && cell.text !== '') {
            return cell.text
        }
        if (value instanceof Date) {
            return value
        }
        if (typeof value === 'object') {
            if (value.text !== undefined) {
                return value.text
            }
            if (value.result !== undefined) {
                return value.result
            }
            if (value.richText) {
                return value.richText.map(item => item.text).join('')
            }
        }
        return value
    }
    if (typeof value === 'object' && value.result !== undefined) {
        return value.result
    }
    return value
}

/**
 * 解析 xlsx 第一个 sheet 为对象数组（首行作为表头）
 * @param {string|ArrayBuffer|Uint8Array} content
 * @param {{ raw?: boolean, cellDates?: boolean }} options
 */
export async function parseFirstSheetToJson (content, options = {}) {
    const { raw = false } = options
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(normalizeLoadInput(content))
    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
        return []
    }

    const headerMap = {}
    const headerRow = worksheet.getRow(1)
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = getCellValue(cell, { raw })
        if (header !== '' && header !== undefined && header !== null) {
            headerMap[colNumber] = header
        }
    })

    const result = []
    const rowCount = worksheet.rowCount
    for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber)
        const record = {}
        let hasValue = false
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const key = headerMap[colNumber]
            if (key === undefined) {
                return
            }
            const cellValue = getCellValue(cell, { raw })
            if (cellValue !== '' && cellValue !== undefined && cellValue !== null) {
                hasValue = true
            }
            record[key] = cellValue
        })
        if (hasValue) {
            result.push(record)
        }
    }
    return result
}

/**
 * 由二维数组生成 xlsx Buffer
 * @param {string} sheetName
 * @param {Array<Array<*>>} rows
 */
export async function buildXlsxBufferFromAoa (sheetName, rows) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName || 'Sheet1')
    worksheet.addRows(rows)
    return workbook.xlsx.writeBuffer()
}

/**
 * 浏览器端下载 xlsx
 * @param {string} fileName
 * @param {string} sheetName
 * @param {Array<Array<*>>} rows
 */
export async function downloadXlsxFromAoa (fileName, sheetName, rows) {
    const buffer = await buildXlsxBufferFromAoa(sheetName, rows)
    const blob = new Blob([buffer], { type: XLSX_MIME })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
}
