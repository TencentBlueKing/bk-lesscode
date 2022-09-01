import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import { RequestContext } from '../../middleware/request-context'
import httpConf from '../../conf/http'
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'

const getProjectInfo = async (projectId) => {
    const currentUser = RequestContext.getCurrentUser() || {}
    const projectInfo = await LCDataService.findOne(
        TABLE_FILE_NAME.PROJECT,
        {
            id: projectId
        }
    )
    if (!projectInfo.appCode) {
        throw new Error('请先绑定绑定蓝鲸应用模块')
    }
    const firstToken = await LCDataService.findOne(
        TABLE_FILE_NAME.TOKEN,
        {
            deleteFlag: 0,
            updateUser: currentUser.username,
            appCode: projectInfo?.appCode
        }
    )
    if (!firstToken) {
        throw new Error('请先绑定绑定蓝鲸应用模块并生成凭证')
    }
    projectInfo.accessToken = firstToken.token
    return projectInfo
}

// bk-data 的测试环境叫test
const stageName = httpConf.stageName === 'stag' ? 'test' : httpConf.stageName

/**
 * 执行 sql
 * @param {*} projectId 项目id
 * @param {*} sql sql语句
 * @param {*} bkTicket bkTicket
 * @returns 执行结果
 */
export const execSQL = async (projectId, sql, bkTicket) => {
    const { accessToken, appCode } = await getProjectInfo(projectId)
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
 * 获取有权限的表
 * @param {*} projectId 项目id
 * @param {*} bkTicket bkTicket
 * @returns 表列表
 */
export const getTables = async (projectId, bkTicket) => {
    const { accessToken } = await getProjectInfo(projectId)
    // 由于权限问题，先获取一次表列表
    const { data: tableWithOutFileds } = await execApiGateWay({
        apiName: 'bk-data',
        path: '/v3/meta/result_tables/mine/',
        method: 'get',
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName,
        authorization: {
            access_token: accessToken,
            [global.AUTH_NAME]: bkTicket
        }
    })
    // 再获取一次携带 bk_biz_ids，返回 field
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
            related: 'fields',
            bk_biz_id: tableWithOutFileds.map(table => table.bk_biz_id)
        }
    })
    // 改造数据结构，制造统一表结构数据
    data.forEach((table) => {
        table.tableName = table.result_table_id
        table.columns = table
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
    })
    return {
        list: data,
        count: data.length
    }
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
    return execSQL(projectId, sql, bkTicket)
}
