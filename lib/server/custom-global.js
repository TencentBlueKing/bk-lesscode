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
const httpConf = require('./conf/http')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const bkConfig = require('../../bk.config')

/**
 * 业务错误，用于非500错误信息，由接口自行处理错误
 * @param {*} message // 错误的信息，非必填，默认 “服务器出现业务错误”
 * @param {*} code // 错误码，非必填，默认 499
 * @param {*} data // 错误数据，非必填
 */
function BusinessError (message = global.i18n.t('服务器错误'), code = -1, status = 200, stack = (new Error()).stack, data) {
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
// 设置全局变量 apigateway相关接口校验字段，开源/社区版为bk_token， 内部版为bk_ticket
global.AUTH_NAME = httpConf.authName || 'bk_token'
// paasv3内外部的apigw对应code
global.PAASV3_APIGW_CODE = global.AUTH_NAME === 'bk_token' ? 'bkpaas3' : 'paasv3'
// 对paasv3内外部授权的appCode
global.PAASV3_APP_CODE = global.AUTH_NAME === 'bk_token' ? 'bk_paas3' : 'paasv3cli'
// itsm内部版的appcode为bkc-itsm，社区版为bkc-itsm，借助AUTH_NAME做区分
global.ITSM_APP_CODE = global.AUTH_NAME === 'bk_token' ? 'bk-itsm' : 'bkc-itsm'
// 标识是开源版本还是内部版
global.BKPAAS_ENGINE_REGION = global.AUTH_NAME === 'bk_token' ? 'default' : 'ieod'
// 是否开启权限中心
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
// 加载 自定义变量 文件，优先级最高
loadEnv(path.resolve(__dirname, bkConfig.customEnv || ''))
// 加载 .bk.{mode}.env 文件，优先级其次
loadEnv(path.resolve(__dirname, `../../.bk.${process.env.NODE_ENV}.env`))
// 加载 .bk.env 文件，优先级最低
loadEnv(path.resolve(__dirname, '../../.bk.env'))
