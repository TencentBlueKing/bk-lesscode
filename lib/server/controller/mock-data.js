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
import {
    generateToken
} from '../service/business/token'
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../service/common/data-service'

const METHODS_WITH_DATA = ['post', 'put', 'patch']

function strToJson (str) {
    // eslint-disable-next-line no-new-func
    const json = (new Function('return ' + str))()
    return json
}

const Data = {
    async getApiData (ctx) {
        try {
            const {
                url,
                projectId,
                type = 'get',
                withToken = 0,
                apiData
            } = ctx.request.body || {}

            // 发送请求的参数
            const httpConf = {
                url: /^http(s)?\:\/\//.test(url) ? url : ctx.origin + url,
                method: type,
                headers: {
                    'X-PROJECT-ID': projectId
                }
            }

            // 请求携带的数据
            const httpData = typeof apiData === 'string' ? strToJson(apiData || '{}') : apiData
            if (METHODS_WITH_DATA.includes(type)) {
                httpConf.data = httpData
            } else {
                const urlObj = new URL(httpConf.url)
                Object.keys(httpData).forEach((key) => {
                    urlObj.searchParams.delete(key)
                    urlObj.searchParams.append(key, httpData[key])
                })
                httpConf.url = urlObj.href
            }

            // 请求携带 cookie
            ctx.http.defaults.withCredentials = true
            if (ctx.cookies.request.headers.cookie) ctx.http.defaults.headers.Cookie = ctx.cookies.request.headers.cookie

            // 携带时区
            const timezoneOffset = ctx.request.headers['x-timezone-offset']
            if (timezoneOffset) {
                httpConf.headers['X-TIMEZONE-OFFSET'] = timezoneOffset
            }

            // 携带 token
            if (withToken) {
                // 携带 token 的情况下，应用id必传
                if (!projectId) {
                    throw new Error('请求失败：projectId 不能为空')
                }
                // 获取应用详情
                const projectDetail  = await LCDataService.findOne(
                    TABLE_FILE_NAME.PROJECT,
                    {
                        id: projectId
                    }
                )
                // 获取ticket
                const bkTikcet = ctx.cookies.get(global.AUTH_NAME)
                // 构造 X-BKAPI-AUTHORIZATION
                const access_token = await generateToken(bkTikcet, projectDetail.appCode)
                const token = {
                    access_token,
                    [global.AUTH_NAME]: bkTikcet
                }
                httpConf.headers['X-BKAPI-AUTHORIZATION'] = JSON.stringify(token)
            }

            const { data } = await ctx.http(httpConf)

            ctx.send(data)
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async getMockData (ctx) {
        const { page = 1, pageSize = 20 } = ctx.request.query || {}
        const count = 200
        const list = []
        for (let i = 0; i < count; i++) {
            list.push({
                id: i,
                projectId: `id-${i}`,
                projectCode: `code-${i}`,
                projectName: `应用-${i}`,
                name: `名称-${i}`
            })
        }
        const start = (page - 1) * pageSize
        const end = page * pageSize
        const data = list.slice(start, end)
        try {
            ctx.send({
                code: 0,
                message: 'success',
                count,
                data
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async getXTableData (ctx) {
        const data = {
            msg: [
                {
                    cluster_config: {
                        creator: 'system',
                        cluster_name: '测试1',
                        create_time: '2019-11-19 17:52:08',
                        cluster_id: 1,
                        port: 10004,
                        domain_name: '',
                        is_editable: false,
                        state: true
                    },
                    is_editable: true
                },
                {
                    cluster_config: {
                        creator: 'system',
                        cluster_name: '测试2',
                        create_time: '2019-11-19 17:52:08',
                        cluster_id: 2,
                        port: 10004,
                        domain_name: '127.0.0.1',
                        is_editable: true,
                        state: true
                    },
                    is_editable: true
                },
                {
                    cluster_config: {
                        creator: 'system',
                        cluster_name: '测试3',
                        create_time: '2019-11-19 17:52:08',
                        cluster_id: 3,
                        port: 10004,
                        domain_name: '127.0.0.1',
                        is_editable: true,
                        state: false
                    },
                    is_editable: true
                },
                {
                    cluster_config: {
                        creator: 'system',
                        cluster_name: '测试4',
                        create_time: '2019-11-19 17:52:08',
                        cluster_id: 4,
                        port: 10004,
                        domain_name: '',
                        is_editable: true,
                        state: true
                    },
                    is_editable: true
                },
                {
                    cluster_config: {
                        creator: 'system',
                        cluster_name: '搜索测试5',
                        create_time: '2019-11-19 17:52:08',
                        cluster_id: 5,
                        port: 10004,
                        domain_name: '',
                        is_editable: false,
                        state: false
                    },
                    is_editable: false
                }
            ]
        }
        try {
            ctx.send({
                code: 0,
                message: 'success',
                data
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    }
}

module.exports = Data
