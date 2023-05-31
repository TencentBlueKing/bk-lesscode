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

import { getRepository, getConnection } from 'typeorm'
import IamAppPerm from './entities/iam-app-perm'
import IamAppPermAction from './entities/iam-app-perm-action'
import Project from './entities/project'
import { IAM_PROVIDER_HOST } from '../conf/iam'
import { IAM_APP_PERM_RESOURCE_TYPE_ID, IAM_APP_PERM_INSTANCE_SELECTION_ID, IAM_ACTION_TYPE, IAM_APP_PERM_BUILDIN_ACTION } from '../../shared/constant.js'

module.exports = {
    // 新建项目时候初始化数据
    insertIamAppPermData (projectId, projectData) {
        const { projectCode, projectName } = projectData
        return getConnection().transaction(async transactionalEntityManager => {
            const systemId = `lesscode_${projectId}_${projectCode}`.substr(0, 32)
            const { id: iamAppPermId } = await transactionalEntityManager.save(IamAppPerm, {
                projectId: projectId,
                systemId: systemId,
                systemName: global.i18n.t('蓝鲸可视化开发平台-{{n}}', { n: projectName }),
                systemNameEn: `lesscode-${projectCode}`,
                systemDesc: global.i18n.t('蓝鲸可视化开发平台-{{n}}', { n: projectName }),
                systemDescEn: `lesscode-${projectCode}`,
                systemClients: systemId,
                systemProviderConfig: {
                    host: IAM_PROVIDER_HOST,
                    auth: 'basic',
                    healthz: ''
                },
                deployed: 0,
                resourceTypeId: IAM_APP_PERM_RESOURCE_TYPE_ID,
                resourceTypeName: global.i18n.t('页面'),
                resourceTypeNameEn: 'Page',
                resourceTypeDesc: global.i18n.t('页面是...'),
                resourceTypeDescEn: 'page is a ...',
                resourceTypeProviderConfig: {
                    path: `/api/iam/resource-app-perm?projectId=${projectId}`
                },

                instanceSelectionId: IAM_APP_PERM_INSTANCE_SELECTION_ID,
                instanceSelectionName: global.i18n.t('页面视图'),
                instanceSelectionNameEn: 'Page List',
                instanceSelectionResourceTypeChain: [
                    {
                        // 系统 ID
                        system_id: systemId,
                        // 资源类型 ID
                        id: IAM_APP_PERM_RESOURCE_TYPE_ID
                    }
                ],
                createUser: projectData.createUser,
                updateUser: projectData.createUser
            })

            await transactionalEntityManager.save(IamAppPermAction, {
                iamAppPermId: iamAppPermId,
                projectId: projectId,
                actionId: IAM_APP_PERM_BUILDIN_ACTION,
                actionName: global.i18n.t('页面访问'),
                actionNameEn: 'View Page',
                actionDesc: global.i18n.t('访问页面的操作权限'),
                actionDescEn: 'The permissions to access the page',
                actionType: IAM_ACTION_TYPE.view[0],
                actionRelatedResourceId: [],
                createUser: projectData.createUser,
                updateUser: projectData.createUser
            })
        })
    },

    getIamAppPerm (projectId) {
        return getRepository(IamAppPerm).createQueryBuilder('iamAppPerm')
            .leftJoinAndSelect(Project, 'p', 'p.id = iamAppPerm.projectId')
            .select([
                'iamAppPerm.id',
                'iamAppPerm.projectId',
                'iamAppPerm.systemId',
                'iamAppPerm.systemName',
                'iamAppPerm.systemNameEn',
                'iamAppPerm.systemDesc',
                'iamAppPerm.systemDescEn',
                'iamAppPerm.systemClients',
                'iamAppPerm.systemProviderConfig',
                'iamAppPerm.deployed',
                'iamAppPerm.resourceTypeId',
                'iamAppPerm.resourceTypeName',
                'iamAppPerm.resourceTypeNameEn',
                'iamAppPerm.resourceTypeDesc',
                'iamAppPerm.resourceTypeDescEn',
                'iamAppPerm.resourceTypeProviderConfig',
                'iamAppPerm.instanceSelectionId',
                'iamAppPerm.instanceSelectionName',
                'iamAppPerm.instanceSelectionNameEn',
                'iamAppPerm.instanceSelectionResourceTypeChain',
                'iamAppPerm.updateUser',
                'iamAppPerm.createUser',
                'iamAppPerm.createTime',
                'iamAppPerm.updateTime',
                'iamAppPerm.deleteFlag'
            ])
            .where('p.id = :projectId', { projectId })
            .andWhere('iamAppPerm.deleteFlag = 0')
            .getOne()
    },

    updateIamAppPerm (projectId, fields) {
        return getRepository(IamAppPerm).update({ projectId: projectId }, fields)
    },

    getIamAppPermActions (projectId) {
        return getRepository(IamAppPermAction).createQueryBuilder('iamAppPermAction')
            .leftJoinAndSelect(Project, 'p', 'p.id = iamAppPermAction.projectId')
            .select([
                'iamAppPermAction.id',
                'iamAppPermAction.iamAppPermId',
                'iamAppPermAction.projectId',
                'iamAppPermAction.actionId',
                'iamAppPermAction.actionName',
                'iamAppPermAction.actionNameEn',
                'iamAppPermAction.actionDesc',
                'iamAppPermAction.actionDescEn',
                'iamAppPermAction.actionType',
                'iamAppPermAction.actionRelatedResourceId',
                // 'iamAppPermAction.updateUser',
                // 'iamAppPermAction.createUser',
                // 'iamAppPermAction.createTime',
                // 'iamAppPermAction.updateTime',
                'iamAppPermAction.deleteFlag',
                'iamAppPermAction.registeredStatus',
                'iamAppPermAction.pageComponentRef'
            ])
            .where('p.id = :projectId', { projectId })
            .andWhere('iamAppPermAction.deleteFlag = 0')
            .addOrderBy('iamAppPermAction.id', 'DESC')
            .getMany()
    },

    getIamAppPermActionById (id) {
        return getRepository(IamAppPermAction).findOne(id)
    },

    updateIamAppPermAction (actionId, fields) {
        return getRepository(IamAppPermAction).update({ id: actionId }, fields)
    }
}
