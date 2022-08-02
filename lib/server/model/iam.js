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
import Project from './entities/project'
import Page from './entities/page'
import { RequestContext } from '../middleware/request-context'

const projectSelectFields = [
    'project.id',
    'project.projectCode',
    'project.projectName',
    'project.projectDesc',
    'project.status',
    'project.isOffcial',
    'project.offcialType',
    'project.createTime',
    'project.createUser',
    'project.deleteFlag',
    'project.isEnableDataSource'
]

export default {
    // 查询平台所有项目
    queryAllProjectInPlatform ({ condition = '', params = {}, select }) {
        return getRepository(Project)
            .createQueryBuilder('project')
            .select(select || projectSelectFields)
            .where('project.deleteFlag != 1')
            .andWhere(condition, params)
            .orderBy('project.id', 'DESC')
            .getMany()
    },

    // 根据 createUser 和 projectId 查询项目
    queryProjectByCreatorAndProjectId (username, id) {
        return getRepository(Project).createQueryBuilder('project')
            .where('project.id = :id', { id })
            .andWhere('project.deleteFlag != 1 AND project.createUser = :username', { username })
            .getOne()
    },

    queryAllProject ({ condition = '', params = {}, select }) {
        const currentUser = RequestContext.getCurrentUser() || {}
        const userId = currentUser.id
        return getRepository(Project)
            .createQueryBuilder('project')
            .innerJoinAndSelect('r_user_project_role', 'user_project_role', 'user_project_role.projectId = project.id')
            .select(select || projectSelectFields)
            .where('project.deleteFlag != 1 AND user_project_role.deleteFlag != 1 AND user_project_role.userId = :userId', { userId })
            .andWhere(condition, params)
            .orderBy('project.id', 'DESC')
            .getMany()
    },

    queryMyCreateProject ({ condition = '', params = {}, select }) {
        const currentUser = RequestContext.getCurrentUser() || {}
        const userId = currentUser.id
        return getRepository(Project)
            .createQueryBuilder('project')
            .innerJoinAndSelect('r_user_project_role', 'user_project_role', 'user_project_role.projectId = project.id')
            .select(select || projectSelectFields)
            .where('project.deleteFlag != 1 AND user_project_role.deleteFlag != 1 AND user_project_role.userId = :userId', { userId })
            .andWhere(condition, params)
            .orderBy('project.id', 'DESC')
            .getMany()
    },

    queryMyFavoriteProject ({ condition = '', params = {}, select }) {
        const currentUser = RequestContext.getCurrentUser() || {}
        const userId = currentUser.id
        return getRepository(Project)
            .createQueryBuilder('project')
            .innerJoinAndSelect('r_user_project_role', 'user_project_role', 'user_project_role.projectId = project.id')
            .innerJoinAndSelect('r_favourite', 'favourite', 'favourite.projectId = project.id')
            .where('project.deleteFlag != 1 AND user_project_role.deleteFlag != 1 AND user_project_role.userId = :userId', { userId })
            .andWhere(condition, params)
            .select(select || projectSelectFields)
            .orderBy('project.id', 'DESC')
            .getMany()
    },

    queryProjectPage ({ condition = '', params = {} }) {
        return getRepository(Page)
            .createQueryBuilder('page')
            .innerJoinAndSelect('r_project_page', 'project_page', 'project_page.pageId = page.id')
            .select(['page.pageName as pageName',
                'page.updateTime as updateTime',
                'page.updateUser as updateUser',
                'project_page.projectId as projectId'
            ])
            .where(condition, params)
            .andWhere('page.deleteFlag != 1')
            .orderBy('page.updateTime', 'DESC')
            .getRawMany()
    }
}
