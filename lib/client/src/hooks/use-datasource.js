import store from '@/store'
import {
    DATA_SOURCE_TYPE
} from 'shared/data-source'

export default () => {
    /**
     * 获取 mysql 数据表
     * @param {*} projectId 项目 id
     * @returns 数据列表
     */
    const getMysqlTables = (projectId) => {
        return store
            .dispatch('dataSource/list', { projectId, dataSourceType: DATA_SOURCE_TYPE.PREVIEW })
            .then(({ list }) => {
                return list
            })
    }

    /**
     * 获取 bk-base bizs
     * @param {*} projectId 项目 id
     * @returns bizs 列表
     */
    const getBkBaseBizs = (projectId) => {
        return store
            .dispatch('dataSource/list', { projectId, dataSourceType: DATA_SOURCE_TYPE.BK_BASE })
            .then(({ list }) => {
                return list
            })
    }

    /**
     * 获取 bk-base tables
     * @param {*} bkBizId bizid
     * @returns tables 列表
     */
    const getBkBaseTables = (bkBizId) => {
        return store
            .dispatch('dataSource/getBkBaseTables', bkBizId)
            .then((data) => {
                return data?.list || []
            })
    }

    /**
     * 获取表数据
     * @param {*} tableName 表名
     * @param {*} bkDataSourceType 表类型
     */
    const getTableDatas = (tableName, bkDataSourceType, thirdPartDBName) => {
        return store
            .dispatch('dataSource/getTableDatas', {
                tableName,
                bkDataSourceType,
                thirdPartDBName
            })
    }

    /**
     * 获取表信息
     * @param {*} projectId 项目 id
     * @param {*} tableName 表名
     * @param {*} dataSourceType 表类型
     * @returns 表信息
     */
    const getTable = (projectId, tableName, dataSourceType, thirdPartDBName) => {
        return new Promise((resolve, reject) => {
            if (DATA_SOURCE_TYPE.PREVIEW === dataSourceType) {
                return getMysqlTables(projectId).then((list) => {
                    resolve(list.find(table => table.tableName === tableName))
                })
            } else if (DATA_SOURCE_TYPE.THIRD_PART === dataSourceType) {
                return getAllThirdPartDBTables(projectId).then((list) => {
                    const db = list.find(item => item.dbName === thirdPartDBName)
                    resolve(db.tableList.find(table => table.tableName === tableName))
                })
            } else {
                return getBkBaseBizs(projectId).then(async (bizs) => {
                    for (let index = 0; index < bizs.length; index++) {
                        const biz = bizs[index]
                        await getBkBaseTables(biz.bkBizId).then((list) => {
                            const table = list.find(table => table.tableName === tableName)
                            if (table) {
                                resolve(table)
                            }
                        })
                    }
                    reject(new Error(`没有找到表: ${tableName}`))
                })
            }
        })
    }

    /**
     * 获取所有的第三方数据源的表和db信息
     * @param {*} projectId 项目 id
     */
    const getAllThirdPartDBTables = (projectId) => {
        return store
            .dispatch('thirdPartDB/getAllDBTables', {
                projectId
            })
    }

    /**
     * 获取第三方数据源的表列表
     * @param {*} projectId 项目 id
     * @param {*} thirdPartDBId 第三方db id
     */
    const getThirdPartDBTables = (projectId, thirdPartDBId) => {
        return store
            .dispatch(
                'dataSource/list',
                {
                    projectId,
                    thirdPartDBId,
                    dataSourceType: DATA_SOURCE_TYPE.THIRD_PART
                }
            )
            .then(({ list }) => {
                return list
            })
    }

    return {
        getMysqlTables,
        getBkBaseBizs,
        getBkBaseTables,
        getTableDatas,
        getTable,
        getAllThirdPartDBTables,
        getThirdPartDBTables
    }
}
