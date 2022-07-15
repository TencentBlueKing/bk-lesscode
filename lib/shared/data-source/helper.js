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
    DataParse,
    DataJsonParser,
    DataSqlParser,
    DataCsvParser,
    StructJsonParser,
    StructSqlParser,
    StructCsvParser,
    FIELDS_TYPES
} from './index'
import {
    uuid
} from '../util'
import {
    API_METHOD,
    API_PARAM_TYPES,
    getDefaultApiEditScheme,
    parseValue2Scheme
} from '../api'

/**
 * 导出表结构
 * @param {*} tables 表结构
 * @param {*} fileType 打出类型  csv | sql
 * @param {*} name 导出文件名
 * @returns 返回导出内容 [{ name, conent }]
 */
export const generateExportStruct = (tables, fileType, name) => {
    const dataParse = new DataParse()
    const structJsonParser = new StructJsonParser(tables)
    if (fileType === 'sql') {
        const structSqlParser = new StructSqlParser()
        const content = dataParse.import(structJsonParser).export(structSqlParser)
        return [{ content, name }]
    } else {
        const structCsvParser = new StructCsvParser()
        const fileContents = dataParse.import(structJsonParser).export(structCsvParser)
        return fileContents.map(({ tableName, content }) => {
            return {
                name: name || `${tableName}.csv`,
                content
            }
        })
    }
}

/**
 * 导出表数据
 * @param {*} datas 表数据
 * @param {*} fileType 打出类型  csv | sql
 * @param {*} name 导出文件名
 * @returns 返回导出内容 [{ name, conent }]
 */
export const generateExportDatas = (datas, fileType, name) => {
    const dataParse = new DataParse()
    const dataJsonParser = new DataJsonParser(datas)
    if (fileType === 'sql') {
        const dataSqlParser = new DataSqlParser()
        const content = dataParse.import(dataJsonParser).export(dataSqlParser)
        return [{ content, name }]
    } else {
        const dataCsvParser = new DataCsvParser()
        const fileContents = dataParse.import(dataJsonParser).export(dataCsvParser)
        return fileContents.map(({ tableName, content }) => {
            return {
                name: name || `${tableName}.csv`,
                content
            }
        })
    }
}

/**
 * 获取数据源单个字段默认 json
 * @returns 数据源单个字段 json
 */
export const getDefaultJson = () => {
    return {
        type: '',
        name: '',
        primary: false,
        index: false,
        nullable: false,
        default: '',
        comment: '',
        generated: false,
        createDate: false,
        updateDate: false,
        length: '',
        scale: ''
    }
}

/**
 * 标准化 json
 * @param item 单个字段json
 * @returns 添加完默认值后的标准化单个字段json
 */
export const normalizeJson = (item) => {
    const defaultRow = getDefaultJson()
    const normalizedItem = Object.assign({}, defaultRow, item)
    // 由于mysql限制，部分字段不可修改，需要设置默认值
    switch (normalizedItem.type) {
        case 'int':
            normalizedItem.length = 11
            normalizedItem.scale = 0
            break
        case 'varchar':
            normalizedItem.scale = 0
            break
        case 'text':
            normalizedItem.scale = 0
            normalizedItem.length = 65535
            normalizedItem.index = false
            break
        case 'date':
        case 'datetime':
            normalizedItem.scale = 0
            normalizedItem.length = 0
            normalizedItem.default = ''
            break
        case 'json':
            normalizedItem.scale = 0
            normalizedItem.length = 1024 * 1024 * 1024
            break
        default:
            break
    }
    // 每一行加id，用于 diff
    if (!Reflect.has(normalizedItem, 'columnId')) {
        normalizedItem.columnId = uuid(8)
    }
    return normalizedItem
}

/**
 * 获取 数据表 接口列表
 * @param {*} tableName 表名
 * @param {*} columns 字段列表
 */
export const getDataSourceApiList = (tableName, columns) => {
    const url = `/api/data-source/user/tableName/${tableName}`
    const dataObject = columns.reduce((acc, cur) => {
        const FIELDS_TYPE = FIELDS_TYPES.find(FIELDS_TYPE => FIELDS_TYPE.id === cur.type)
        acc[cur.name] = FIELDS_TYPE.defaultValue
        return acc
    }, {})
    const { id, ...dataWithoutId } = dataObject
    const getName = (perfix) => {
        const upperCaseTableName = tableName[0].toUpperCase() + tableName.slice(1)
        return perfix + upperCaseTableName.replace(/\-(.)/g, x => (x.slice(1)).toUpperCase())
    }
    return [
        {
            id: 'query',
            name: getName('query'),
            url: `/api/data-source/user/tableName/${tableName}/detail`,
            method: API_METHOD.GET,
            query: [
                getDefaultApiEditScheme({
                    name: 'id',
                    value: 1,
                    type: API_PARAM_TYPES.NUMBER.VAL,
                    description: '查询表某个具体数据'
                })
            ],
            response: parseValue2Scheme({
                code: 0,
                data: dataObject,
                message: 'success'
            }),
            summary: '根据 id 查询某条数据详情'
        },
        {
            id: 'get',
            name: getName('get'),
            url,
            method: API_METHOD.GET,
            query: [
                getDefaultApiEditScheme({
                    name: 'page',
                    value: 1,
                    type: API_PARAM_TYPES.NUMBER.VAL,
                    description: '表示分页的页码。不传表示获取所有数据'
                }),
                getDefaultApiEditScheme({
                    name: 'pageSize',
                    value: 10,
                    type: API_PARAM_TYPES.NUMBER.VAL,
                    description: '表示分页的每页数量。不传表示获取所有数据'
                })
            ],
            response: parseValue2Scheme({
                code: 0,
                data: {
                    list: [dataObject],
                    count: 10
                },
                message: 'success'
            }),
            summary: `分页获取 ${tableName} 表的数据,返回该页数据和数据总数目`
        },
        {
            id: 'add',
            name: getName('add'),
            url,
            method: API_METHOD.POST,
            body: parseValue2Scheme(dataWithoutId),
            response: parseValue2Scheme({
                code: '状态码,-1表示接口异常',
                data: dataObject,
                message: '接口返回的消息'
            }),
            summary: `新增 ${tableName} 表的数据。注意：非空字段必填`
        },
        {
            id: 'update',
            name: getName('update'),
            url,
            method: API_METHOD.PUT,
            body: parseValue2Scheme(dataObject),
            response: parseValue2Scheme({
                code: 0,
                data: 0,
                message: '接口返回的消息'
            }),
            summary: `更新 ${tableName} 表的数据。注意：传入的数据一定要包含 id 字段`
        },
        {
            id: 'delete',
            name: getName('delete'),
            url,
            method: API_METHOD.DELETE,
            query: [
                getDefaultApiEditScheme({
                    name: 'id',
                    value: 0,
                    type: API_PARAM_TYPES.NUMBER.VAL,
                    required: true,
                    description: '删除数据的 id 字段'
                })
            ],
            response: parseValue2Scheme({
                code: 0,
                data: 0,
                message: '接口返回的消息'
            }),
            summary: `删除 ${tableName} 表的数据`
        }
    ]
}
