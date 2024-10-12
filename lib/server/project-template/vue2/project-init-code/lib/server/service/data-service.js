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

/**
 * 所有model的增删改查操作服务
 * 部分业务需要进一步处理的，可以在model里面新增文件处理，也可以在这个基础上做数据处理
 * 请勿在此处添加特定业务
 */
import {
    getRepository,
    In,
    Like,
    IsNull,
    createQueryBuilder,
    getManager
} from 'typeorm'
import {
    getTypeByValue,
    isEmpty
} from '../../shared/util'
import {
    DATA_TYPES
} from '../../shared/constant'
import {
    splitSql
} from '../util'
export {
    Like,
    Between,
    LessThan,
    LessThanOrEqual,
    MoreThan,
    MoreThanOrEqual
} from 'typeorm'
const fs = require('fs')
const path = require('path')

// get all entity
const entityMap = {}
const files = fs.readdirSync(path.resolve(__dirname, '../model/entities')).filter(name => name !== 'base.js')
files.forEach((name) => {
    const entityName = name.replace(/\..+/, '')
    import(`../model/entities/${entityName}`).then(({ default: module }) => {
        entityMap[entityName] = module
    })
})

/**
 * 修改查询参数为typeorm需要的结构
 * @param {Object} query 查询参数
 */
function transformQuery (query) {
    return Object.keys(query).reduce((acc, key) => {
        const value = query[key]
        const type = Object.prototype.toString.call(value)
        switch (type) {
            case '[object Array]':
                acc[key] = In(value)
                break
            case '[object Undefined]':
            case '[object Null]':
                acc[key] = IsNull()
                break
            case '[object String]':
                if (/^%.+%$/.test(value)) {
                    acc[key] = Like(value)
                } else {
                    acc[key] = value
                }
                break
            default:
                acc[key] = value
                break
        }
        return acc
    }, {})
}

/**
 * 数据入库前基于类型做一次格式化
 * @param {*} data 数据
 * @param {*} columns 字段集合
 */
function transformData (data, columns) {
    const transferList = Array.isArray(data) ? data : [data]
    columns.forEach((column) => {
        if (['datetime', 'date'].includes(column.type)) {
            // 空字符串时间改成null
            transferList.forEach((transferItem) => {
                if (transferItem[column.propertyName] === '') {
                    transferItem[column.propertyName] = null
                }
            })
        }
        if (column.type === 'json') {
            // 校验json格式，错误数据不允许入库
            transferList.forEach((transferItem) => {
                if ([null, undefined, ''].includes(transferItem[column.propertyName])) {
                    transferItem[column.propertyName] = null
                } else {
                    try {
                        // 本身是 object 或者是 array 类型可以入库
                        const valueType = getTypeByValue(transferItem[column.propertyName])
                        const isObjectOrArray = [DATA_TYPES.OBJECT.VAL, DATA_TYPES.ARRAY.VAL].includes(valueType)
                        let isJsonValue = false
                        // 本身是 objet 或者 array 的 json string 可以入库
                        if (valueType === DATA_TYPES.STRING.VAL) {
                            const parsedVal = JSON.parse(transferItem[column.propertyName])
                            const parsedType = getTypeByValue(parsedVal)
                            isJsonValue = [DATA_TYPES.OBJECT.VAL, DATA_TYPES.ARRAY.VAL].includes(parsedType)
                        }
                        if (!isObjectOrArray && !isJsonValue) {
                            throw new Error(`【${column.propertyName}】字段是【json】类型，但是数据不符合json格式`)
                        }
                    } catch (error) {
                        throw new Error(`【${column.propertyName}】字段是【json】类型，但是数据不符合json格式`)
                    }
                }
            })
        }
    })
    return Array.isArray(data) ? transferList : transferList[0]
}

/**
 * 基于 metadata 返回 unique 字段的名字
 * @param {*} metaData 表元数据
 * @returns unique 字段的名字
 */
function getUniqueColumnNames (metaData) {
    return metaData.indices.reduce((acc, cur) => {
        if (cur.isUnique) {
            acc.push(...cur.givenColumnNames)
        }
        return acc
    }, ['id'])
}

/**
 * 获取 DB ORM 的快捷操作
 * @param {*} name orm 连接名，默认值 default，既使用lesscode的db连接
 * @param {*} customEntityMap orm entity map，用于快速查找entity，不传就使用lesscode的entity
 * @returns dataService
 */
