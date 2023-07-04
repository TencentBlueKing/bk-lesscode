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
    DataXlsxParser,
    StructJsonParser,
    StructSqlParser,
    StructXlsxParser,
    FIELDS_TYPES
} from './index'
import {
    uuid,
    isEmpty,
    sharedI18n,
    splitSql
} from '../util'
import {
    API_METHOD,
    API_PARAM_TYPES,
    getDefaultApiEditScheme,
    parseValue2Scheme
} from '../api'
import {
    CONDITION_TYPE,
    CONNECT_TYPE_LIST,
    ORDER_TYPE,
    ORM_KEYS,
    DATA_FILE_TYPE
} from './constant'

/**
 * 导出表结构
 * @param {*} tables 表结构
 * @param {*} fileType 打出类型  xlsx | sql
 * @param {*} name 导出文件名
 * @returns 返回导出内容 [{ name, conent }]
 */
export const generateExportStruct = (tables, fileType, name) => {
    const dataParse = new DataParse()
    const structJsonParser = new StructJsonParser(tables)
    if (fileType === DATA_FILE_TYPE.SQL) {
        const structSqlParser = new StructSqlParser()
        const content = dataParse.import(structJsonParser).export(structSqlParser)
        return [{ content, name }]
    } else {
        const structXlsxParser = new StructXlsxParser()
        const fileContents = dataParse.import(structJsonParser).export(structXlsxParser)
        return fileContents.map(({ tableName, content }) => {
            return {
                name: name || `${tableName}.xlsx`,
                content
            }
        })
    }
}

/**
 * 导出表数据
 * @param {*} datas 表数据
 * @param {*} fileType 打出类型  xlsx | sql
 * @param {*} name 导出文件名
 * @returns 返回导出内容 [{ name, conent }]
 */
export const generateExportDatas = (datas, fileType, name) => {
    const dataParse = new DataParse()
    const dataJsonParser = new DataJsonParser(datas)
    if (fileType === DATA_FILE_TYPE.SQL) {
        const dataSqlParser = new DataSqlParser()
        const content = dataParse.import(dataJsonParser).export(dataSqlParser)
        return [{ content, name }]
    } else {
        const dataXlsxParser = new DataXlsxParser()
        const fileContents = dataParse.import(dataJsonParser).export(dataXlsxParser)
        return fileContents.map(({ tableName, content }) => {
            return {
                name: name || `${tableName}.xlsx`,
                content
            }
        })
    }
}

/**
 * 导入表结构
 * @param {*} files 导入的文件
 * @param {*} fileType 文件类型
 * @returns 表结构 json
 */
export const handleImportStruct = (files, fileType) => {
    const dataParse = new DataParse()
    const structJsonParser = new StructJsonParser()
    let tableStructs = []
    if (fileType === DATA_FILE_TYPE.SQL) {
        tableStructs = dataParse
            .set(new StructSqlParser(files))
            .export(structJsonParser)
    } else {
        tableStructs = dataParse
            .set(new StructXlsxParser(files))
            .export(structJsonParser)
    }
    // 执行校验
    checkTable(tableStructs)
    return tableStructs
}

/**
 * 导入数据
 * @param {*} files 导入的文件
 * @param {*} fileType 文件类型
 * @param {*} columns 字段信息
 * @returns 数据 json or sql
 */
