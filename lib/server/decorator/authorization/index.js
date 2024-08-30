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

import { IAM_ACTION } from '../../../shared/constant.js'
import { isInWhiteList } from '../../service/common/ai'
import { checkProjectPerm, checkNoResourcePerm, queryProjectIdByResource } from '../../service/common/project-auth'

/**
 * 判断用户是否有该项目权限
 * @param {*} options { getId: Function } 获取 projectId 的方法
 */
export const ProjectAuthorization = ({ getId = ctx => ctx.request.headers['x-project-id'], needAuthActions = [IAM_ACTION.develop_app[0]] }) => {
    return (target, propertyKey, descriptor) => {
        const originValue = descriptor.value
        descriptor.value = async (ctx) => {
            try {
                const projectId = getId(ctx)
                const res = await checkProjectPerm(ctx, projectId, needAuthActions)
                if (res.code === 403) {
                    throw new global.BusinessError(global.i18n.t('您没有应用[ID:{{n}}]的权限，请去权限中心申请权限', { n: projectId }), 403, 200, (new Error()).stack, res.data)
                } else if (res.code > 0) {
                    throw new global.BusinessError(res.message, res.code)
                } else {
                    return await originValue.apply(this, [ctx])
                }
            } catch (error) {
                throw error
            }
        }
    }
}

/**
 * 根据资源id跟projectid， 判断用户是否有应用权限
 */
export const ProjectResAuthorization = ({ tableName = '', resourceKey = 'id', getResourceId = ctx => ctx.request.body?.id || ctx.request.query?.id, needAuthActions = [IAM_ACTION.develop_app[0]] }) => {
    return (target, propertyKey, descriptor) => {
        const originValue = descriptor.value
        descriptor.value = async (ctx) => {
            try {
                const projectId = ctx.request.headers['x-project-id']
                const resourceId = getResourceId(ctx)
                if (!projectId || !resourceId) {
                    throw new global.BusinessError(global.i18n.t('请求参数非法'), 400)
                }
                // 根据表名， 指定字段、查找相应的projectId， 如根据
                const realProjectId = await queryProjectIdByResource(tableName, { [resourceKey]: resourceId })
                if (realProjectId.toString() !== projectId.toString()) {
                    throw new global.BusinessError(global.i18n.t('请求非法，projectId跟资源id不匹配'), 404)
                }
                
                const res = await checkProjectPerm(ctx, projectId, needAuthActions)
                if (res.code === 403) {
                    throw new global.BusinessError(global.i18n.t('您没有应用[ID:{{n}}]的权限，请去权限中心申请权限', { n: projectId }), 403, 200, (new Error()).stack, res.data)
                } else if (res.code > 0) {
                    throw new global.BusinessError(res.message, res.code)
                } else {
                    return await originValue.apply(this, [ctx])
                }
            } catch (error) {
                throw error
            }
        }
    }
}

/**
 * 判断用户是否是平台管理员
 */
export const PlatformAdminAuthorization = () => {
    return (target, propertyKey, descriptor) => {
        const originValue = descriptor.value
        descriptor.value = async (ctx) => {
            try {
                const res = await checkNoResourcePerm(ctx, IAM_ACTION.manage_platform[0])
                if (res.code > 0) {
                    throw new global.BusinessError(res.message, res.code, res.code)
                } else {
                    return await originValue.apply(this, [ctx])
                }
            } catch (error) {
                throw error
            }
        }
    }
}

/**
 * 判断用户是否是 AI 白名单
 */
export const AIAuthorization = () => {
    return (target, propertyKey, descriptor) => {
        const originValue = descriptor.value
        descriptor.value = async (ctx) => {
            try {
                const userInfo = ctx.session.userInfo
                const isAllowed = await isInWhiteList(userInfo.username)
                if (!isAllowed) {
                    throw new global.BusinessError('您没有AI的权限，请联系管理员授权后再试', 403, 403)
                } else {
                    return await originValue.apply(this, [ctx])
                }
            } catch (error) {
                throw error
            }
        }
    }
}