export function getDataService (name = 'default', customEntityMap) {
    function getRepositoryByName (tableFileName) {
        const sourceMap = customEntityMap || entityMap
        const entity = sourceMap[tableFileName]
        if (entity === undefined) throw new Error(`未查询到表名为【${tableFileName}】的表`)
        return getRepository(entity, name)
    }

    return {
        /**
         * leftJoin 的方式多表联查
         * @param { String } tableName 主表名
         * @param { Array } leftJoins 联查信息，传入：[{ tableName: 'xxx', on: 'xxx.id = tableName.id' }]
         * @param { Array } query 查询条件，传入：{ express: 'xxx.id = :id AND xxx.name = :name', data: { id: 1, name: 'xxx' } }
         * @param { Object } pageData 分页，传入：{ page, pageSize }
         * @returns 数据列表和总数
         */
        leftJoinQuery (tableName, leftJoins, query, pageData) {
            const queryBuilder = createQueryBuilder(tableName)
            // left join
            leftJoins?.forEach((leftJoin) => {
                queryBuilder.leftJoinAndSelect(leftJoin.tableName, leftJoin.tableName, leftJoin.on)
            })
            // 添加查询条件
            if (query) {
                queryBuilder.where(query.express, transformQuery(query.data))
            }
            // 添加分页
            if (pageData) {
                const { page, pageSize } = pageData
                queryBuilder
                    .skip((page - 1) * pageSize)
                    .take(pageSize)
            }
            return queryBuilder.getManyAndCount()
        },

        /**
         * 分页的方式获取数据列表
         * @param {*} tableFileName 表名
         * @param {*} page 页码
         * @param {*} pageSize 每页数量
         * @param {*} query 查询参数
         * @param {*} like 模糊搜索，传入：{ name: 'jack', middleName: 'tom' }
         * @param {*} order 排序，传入：{ updateTime: 'DESC' }
         * @returns 数据列表 & 总数
         */
        async get ({
            tableFileName,
            page,
            pageSize,
            query = { deleteFlag: 0 },
            like,
            order = { updateTime: 'DESC' }
        }) {
            const repository = getRepositoryByName(tableFileName)
            const queryObject = {
                where: Array.isArray(query) ? query.map(transformQuery) : transformQuery(query)
            }
            // 分页
            if (page && pageSize) {
                queryObject.skip = (page - 1) * pageSize
                queryObject.take = pageSize
            }
            // 排序
            if (order) {
                queryObject.order = {}
                const orderKeys = Object.keys(order)
                orderKeys.forEach((key) => {
                    queryObject.order[key] = order[key]
                })
            }
            // 模糊搜索
            if (like) {
                const likeKeys = Object.keys(like)
                likeKeys.forEach((key) => {
                    queryObject.where[key] = Like(`%${like[key]}%`)
                })
            }

            const [list, count] = await repository.findAndCount(queryObject)
            return { list, count }
        },
        /**
         * 获取数量
         * @param {*} tableFileName 表名
         * @param {*} query 查询参数
         * @returns Number 数量
         */
        count (tableFileName, query = { deleteFlag: 0 }) {
            const repository = getRepositoryByName(tableFileName)
            return repository.count(transformQuery(query))
        },
        /**
         * 获取数据详情
         * @param {*} tableFileName 表模型的文件名
         * @param {*} query 查询参数
         * @returns 获取数据详情结果
         */
        findOne (tableFileName, query = {}) {
            const repository = getRepositoryByName(tableFileName)
            return repository.findOne(transformQuery(query)) || {}
        },

        /**
         * 添加
         * @param {*} tableFileName 表模型的文件名
         * @param {*} data 新增数据
         * @returns 新增结果
         */
        async add (tableFileName, data) {
            const repository = getRepositoryByName(tableFileName)
            const newData = repository.create(transformData(data, repository.metadata.columns))
            try {
                const { generatedMaps = [] } = await repository.insert(newData)
                return generatedMaps[0]
            } catch (error) {
                throw new Error(error.sqlMessage || error)
            }
        },

        /**
         * 批量添加
         * @param {*} tableFileName 表模型的文件名
         * @param {*} dataList 新增数据列表
         * @returns 新增结果
         */
        async bulkAdd (tableFileName, dataList) {
            const repository = getRepositoryByName(tableFileName)
            const newDataList = repository.create(transformData(dataList, repository.metadata.columns))
            try {
                const { generatedMaps = [] } = await repository.insert(newDataList)
                return generatedMaps
            } catch (error) {
                throw new Error(error.sqlMessage || error)
            }
        },

        /**
         * 使用 where 条件更新数据
         * @param {*} tableFileName 表模型的文件名
         * @param {*} data 数据
         * @param {*} where 条件
         * @returns 影响的行数
         */
        async updateWithCondition (tableFileName, data, where) {
            const repository = getRepositoryByName(tableFileName)
            try {
                const { id, ...rest } = data
                const { affected = 0 } = await repository.update(transformQuery(where), transformData(rest, repository.metadata.columns))
                return affected
            } catch (error) {
                throw new Error(error.sqlMessage || error)
            }
        },

        /**
         * 更新
         * @param {*} tableFileName 表模型的文件名
         * @param {*} data 更新数据
         * @returns 更新影响条数
         */
        async update (tableFileName, data) {
            if (!Reflect.has(data, 'id')) throw new Error(`更新 ${tableFileName} 表数据的时候，传入的数据包需要包含 id 字段`)

            const repository = getRepositoryByName(tableFileName)
            const editData = await repository.findOne({ where: { id: data.id } })
            if (editData === undefined) {
                throw new Error(`更新 ${tableFileName} 表数据的时候，未找到 id 为 【${data.id}】的数据，请检查数据后重试`)
            }

            Object.assign(editData, data)
            try {
                const { affected = 0 } = await repository.update(data.id, transformData(editData, repository.metadata.columns))
                return affected
            } catch (error) {
                throw new Error(error.sqlMessage || error)
            }
        },

        /**
         * 批量更新
         * @param {*} tableFileName 表模型的文件名
         * @param {*} dataList 更新数据列表
         * @returns 更新影响条数
         */
        async bulkUpdate (tableFileName, dataList) {
            if ([undefined, null].includes(dataList)) throw new Error(`批量更新 ${tableFileName} 表数据的时候，需要传入 dataList 参数`)

            const repository = getRepositoryByName(tableFileName)
            const ids = dataList.map(data => data.id)
            if (ids.length <= 0) throw new Error(`批量更新 ${tableFileName} 表数据的时候，传入的数据包需要包含 id 字段`)

            const editDataList = await repository.find({ where: { id: In(ids) } })
            editDataList.forEach((editData) => {
                const newData = dataList.find(data => +data.id === +editData.id)
                Object.assign(editData, newData)
            })
            if (editDataList.length <= 0) throw new Error(`批量更新 ${tableFileName} 表数据的时候，未找到 id 为 【${ids.join(',')}】的数据，请检查数据后重试`)

            try {
                const transformList = transformData(editDataList, repository.metadata.columns)
                const updateResult = await Promise.all(transformList.map((data) => repository.update(data.id, data)))
                return updateResult.reduce((acc, { affected }) => {
                    acc += affected
                    return acc
                }, 0)
            } catch (error) {
                throw new Error(error.sqlMessage || error)
            }
        },

        /**
         * 硬删除
         * @param {*} tableFileName 表模型的文件名
         * @param {*} data 删除的data
         * @returns 删除数量
         */
        async delete (tableFileName, data) {
            // 不能传空
            if ([undefined, null, ''].includes(data)) {
                throw new Error(`删除 ${tableFileName} 表数据的时候，不能传入空数据`)
            }
            const repository = getRepositoryByName(tableFileName)
            const uniqueKeys = getUniqueColumnNames(repository.metadata)
            // 删除需要使用 unique 字段
            if (typeof data === 'object' && !uniqueKeys.some(key => !isEmpty(data[key]))) {
                throw new Error(global.i18n.t('删除 {{n}} 表数据的时候，需要使用 unique 或者 id 字段保证删除数据唯一', { n: tableFileName }))
            }
            try {
                const { affected = 0 } = await repository.delete(data)
                return affected
            } catch (error) {
                throw new Error(error.sqlMessage || error)
            }
        },

        /**
         * 批量硬删除
         * @param {*} tableFileName 表模型的文件名
         * @param {*} ids 删除的 ids
         * @returns 删除数量
         */
        async bulkDelete (tableFileName, ids) {
            if ([undefined, null].includes(ids)) throw new Error(`批量删除 ${tableFileName} 表数据的时候，需要传入 ids 参数`)
            const repository = getRepositoryByName(tableFileName)
            try {
                const { affected = 0 } = await repository.delete(ids)
                return affected
            } catch (error) {
                throw new Error(error.sqlMessage || error)
            }
        },

        /**
         * 获取表 Metadata
         * @param {*} tableFileName 表名
         * @returns 表 Metadata
         */
        getTableMetadata (tableFileName) {
            const repository = getRepositoryByName(tableFileName)
            return repository.metadata
        },

        /**
         * 执行sql
         * @param {*} sqls sql语句
         */
        async execMultSql (sqls) {
            const manager = getManager(name)
            const sqlArr = splitSql(sqls)
            const res = []
            for (const sql of sqlArr) {
                const execResult = await manager.query(sql)
                if (execResult) {
                    res.push(execResult)
                }
            }
            return res
        },

        /**
         * 执行sql
         * @param {*} sqls sql语句
         */
        async execSql (sql) {
            const manager = getManager(name)
            const res = await manager.query(sql)
            return res
        }
    }
}

// 默认导出lesscode的orm快捷操作
export default getDataService()
