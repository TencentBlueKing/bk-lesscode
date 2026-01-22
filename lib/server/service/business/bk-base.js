import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import httpConf from '../../conf/http'
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'
import {
    generateToken
} from './token'
import { escapeIdentifier } from '../../../shared/security/sql-protection'

const getProjectInfo = async (projectId, bkTicket) => {
    const projectInfo = await LCDataService.findOne(
        TABLE_FILE_NAME.PROJECT,
        {
            id: projectId
        }
    )
    if (!projectInfo?.appCode) {
        throw new Error(global.i18n.t('请先绑定蓝鲸应用模块'))
    }
    projectInfo.accessToken = await generateToken(bkTicket, projectInfo.appCode)
    return projectInfo
}

// bk-data 的测试环境叫test
const stageName = httpConf.stageName === 'stag' ? 'test' : httpConf.stageName
// 存储类型是 mysql 的
const isMysqlStorage = (biz) => {
    const storages = biz.storages
    return storages?.mysql || storages?.tspider
}

/**
 * 执行 sql
 * @param {*} projectId 项目id
 * @param {*} sql sql语句
 * @param {*} bkTicket bkTicket
 * @returns 执行结果
 */
export const execSQL = async (projectId, sql, bkTicket) => {
    const { accessToken, appCode } = await getProjectInfo(projectId, bkTicket)
    const { data } = await execApiGateWay({
        apiName: 'bk-data',
        path: '/v3/queryengine/user/query_sync/',
        method: 'post',
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName,
        authorization: {
            access_token: accessToken,
            [global.AUTH_NAME]: bkTicket
        },
        data: {
            bkdata_authentication_method: 'user',
            bk_app_code: appCode,
            sql
        }
    })
    return [data?.list]
}

/**
 * 获取业务信息元数据
 * @param {*} projectId 应用 id
 * @param {*} bkTicket ticket
 * @returns bk-base 的业务列表
 */
export const getMetaBizs = async (projectId, bkTicket) => {
    const { accessToken } = await getProjectInfo(projectId, bkTicket)
    // 全量拉取业务，拼接数据使用
    const { data: bkBizs } = await execApiGateWay({
        apiName: 'bk-data',
        path: '/v3/meta/bizs/',
        method: 'get',
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName,
        authorization: {
            access_token: accessToken,
            [global.AUTH_NAME]: bkTicket
        }
    })
    // 拉取有权限的列表
    const { data } = await execApiGateWay({
        apiName: 'bk-data',
        path: '/v3/meta/result_tables/mine/',
        method: 'get',
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName,
        authorization: {
            access_token: accessToken,
            [global.AUTH_NAME]: bkTicket
        },
        data: {
            generate_type: 'user'
        }
    })
    const list = data?.reduce((acc, cur) => {
        const bkBiz = bkBizs.find((bkBiz) => +bkBiz.bk_biz_id === +cur.bk_biz_id)
        const isUsed = acc.find((bkBiz) => +bkBiz.bkBizId === +cur.bk_biz_id)
        if (bkBiz && !isUsed) {
            acc.push({
                bkBizId: bkBiz.bk_biz_id,
                bkBizName: bkBiz.bk_biz_name
            })
        }
        return acc
    }, []) || []
    return {
        list,
        count: list.length
    }
}

/**
 * 获取有权限的表
 * @param {*} projectId 项目id
 * @param {*} bkTicket bkTicket
 * @param {*} bkBizId 业务 id
 * @returns 表列表
 */
export const getTables = async (projectId, bkTicket, bkBizId) => {
    const { accessToken } = await getProjectInfo(projectId, bkTicket)
    const { data } = await execApiGateWay({
        apiName: 'bk-data',
        path: '/v3/meta/result_tables/mine/',
        method: 'get',
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName,
        authorization: {
            access_token: accessToken,
            [global.AUTH_NAME]: bkTicket
        },
        data: {
            related: ['fields', 'storages'],
            generate_type: 'user',
            bk_biz_id: bkBizId
        }
    })
    // 改造数据结构，制造统一表结构数据
    const list = data.reduce((acc, cur) => {
        const columns = cur
            ?.fields
            ?.reduce((acc, cur) => {
                if (cur.field_name !== 'timestamp') {
                    acc.push({
                        name: cur.field_name,
                        columnId: cur.id
                    })
                }
                return acc
            }, [])
        if (isMysqlStorage(cur)) {
            acc.push({
                id: cur.result_table_id,
                bkBizId: cur.bk_biz_id,
                tableName: cur.result_table_id,
                columns
            })
        }
        return acc
    }, [])
    return {
        list: list,
        count: list.length
    }
}

/**
 * 验证排序方向
 * @param {string} direction 排序方向
 * @returns {string} 验证后的排序方向
 */
const validateSortDirection = (direction) => {
    const allowedDirections = ['ASC', 'DESC']
    const upperDirection = String(direction).toUpperCase()
    if (!allowedDirections.includes(upperDirection)) {
        throw new Error('排序方向错误：只支持 ASC 或 DESC')
    }
    return upperDirection
}

/**
 * 获取有权限的数据
 * @param {*} projectId 项目id
 * @param {*} queryData 查询条件
 * @param {*} tableFileName 表名
 * @param {*} bkTicket ticket
 * @returns 表数据
 */
export const getTableDatas = async (projectId, queryData, tableFileName, bkTicket) => {
    try {
        // 构造查询 SQL - 使用参数化查询防止SQL注入
        const {
            page,
            pageSize,
            bkSortKey,
            bkSortValue,
            bkDataSourceType,
            ...others
        } = queryData

        // 验证表名
        const safeTableName = escapeIdentifier(tableFileName)
        let sql = `SELECT * FROM ${safeTableName}`
        
        Object
            .keys(others)
            .forEach((key, index) => {
                if (index <= 0) {
                    sql += ' WHERE'
                } else {
                    sql += ' AND'
                }
                sql += ` \`${key}\` LIKE '%${others[key]}%'`
            })

        // 构建ORDER BY子句
        if (bkSortKey && bkSortValue) {
            const safeSortKey = escapeIdentifier(bkSortKey)
            const safeSortDirection = validateSortDirection(bkSortValue)
            sql += ` ORDER BY ${safeSortKey} ${safeSortDirection}`
        }

        // 构建LIMIT子句
        if (page !== undefined && pageSize !== undefined) {
            const pageNum = parseInt(page, 10)
            const pageSizeNum = parseInt(pageSize, 10)
            
            // 验证分页参数
            if (isNaN(pageNum) || isNaN(pageSizeNum) || pageNum < 0 || pageSizeNum <= 0 || pageSizeNum > 1000) {
                throw new Error('分页参数错误：页码不能为负数，每页大小必须在1-1000之间')
            }
            
            const offset = pageNum * pageSizeNum
            sql += ` LIMIT ${offset}, ${pageSizeNum}`
        }

        sql += ';'        
        // 执行查询
        const multTableDatas = await execSQL(projectId, sql, bkTicket)
        // 过滤 bk-base 系统内置字段
        const list = (multTableDatas?.[0] || []).map((item) => {
            const { dtEventTimeStamp, localTime, thedate, dtEventTime, ...rest } = item
            return rest
        })
        return {
            list
        }
    } catch (error) {
        throw new Error(error.message || error)
    }
}
