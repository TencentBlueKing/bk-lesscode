/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2024 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import { getRepository, Between, Like } from 'typeorm'
import FlowTask from '../../model/entities/flow-task'
import { execApiGateWay } from '@bkui/apigateway-nodejs-sdk'
import { LCDataService, TABLE_FILE_NAME, transformQuery } from '../common/data-service'
import httpConf from '../../conf/http'
import v3Conf from '../../conf/v3'

// lesscode平台创建bkflow空间
export const createBkFlowSpace = async () => {
    const spaceData = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId: 0 })

    if (!spaceData) {
        try {

            let maintainers = ['admin']
            if (process.env.LESSCODE_DEFAULT_IAM_MANAGER) {
                maintainers = process.env.LESSCODE_DEFAULT_IAM_MANAGER.split(';')
            }

            const response = await execApiGateWay({
                apiName: global.BKFLOW_API_GATEWAY_NAME,
                path: `/create_space/`,
                method: 'post',
                authorization: {
                  bk_app_code: v3Conf.APP_ID,
                  bk_app_secret: v3Conf.APP_SECRET,
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName: httpConf.stageName === 'stag' ? 'stage' : httpConf.stageName,
                data: {
                    name: 'LessCode',
                    app_code: v3Conf.APP_ID,
                    desc: '运维开发平台',
                    platform_url: 'https://lesscode.domain.com',
                    config: {
                        superusers: maintainers
                    }
                }
            })

            console.log('create bkflow space response ============>', response)

            if (response.result) {
                await LCDataService.add(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, {
                    projectId: 0,
                    bkFlowSpaceId: response.data.space.id
                })
                return response.data.space.id
            }
        } catch (err) {
            console.error('create bkflow space error:\n', err)
            throw new Error(err.message, -1)
        }
    }

    return spaceData.bkFlowSpaceId
}

// 获取lesscode平台在bkflow的空间id,如果不存在则创建一个
export const getLesscodeBkFlowSpaceId = async () => {
    const spaceData = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT_BKFLOW_SPACE, { projectId: 0 })
    if (spaceData) {
        return spaceData.bkFlowSpaceId
    }
    return await createBkFlowSpace()
}

export const getTaskList = (parmas) => {

    const {
        projectId,
        id,
        tplName,
        createAtStart,
        createAtEnd,
        createUser,
        page = 0,
        pageSize = 10
    } = parmas

    const query = {
        projectId,
        deleteFlag: 0
    }

    if (id) {
        query.id = id
    }

    if (tplName) {
        query.tpl = {
            name: Like(`%${tplName}%`)
        }
    }

    if (createUser) {
        query.createUser = createUser
    }

    if (createAtStart && createAtEnd) {
        query.createTime = Between(createAtStart, createAtEnd)
    }

    const queryObject = transformQuery(query)

    const queryBuilder = getRepository(FlowTask)
        .createQueryBuilder('flowTask')
        .leftJoinAndSelect('flowTask.tpl', 'flowTpl')
        // .addSelect(['flowTask.id AS taskId', 'flowTask.name AS taskName', 'flowTpl.id AS tpl_id', 'flowTpl.name AS tplName'])
        .where(queryObject)
        .orderBy("flowTask.id", "DESC")
        .skip((page - 1) * pageSize)
        .take(pageSize)
    return queryBuilder.getManyAndCount(); // 获取扁平化结果
}
