import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import httpConf from '../../conf/http'
import v3Conf from '../../conf/v3'
import {
    LCDataService,
    TABLE_FILE_NAME
} from './data-service'
// import {
//     Readable
// } from 'stream'

const authorization = {
    bk_app_code: v3Conf.APP_ID,
    bk_app_secret: v3Conf.APP_SECRET
}

/**
 * 通过 ai 生成相应的 json
 * @param {*} bkToken 登录态
 * @param {*} userName 当前用户名
 * @param {*} content 自然语言
 * @returns open ai 返回
 */
export const prompt = async (bkToken, userName, content) => {
    const {
        result,
        data,
        message
    } = await execApiGateWay({
        apiName: 'bk-data-temp',
        path: '/v3/aiops/serving/processing/aiops_official_model_service/execute/',
        method: 'post',
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        data: {
            bkdata_authentication_method: 'token',
            bkdata_data_token: process.env.BK_DATA_DATA_TOKEN,
            bk_app_code: authorization.bk_app_code,
            bk_app_secret: authorization.bk_app_secret,
            [global.AUTH_NAME]: bkToken,
            data: {
                inputs: [
                    {
                        timestamp: +new Date(),
                        action: 'create',
                        object: 'ChatCompletion',
                        input: JSON.stringify(content)
                    }
                ]
            },
            config: {
                timeout: 600,
                stream: false,
                passthrough_input: false,
                predict_args: {
                    service_name: 'openai',
                    service_params: '{"temperature": 0, "max_tokens": 2048, "top_p": 1.0, "frequency_penalty": 0.0, "presence_penalty": 0.0, "stop": ["###"], "model": "gpt-3.5-turbo"}'
                }
            }
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'prod'
    })
    if (result) {
        if (data?.data?.status === 'success') {
            return data?.data?.data?.[0] || {}
        } else {
            throw new Error(data?.message || '调用 aiops 接口失败')
        }
    } else {
        throw new Error(message || '调用 aiops 接口失败')
    }
}

/**
 * 通过 ai 生成相应的 json
 * @param {*} bkToken 登录态
 * @param {*} userName 当前用户名
 * @param {*} content 自然语言
 * @returns openai stream
 */
export const streamPrompt = (bkToken, userName, content) => {
    // const stream = new Readable()
    return execApiGateWay({
        apiName: 'bk-data-temp',
        path: '/v3/aiops/serving/processing/aiops_official_model_service/execute/',
        method: 'post',
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        data: {
            bkdata_authentication_method: 'token',
            bkdata_data_token: process.env.BK_DATA_DATA_TOKEN,
            bk_app_code: authorization.bk_app_code,
            bk_app_secret: authorization.bk_app_secret,
            [global.AUTH_NAME]: bkToken,
            data: {
                inputs: [
                    {
                        timestamp: +new Date(),
                        action: 'create',
                        object: 'ChatCompletion',
                        input: JSON.stringify(content)
                    }
                ]
            },
            config: {
                timeout: 600,
                passthrough_input: false,
                stream: true,
                predict_args: {
                    service_name: 'openai',
                    service_params: '{"temperature": 0, "max_tokens": 2048, "top_p": 1.0, "frequency_penalty": 0.0, "presence_penalty": 0.0, "stop": ["###"], "model": "gpt-3.5-turbo-16k"}'
                }
            }
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'prod',
        config: {
            responseType: 'stream'
        }
    })
}

// 是否在白名单中
export const isInWhiteList = async (userName) => {
    const isAllowed = await LCDataService.findOne(TABLE_FILE_NAME.WHITE_LIST, {
        userName,
        type: 'ai'
    })
    return !!isAllowed
}