export const handleImportData = (files, fileType, columns) => {
    const dataParse = new DataParse()
    const dataJsonParser = new DataJsonParser()
    if (fileType === DATA_FILE_TYPE.SQL) {
        // 检测 sql 内容
        files.forEach(file => {
            const sqls = splitSql(file.content)
            if (sqls.some((sql) => !/^(\n)?(insert|update|delete) /i.test(sql))) {
                throw new Error('数据导入SQL，仅支持 INSERT、UPDATE、DELETE')
            }
        })
        // 数据导入功能由用户自己写 sql
        return files
    } else {
        const dataXlsxParser = new DataXlsxParser(files)
        return dataParse.set(dataXlsxParser).export(dataJsonParser)
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
        unique: false,
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
            normalizedItem.unique = false
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
            normalizedItem.index = false
            normalizedItem.unique = false
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
    const getName = (perfix, suffix = '') => {
        const upperCaseTableName = tableName[0].toUpperCase() + tableName.slice(1)
        return perfix + upperCaseTableName.replace(/\-(.)/g, x => (x.slice(1)).toUpperCase()) + suffix
    }
    return [
        {
            id: uuid(),
            name: getName('query'),
            url: `/api/data-source/user/tableName/${tableName}/detail`,
            method: API_METHOD.GET,
            query: [
                getDefaultApiEditScheme({
                    name: 'id',
                    value: 1,
                    type: API_PARAM_TYPES.NUMBER.VAL,
                    description: sharedI18n().t('query 参数，可以填写多个键值对，并使用 AND 关系查询具体的数据，如果匹配到多条数据，则返回第一条。key 可以填写任意字段。value 填写值，可以用 %xx% 的形式进行模糊匹配。示例：\'name\': \'xxx\' 或者 \'name\': \'%xxx%\'')
                })
            ],
            response: parseValue2Scheme({
                code: 0,
                data: dataObject,
                message: 'success'
            }),
            summary: sharedI18n().t('获取 {0} 表的某一条数据', [tableName])
        },
        {
            id: uuid(),
            name: getName('update', 'WithCondition'),
            url: `/api/data-source/user/tableName/${tableName}/update/condition`,
            method: API_METHOD.PUT,
            body: getDefaultApiEditScheme({
                name: 'root',
                type: API_PARAM_TYPES.OBJECT.VAL,
                children: [
                    parseValue2Scheme(dataObject, 'data', sharedI18n().t('填写希望更新的字段和值')),
                    parseValue2Scheme({ id: 0 }, 'where', sharedI18n().t('可以填写多个键值对，并使用 AND 关系查询匹配到的数据。key 可以填写任意字段。value 填写值，可以用 %xx% 的形式进行模糊匹配。示例：\'name\': \'xxx\' 或者 \'name\': \'%xxx%\''))
                ]
            }),
            response: parseValue2Scheme({
                code: 0,
                data: 0,
                message: 'success'
            }),
            summary: sharedI18n().t('使用 where 条件更新表的数据。注意：匹配到 where 条件的数据都会执行更新')
        },
        {
            id: uuid(),
            name: getName('get'),
            url,
            method: API_METHOD.GET,
            query: [
                getDefaultApiEditScheme({
                    name: 'page',
                    value: 1,
                    type: API_PARAM_TYPES.NUMBER.VAL,
                    description: sharedI18n().t('表示分页的页码。不传表示获取所有数据')
                }),
                getDefaultApiEditScheme({
                    name: 'pageSize',
                    value: 10,
                    type: API_PARAM_TYPES.NUMBER.VAL,
                    description: sharedI18n().t('表示分页的每页数量。不传表示获取所有数据')
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
            summary: sharedI18n().t('分页获取') + tableName + sharedI18n().t('表的数据,返回该页数据和数据总数目。注意：此接口会使用 AND 关系进行模糊匹配')
        },
        {
            id: uuid(),
            name: getName('add'),
            url,
            method: API_METHOD.POST,
            body: parseValue2Scheme(dataWithoutId),
            response: parseValue2Scheme({
                code: sharedI18n().t('状态码,-1表示接口异常'),
                data: dataObject,
                message: sharedI18n().t('接口返回的消息')
            }),
            summary: sharedI18n().t('新增') + tableName + sharedI18n().t('表的数据。注意：非空字段必填')
        },
        {
            id: uuid(),
            name: getName('update'),
            url,
            method: API_METHOD.PUT,
            body: getDefaultApiEditScheme({
                name: 'root',
                type: API_PARAM_TYPES.OBJECT.VAL,
                children: [
                    getDefaultApiEditScheme({
                        name: 'id',
                        type: API_PARAM_TYPES.NUMBER.VAL,
                        required: true
                    }),
                    ...parseValue2Scheme(dataWithoutId, 'data').children
                ]
            }),
            response: parseValue2Scheme({
                code: 0,
                data: 0,
                message: sharedI18n().t('接口返回的消息')
            }),
            summary: sharedI18n().t('更新') + tableName + sharedI18n().t('表的数据。注意：传入的数据一定要包含 id 字段')
        },
        {
            id: uuid(),
            name: getName('delete'),
            url,
            method: API_METHOD.DELETE,
            query: [
                getDefaultApiEditScheme({
                    name: 'id',
                    value: 0,
                    type: API_PARAM_TYPES.NUMBER.VAL,
                    description: sharedI18n().t('query 参数，传入 id 或者 unqiue 字段来唯一定位到要删除的数据')
                })
            ],
            response: parseValue2Scheme({
                code: 0,
                data: 0,
                message: sharedI18n().t('接口返回的消息')
            }),
            summary: sharedI18n().t('删除') + tableName + sharedI18n().t('表的数据')
        }
    ]
}

/**
 * 获取默认表字段 json
 * @param {} options 可扩展的数据
 * @returns 表字段 json
 */
export const getDefaultTableField = (options = {}) => {
    return {
        tableName: '',
        fieldId: '',
        functionName: '',
        alias: '',
        distinct: false,
        ...options
    }
}

/**
 * 获取默认表连接条件 json
 * @param {*} options 可扩展的数据
 * @returns 表连接条件 json
 */
export const getDefaultTableOn = (options = {}) => {
    return {
        left: getDefaultTableField(),
        right: getDefaultTableField(),
        type: CONDITION_TYPE.AND,
        ...options
    }
}

/**
 * 获取默认查询 table json
 * @param {*} options 可扩展的数据
 * @returns 查询 table json
 */
export const getDefaultTable = (options = {}) => {
    return {
        tableName: '',
        fields: [getDefaultTableField()],
        joinType: '',
        on: [],
        ...options
    }
}

/**
 * 获取默认连接 json
 * @param {*} options 可扩展的数据
 * @returns 查询连接 json
 */
export const getDefaultConnect = (options = {}) => {
    return {
        tableName: '',
        fieldId: '',
        expression: CONNECT_TYPE_LIST[0],
        value: '',
        param: '',
        type: CONDITION_TYPE.AND,
        ...options
    }
}

/**
 * 获取默认查询 GroupBy json
 * @param {*} options 可扩展的数据
 * @returns 查询 GroupBy json
 */
export const getDefaultGroupBy = (options = {}) => {
    return {
        fields: [getDefaultTableField()],
        having: [],
        ...options
    }
}

/**
 * 获取默认查询 OrderBy json
 * @param {*} options 可扩展的数据
 * @returns 查询 OrderBy json
 */
export const getDefaultOrderBy = (options = {}) => {
    return {
        tableName: '',
        fieldId: '',
        type: ORDER_TYPE.ASC,
        ...options
    }
}

/**
 * 获取默认的 limit
 * @param {*} options 可扩展的数据
 * @returns 默认的 limit
 */
export const getDefaultLimit = (options = {}) => {
    return {
        index: 0,
        length: 0,
        indexParam: '',
        lengthParam: '',
        ...options
    }
}

/**
 * 获取默认查询参数
 * @param {*} options 可扩展的数据
 * @returns 查询参数 Json
 */
export const getDefaultCondition = (options = {}) => {
    return {
        table: [getDefaultTable()],
        where: undefined,
        groupBy: undefined,
        orderBy: undefined,
        limit: undefined,
        ...options
    }
}

/**
 * 从列表中找到 table
 * @param {*} tableName 表名
 * @param {*} dataSourceType 表类型
 * @param {*} tableList mysql 数据表
 * @param {*} bkBaseBizList bkBase 结果表
 * @returns 表
 */
export const findTable = (tableName, dataSourceType, tableList, bkBaseBizList) => {
    let table
    if (dataSourceType === 'preview') {
        // preview 列表找到当前表
        table = tableList.find(table => table.tableName === tableName)
    } else {
        // bk-base 业务列表找到当前表
        bkBaseBizList
            .forEach((biz) => {
                const currentTable = biz.tables.find(table => table.tableName === tableName)
                if (currentTable) {
                    table = currentTable
                }
            })
    }
    return table
}

/**
 * 生成整表查询 SQL
 * @param {*} table 表
 * @returns 查询 sql
 */
export const getQueryTableSql = (table) => {
    return `SELECT ${table.columns.map(column => `\`${column.name}\``).join(', ')}\r\nFROM \`${table.tableName}\`;`
}

/**
 * 检查表是否符合规范
 */
export const checkTable = (tables) => {
    tables.forEach(({ tableName, columns }) => {
        // 表字段空检查
        if (isEmpty(columns)) {
            throw new Error(`${sharedI18n().t('表字段不能为空')}：【${tableName}】${sharedI18n().t('表缺少字段信息')}`)
        }
        // 字段信息检查
        const checkKeys = ORM_KEYS.filter(key => key !== 'columnId')
        checkKeys.forEach((key) => {
            if (!columns.find(column => Reflect.has(column, key))) {
                throw new Error(`${sharedI18n().t('表字段信息缺失')}：【${tableName}】${sharedI18n().t('表缺少')}【${key}】${sharedI18n().t('字段')}`)
            }
        })
        // 检查字段类型
        columns.forEach((column, index) => {
            if (isEmpty(column.name)) {
                throw new Error(`${sharedI18n().t('表字段类型为空')}：【${tableName}】 ${sharedI18n().t('表的第')}【${index}】${sharedI18n().t('个字段的字段类型为空')}`)
            }
            if (!FIELDS_TYPES.find(type => type.id === column.type)) {
                throw new Error(`${sharedI18n().t('不支持的表字段类型')} 【${column.type}】，${sharedI18n().t('仅支持')}【${FIELDS_TYPES.map(type => type.id).join('、')}】`)
            }
        })
    })
}
