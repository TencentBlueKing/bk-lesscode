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
import IamAppPermModel from './entities/iam-app-perm-model'
import Project from './entities/project'

module.exports = {
    getIamAppPermModels (projectId) {
        return getRepository(IamAppPermModel).createQueryBuilder('iamAppPermModel')
            .leftJoinAndSelect(Project, 'p', 'p.id = iamAppPermModel.projectId')
            .select([
                'iamAppPermModel.id',
                'iamAppPermModel.projectId',
                'iamAppPermModel.actionId',
                'iamAppPermModel.actionName',
                'iamAppPermModel.actionNameEn',
                'iamAppPermModel.actionDesc',
                'iamAppPermModel.actionDescEn',
                'iamAppPermModel.actionType',
                'iamAppPermModel.actionRelatedResourceId',
                'iamAppPermModel.updateUser',
                'iamAppPermModel.createUser',
                'iamAppPermModel.createTime',
                'iamAppPermModel.updateTime',
                'iamAppPermModel.deleteFlag'
            ])
            .where('p.id = :projectId', { projectId })
            .andWhere('iamAppPermModel.deleteFlag = 0')
            .addOrderBy('iamAppPermModel.id', 'DESC')
            .getMany()
    },

    update (projectId, fields) {
        return getRepository(IamAppPermModel).update({ projectId: projectId }, fields)
    }
}
