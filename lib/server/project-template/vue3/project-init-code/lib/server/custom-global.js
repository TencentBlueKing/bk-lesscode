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

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

/**
 * 业务错误，用于非500错误信息，由接口自行处理错误
 * @param {*} message // 错误的信息，非必填，默认 “服务器出现业务错误”
 * @param {*} code // 错误码，非必填，默认 499
 * @param {*} data // 错误数据，非必填
 */
function BusinessError (message = '服务器错误', code = -1, status = 200, stack = (new Error()).stack, data) {
    this.name = 'BusinessError'
    this.status = status
    this.message = message
    this.code = code
    this.data = data
    this.stack = stack
}
BusinessError.prototype = Object.create(Error.prototype)
BusinessError.prototype.constructor = BusinessError

global.BusinessError = BusinessError
// apigateway相关接口校验字段，开源/社区版为bk_token， 内部版为bk_ticket
global.AUTH_NAME = process.env.BKPAAS_ENGINE_REGION === 'ieod' ? 'bk_ticket' : 'bk_token'
global.ITSM_APP_CODE = process.env.BKPAAS_ENGINE_REGION === 'ieod' ? 'bkc-itsm' : 'bk-itsm'
global.BKPAAS_ENGINE_REGION = process.env.BKPAAS_ENGINE_REGION === 'ieod' ? 'ieod' : 'default'
// 是否对接权限中心
global.IAM_ENABLE = process.env.NODE_ENV !== 'development'

const loadEnv = (filePath) => {
    if (fs.existsSync(filePath)) {
        dotenvExpand.expand(dotenv.config({
            path: filePath
        }))
    }
}
// 加载 .bk.local.env 文件，优先级最高
loadEnv(path.resolve(__dirname, '../../.bk.local.env'))
// 加载 .bk.{mode}.env 文件，优先级其次
loadEnv(path.resolve(__dirname, `../../.bk.${process.env.NODE_ENV}.env`))
// 加载 .bk.env 文件，优先级最低
loadEnv(path.resolve(__dirname, '../../.bk.env'))
