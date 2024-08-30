import { LCDataService, TABLE_FILE_NAME } from './data-service'

import iamModel from '../../model/iam'
import { checkInServer, fetchActionsPerm } from '../../controller/iam'
import { IAM_ACTION } from '../../../shared/constant.js'

// 查找对应资源id对应的projectId
export const queryProjectIdByResource = async (tableName, where) => {
    const data = await LCDataService.findOne(
        TABLE_FILE_NAME[tableName],
        where
    ) || {}
    return data?.projectId || data?.belongProjectId || data?.project_id || ''
}

/**
 * @desc 校验header中获传过来的projceId，与根据传过来的资源id反查出来的projectId是否一致
 * @param { Ctx }ctx
 * @param { Object: {
 *              projectId: 要对比的projectId 默认从header取
 *              resourceKey: 资源在数据表中的关联字段,  默认为id,
 *              resourceId: 传递过来资源id, 默认为ctx.request.body[resourceKey] || ctx.request.query[resourceKey]
 *              findType: projectId字段跟resourceKey字段的关系, 默认 IN_SAME_TABLE
 *         } } payload
 * @returns { String }
 */
export const findRealProjectId = async (ctx, payload = {}) => {
    const tableName = payload.tableName
    const paramProjectId = payload?.projectId || ctx.request.headers['x-project-id']
    const resourceKey = payload?.resourceKey || 'id'
    const resourceId = payload?.resourceId || ctx.request.body[resourceKey] || ctx.request.query[resourceKey]
    // const type = payload?.findType || 'IN_SAME_TABLE'
    if (!paramProjectId) {
        return 0
    }
    const realProjectId = await queryProjectIdByResource(tableName, { [resourceKey]: resourceId })
    if (realProjectId.toString() !== paramProjectId.toString()) {
        return 0
    }
    return realProjectId
}

// 鉴权projectId对应的权限
export const handleProjectPerm = async (ctx, next, projectId, needAuthActions = ['develop_app']) => {
    const res = await checkProjectPerm(ctx, projectId, needAuthActions)
    if (res.code === 0) {
        await next()
    } else {
        ctx.send(res)
    }
}

// 检查projectId是否存在及有对应的权限
export const checkProjectPerm = async (ctx, projectId, needAuthActions = ['develop_app']) => {
    try {
        projectId = projectId || ctx.request.headers['x-project-id']
        const project = await iamModel.queryProjectByCreatorAndProjectId(ctx.session.userInfo.username, projectId)
        if (!project) {
            return {
                code: 404,
                message: global.i18n.t('应用不存在'),
                data: null
            }
        }

        // 需要去权限中心查询是否具有相应权限
        const iamRes = await checkInServer(ctx, String(projectId))
        let pass = false
        for (let i = 0; i < needAuthActions.length; i++) {
            const needAuthAction = needAuthActions[i]
            if (iamRes[IAM_ACTION[needAuthAction][0]]) {
                pass = true
                break
            }
        }
        if (!pass) {
            return {
                code: 403,
                message: global.i18n.t('您没有应用[ID:{{n}}]的权限，请去权限中心申请权限', { n: projectId }),
                data: {
                    pass: false,
                    applyUrl: iamRes.applyUrl,
                    requiredPermissions: iamRes.requiredPermissions,
                    permissionType: 'page'
                }
            }
        } else {
            return {
                code: 0,
                data: true
            }
        }
    } catch (error) {
        return {
            code: 500,
            data: null,
            message: error.message || error
        }
    }
}

// 校验几个不对应资源的超级管理员权限
export const checkNoResourcePerm = async (ctx, checkAction) => {
    try {
        if (!global.IAM_ENABLE) {
            // 未开启权限中心则校验老的platformadmin
            const isPlatformAdmin = await LCDataService.findOne(TABLE_FILE_NAME.PLATFORM_ADMIN, {
                username: ctx.session.userInfo.username
            })
            if (isPlatformAdmin?.id) {
                return {
                    code: 0,
                    data: true
                }
            } else {
                return {
                    code: 403,
                    message: global.i18n.t('您不是平台管理员，请联系管理员授权后再试')
                }
            }
        } else {
            const authedRet = await fetchActionsPerm(ctx, [
                checkAction
            ])
    
            if (!authedRet[checkAction]) {
                return {
                    code: 403,
                    message: global.i18n.t('您不是平台管理员，请联系管理员授权后再试')
                }
            } else {
                return {
                    code: 0,
                    data: true
                }
            }
        }
    } catch (err) {
        return {
            code: 500,
            message: err.message || err
        }
    }
}