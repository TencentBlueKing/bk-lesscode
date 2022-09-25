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

import { getRepository } from 'typeorm'
import IamAppPerm from './entities/iam-app-perm'
import IamAppPermAction from './entities/iam-app-perm-action'
import Project from './entities/project'

module.exports = {
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
                'iamAppPermAction.updateUser',
                'iamAppPermAction.createUser',
                'iamAppPermAction.createTime',
                'iamAppPermAction.updateTime',
                'iamAppPermAction.deleteFlag'
            ])
            .where('p.id = :projectId', { projectId })
            .andWhere('iamAppPermAction.deleteFlag = 0')
            .addOrderBy('iamAppPermAction.id', 'DESC')
            .getMany()
    },

    updateIamAppPermAction (projectId, fields) {
        return getRepository(IamAppPermAction).update({ projectId: projectId }, fields)
    }
}
