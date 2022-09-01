import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import token from '../conf/token'
import { RequestContext } from '../middleware/request-context'

/**
 * 执行 sql
 * @param {*} sql sql语句
 * @param {*} bkTicket bkTicket
 * @returns 执行结果
 */
export const execSQL = async (sql, bkTicket) => {
    const currentUser = RequestContext.getCurrentUser() || {}
    const { data } = await execApiGateWay({
        apiName: 'bk-data',
        path: '/v3/queryengine/query_sync/',
        method: 'post',
        stageName: process.env.BKPAAS_ENVIRONMENT === 'prod' ? 'prod' : 'test',
        authorization: {
            ...token,
            [global.AUTH_NAME]: bkTicket
        },
        data: {
            bk_app_code: token.bk_app_code,
            bk_username: currentUser.username,
            bkdata_authentication_method: 'user',
            sql
        }
    })
    return [data?.list]
}

/**
 * 获取有权限的数据
 * @param {*} queryData 查询条件
 * @param {*} tableFileName 表名
 * @param {*} bkTicket ticket
 * @returns 表数据
 */
export const getTableDatas = async (queryData, tableFileName, bkTicket) => {
    // 构造查询 SQL
    const {
        page,
        pageSize,
        bkSortKey,
        bkSortValue,
        bkDataSourceType,
        ...others
    } = queryData
    let sql = `SELECT * FROM ${tableFileName}`
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
    if (bkSortKey && bkSortValue) {
        sql += ` ORDER BY \`${bkSortKey}\` ${bkSortValue}`
    }
    if (page && pageSize) {
        const index = page * pageSize
        sql += ` LIMIT ${index}, ${pageSize}`
    }

    sql += ';'
    // 执行查询
    return execSQL(sql, bkTicket)
}
