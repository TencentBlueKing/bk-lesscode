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

/**
 * 浏览器端下载 xlsx
 * @param {string} fileName
 * @param {string} sheetName
 * @param {Array<Array<*>>} rows
 */
export async function downloadXlsxFromAoa (fileName, sheetName, rows) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName || 'Sheet1')
    worksheet.addRows(rows)
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: XLSX_MIME })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
}
