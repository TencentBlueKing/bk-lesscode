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

import { execApiGateWay } from '@bkui/apigateway-nodejs-sdk'
import { LCDataService, TABLE_FILE_NAME } from '../common/data-service'
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
                apiName: 'bkflow-eng-svc',
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
            }
        } catch (err) {
            console.error('create bkflow space error:\n', err)
            throw new Error(err.message, -1)
        }
    }

    return spaceData
}
