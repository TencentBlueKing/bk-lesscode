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

import iamModel from '../../model/iam'
import { IAM_ACTION } from '../../../shared/constant.js'
import { checkInServer, fetchActionsPerm } from '../../controller/iam'

/**
 * 判断用户是否有该项目权限
 * @param {*} options { getId: Function } 获取 projectId 的方法
 */
export const ProjectAuthorization = ({ getId = ctx => ctx.request.query.projectId, needAuthActions = [] }) => {
    return (target, propertyKey, descriptor) => {
        // const originValue = descriptor.value
        // descriptor.value = async (ctx) => {
        //     try {
        //         const projectId = getId(ctx)
        //         const userInfo = ctx.session.userInfo
        //         const project = await projectModel.findUserProjectById(userInfo.id, projectId)
        //         if (!project) {
        //             throw new global.BusinessError(`您没有应用[ID:${projectId}]的权限，请联系管理员授权后再试`, 403, 403)
        //         } else {
        //             return await originValue.apply(this, [ctx])
        //         }
        //     } catch (error) {
        //         throw error
        //     }
        // }
        const originValue = descriptor.value
        descriptor.value = async (ctx) => {
            try {
                const projectId = getId(ctx)
                const userInfo = ctx.session.userInfo
                const project = await iamModel.queryProjectByCreatorAndProjectId(userInfo.username, projectId)
                if (!project) {
                    throw new global.BusinessError(global.i18n.t('应用[ID:{{n}}]不存在', { n: projectId }), 404)
                }

                // 需要去权限中心查询是否具有 develop_app 权限
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
                    throw new global.BusinessError(global.i18n.t('您没有应用[ID:{{n}}]的权限，请去权限中心申请权限', { n: projectId }), 403, 200, (new Error()).stack, {
                        pass: false,
                        applyUrl: iamRes.applyUrl,
                        requiredPermissions: iamRes.requiredPermissions
                    })
                }

                return await originValue.apply(this, [ctx])
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
            if (!global.IAM_ENABLE) {
                await originValue.apply(this, [ctx])
                return
            }

            try {
                // 权限中心申请权限选择无限制时，返回结构如下
                // {"develop_app":true,"deploy_app":true,"manage_perms_in_app":true,"manage_app":true}
                const authedRet = await fetchActionsPerm(ctx, [
                    IAM_ACTION.manage_platform[0]
                ])

                if (!authedRet[IAM_ACTION.manage_platform[0]]) {
                    throw new global.BusinessError(global.i18n.t('您不是平台管理员，请联系管理员授权后再试'), 403, 403)
                } else {
                    return await originValue.apply(this, [ctx])
                }
            } catch (error) {
                throw error
            }
        }
    }
}
