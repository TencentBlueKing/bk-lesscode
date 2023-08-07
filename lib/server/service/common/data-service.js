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
    IsNull,
    Like,
    createQueryBuilder,
    getConnection
} from 'typeorm'
import {
    getTypeByValue,
    isEmpty
} from '../../../shared/util'
import {
    DATA_TYPES
} from '../../../shared/constant'
export {
    In,
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
const files = fs.readdirSync(path.resolve(__dirname, '../../model/entities')).filter(name => name !== 'base.js')
files.forEach((name) => {
    const entityName = name.replace(/\..+/, '')
    import(`../../model/entities/${entityName}`).then(({ default: module }) => {
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
                            throw new Error(global.i18n.t('【{{n}}】字段是【json】类型，但是数据不符合json格式', { n: column.propertyName }))
                        }
                    } catch (error) {
                        throw new Error(global.i18n.t('【{{n}}】字段是【json】类型，但是数据不符合json格式', { n: column.propertyName }))
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
        if (entity === undefined) throw new Error(global.i18n.t('未查询到表名为【{{n}}】的表', { n: tableFileName }))
        return getRepository(entity, name)
    }

    return {
        /**
         * 事务操作
         * @param { add(tableFileName, list){}, update(tableFileName, list){}, delete(deleteEntityList){} } callBack 执行事务回调
         * @returns Promise
         */
        transaction (callBack) {
            return getConnection().transaction(async (transactionalEntityManager) => {
                // 提供事务的基本操作。需要结合其他 dataService 来完成整个事务操作
                const transactionalEntityHelper = {
                    /**
                     * 新增数据
                     * @param {*} tableFileName 需要插入的表名
                     * @param {*} list 新数据列表
                     */
                    add (tableFileName, list) {
                        const repository = getRepositoryByName(tableFileName)
                        const newList = repository.create(transformData(list, repository.metadata.columns))
                        return transactionalEntityManager.save(newList)
                    },
                    /**
                     * 更新数据
                     * @param {*} tableFileName 需要更新的表名
                     * @param {*} updateData 需更新的数据
                     */
                    async update (tableFileName, updateData) {
                        const repository = getRepositoryByName(tableFileName)
                        const editData = await repository.findOne({ where: { id: updateData.id } })
                        if (editData === undefined) {
                            throw new Error(global.i18n.t('更新 {{0}} 表数据的时候，未找到 id 为 【{{1}}】的数据，请检查数据后重试', [tableFileName, updateData.id]))
                        }
                        for (const key in editData) {
                            if (Reflect.has(editData, key) && Reflect.has(updateData, key)) {
                                editData[key] = updateData[key]
                            }
                        }
                        editData.updateTime = new Date()
                        return transactionalEntityManager.save(transformData(editData, repository.metadata.columns))
                    },
                    /**
                     * 删除数据
                     * @param {*} deleteEntityList 需删除的 EntityList
                     */
                    delete (deleteEntityList) {
                        return transactionalEntityManager.remove(deleteEntityList)
                    },
                    /**
                     * 软删除数据
                     * @param {*} deleteEntityList 需删除的 EntityList
                     */
                    softDelete (deleteEntityList) {
                        deleteEntityList.forEach((deleteEntity) => {
                            deleteEntity.deleteFlag = 0
                        })
                        return transactionalEntityManager.save(deleteEntityList)
                    }
                }
                return callBack(transactionalEntityHelper)
            })
        },

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
         * 判断是否存在某条数据
         * @param {*} tableFileName 表名
         * @param {*} query 查询参数
         * @returns BOOLEAN 是否存在该数据
         */
        async has (tableFileName, query = { deleteFlag: 0 }) {
            const repository = getRepositoryByName(tableFileName)
            const count = await repository.count(transformQuery(query))
            return count > 0
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
         * 分页的方式获取数据列表
         * @param {*} tableFileName 表名
         * @param {*} page 页码
         * @param {*} pageSize 每页数量
         * @param {*} query 查询参数
         * @param {*} order 排序，传入：{ updateTime: 'DESC' }
         * @returns 数据列表 & 总数
         */
        async get ({
            tableFileName,
            page,
            pageSize,
            query = { deleteFlag: 0 },
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
            // console.log('queryObjectqueryObject', JSON.stringify(queryObject))
            const [list, count] = await repository.findAndCount(queryObject)
            return { list, count }
        },

        /**
         * 获取数据详情
         * @param {*} tableFileName 表模型的文件名
         * @param {*} query 查询参数
         * @returns 获取数据详情结果
         */
        findOne (tableFileName, query = { deleteFlag: 0 }) {
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
            if (!Reflect.has(data, 'id')) throw new Error(global.i18n.t('更新 {{n}} 表数据的时候，传入的数据包需要包含 id 字段', { n: tableFileName }))

            const repository = getRepositoryByName(tableFileName)
            const editData = await repository.findOne({ where: { id: data.id } })
            if (editData === undefined) {
                throw new Error(global.i18n.t('更新 {{0}} 表数据的时候，未找到 id 为 【{{1}}】的数据，请检查数据后重试', [tableFileName, data.id]))
            }
            for (const key in editData) {
                if (Reflect.has(editData, key) && Reflect.has(data, key)) {
                    editData[key] = data[key]
                }
            }
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
            if ([undefined, null].includes(dataList)) throw new Error(global.i18n.t('批量更新 {{n}} 表数据的时候，需要传入 dataList 参数', { n: tableFileName }))

            const repository = getRepositoryByName(tableFileName)
            const ids = dataList.map(data => data.id)
            if (ids.length <= 0) throw new Error(global.i18n.t('批量更新 {{n}} 表数据的时候，传入的数据包需要包含 id 字段', { n: tableFileName }))

            const editDataList = await repository.find({ where: { id: In(ids) } })
            editDataList.forEach((editData) => {
                const newData = dataList.find(data => +data.id === +editData.id)
                for (const key in editData) {
                    if (Reflect.has(editData, key) && Reflect.has(newData, key)) {
                        editData[key] = newData[key]
                    }
                }
            })
            if (editDataList.length <= 0) throw new Error(global.i18n.t('批量更新 {{0}} 表数据的时候，未找到 id 为 【{{1}}】的数据，请检查数据后重试', [tableFileName, ids.join(',')]))

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
         * @param {*} data 删除的 data { name: 'xx' } | id
         * @returns 删除数量
         */
        async delete (tableFileName, data) {
            // 不能传空
            if ([undefined, null, ''].includes(data)) {
                throw new Error(global.i18n.t('删除 {{n}} 表数据的时候，不能传入空数据', { n: tableFileName }))
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
         * @param {*} datas 删除的 [{ key: value }] || ids
         * @returns 删除数量
         */
        async bulkDelete (tableFileName, datas) {
            if (isEmpty(datas)) throw new Error(global.i18n.t('删除 {{n}} 表数据的时候，不能传入空数据', { n: tableFileName }))
            const repository = getRepositoryByName(tableFileName)
            try {
                const { affected = 0 } = await repository.delete(datas)
                return affected
            } catch (error) {
                throw new Error(error.sqlMessage || error)
            }
        },

        /**
         * 软删除
         * @param {*} tableFileName 表模型的文件名
         * @param {*} id 删除的 id
         * @returns 删除结果
         */
        async softDelete (tableFileName, id) {
            const repository = getRepositoryByName(tableFileName)
            const deleteData = await repository.findOne({ where: { id } })
            deleteData.deleteFlag = 1
            return repository.save(deleteData)
        },

        /**
         * 批量软删除
         * @param {*} tableFileName 表模型的文件名
         * @param {*} ids 删除的 ids
         * @returns 删除结果
         */
        async bulkSoftDelete (tableFileName, ids) {
            const repository = getRepositoryByName(tableFileName)
            const deleteDataList = await repository.find({ where: { id: In(ids) } })
            deleteDataList.forEach(deleteData => (deleteData.deleteFlag = 1))
            return repository.save(deleteDataList)
        },

        /**
         * 获取表 Metadata
         * @param {*} tableFileName 表名
         * @returns 表 Metadata
         */
        getTableMetadata (tableFileName) {
            const repository = getRepositoryByName(tableFileName)
            return repository.metadata
        }
    }
}

// 导出 lesscode 的 orm 快捷操作
export const LCDataService = getDataService()

// 导出 lesscode 的表
export const TABLE_FILE_NAME = {
    COMP_CATEGORY: 'comp-category',
    COMP_FAVOURITE: 'comp-favourite',
    COMP_SHARE: 'comp-share',
    COMP: 'comp',
    DATA_TABLE_MODIFY_RECORD: 'data-table-modify-record',
    DATA_TABLE: 'data-table',
    FUNC_FUNC: 'func-func',
    FUNC_GROUP: 'func-group',
    FUNC_MARKET: 'func-market',
    FUNC_VARIABLE: 'func-variable',
    FUNC: 'func',
    LAYOUT_INST: 'layout-inst',
    LAYOUT: 'layout',
    OPERATE_LOG: 'operate-log',
    PAGE_COMP: 'page-comp',
    PAGE_FUNC: 'page-func',
    PAGE_ROUTE: 'page-route',
    PAGE_TEMPLATE_CATEGORY: 'page-template-category',
    PAGE_TEMPLATE: 'page-template',
    PAGE_VARIABLE: 'page-variable',
    PAGE: 'page',
    PERM: 'perm',
    PLATFORM_ADMIN: 'platform-admin',
    PREVIEW_DB: 'preview-db',
    PROJECT: 'project',
    PROJECT_COMP: 'project-comp',
    PROJECT_FAVOURITE: 'project-favourite',
    PROJECT_FUNC_GROUP: 'project-func-group',
    PROJECT_FUNC_MARKET: 'project-func-market',
    PROJECT_PAGE: 'project-page',
    PROJECT_VERSION: 'project-version',
    ROLE_PERM: 'role-perm',
    ROLE: 'role',
    ROUTE: 'route',
    TOKEN: 'token',
    USER_PROJECT_ROLE: 'user-project-role',
    USER: 'user',
    VARIABLE_FUNC: 'variable-func',
    VARIABLE_VARIABLE: 'variable-variable',
    VARIABLE: 'variable',
    VERSION: 'version',
    FORM: 'form',
    FLOW: 'flow',
    API: 'api',
    API_CATEGORY: 'api-category',
    FILE: 'file',
    FUNC_API: 'func-api',
    QUERY_RECORD: 'query-record',
    IAM_APP_PERM_ACTION: 'iam-app-perm-action',
    WHITE_LIST: 'white-list'
}
