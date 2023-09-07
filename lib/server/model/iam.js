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
import ProjectPage from './entities/project-page'
// import Page from './entities/page'
// import { RequestContext } from '../middleware/request-context'

const projectSelectFields = [
    'project.id',
    'project.projectCode',
    'project.projectName',
    'project.projectDesc',
    'project.status',
    'project.isOffcial',
    'project.offcialType',
    'project.templateImg',
    'project.createTime',
    'project.createUser',
    'project.updateTime',
    'project.updateUser',
    'project.deleteFlag',
    'project.isEnableDataSource',
    'project.framework'
]

const iamModel = {
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

    // 根据 createUser 查询创建的所有项目
    // queryAllProjectByCreator ({ condition = '', params = {}, select }) {
    //     const currentUser = RequestContext.getCurrentUser() || {}
    //     const username = currentUser.username

    //     return getRepository(Project).createQueryBuilder('project')
    //         .select(select || projectSelectFields)
    //         .where('project.deleteFlag != 1 AND project.createUser = :username', { username })
    //         .andWhere(condition, params)
    //         .orderBy('project.id', 'DESC')
    //         .printSql()
    //         .getMany()
    // },

    // 根据 createUser 和 projectId 查询项目,  如果是来源于其它操作，比如，恢复归档、删除等，则不应该判断archiveFlag
    async queryProjectByCreatorAndProjectId (username, projectId, isQuery = true) {
        let result = ''
        if (isQuery) {
            result = await getRepository(Project).createQueryBuilder('project')
            .where('project.deleteFlag != 1 AND project.archiveFlag != 1 AND project.id = :projectId', { projectId })
            .getOne()
        } else {
            result = await getRepository(Project).createQueryBuilder('project')
            .where('project.deleteFlag != 1 AND project.id = :projectId', { projectId })
            .getOne()
        }
        

        // // 项目存在
        // if (result) {
        //     // 是否是自己创建的项目
        //     result.isCreator = result.createUser === username
        // }

        // 项目不存在，返回 undefined
        return result
    },

    // 根据 createUser, pageId 查询项目
    async queryProjectByCreatorAndPageId (username, pageId) {
        const projectPageRet = await getRepository(ProjectPage).createQueryBuilder('rp')
            .select(['rp.projectId as projectId', 'rp.pageId as pageId'])
            .where('rp.pageId = :pageId', { pageId })
            .andWhere('rp.deleteFlag = 0')
            .printSql()
            .getRawOne()

        // pageId 不存在
        if (!projectPageRet) {
            return
        }

        const project = await iamModel.queryProjectByCreatorAndProjectId(username, projectPageRet.projectId)

        // project 为 undefined 说明 pageId 对应的 project 不存在，此情况正常情况下不会出现，直接输入错误的 url 时会出现
        return project
    }
}

export default iamModel
