import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk';
import {
    isEmpty
} from '../../../shared/util';
import httpConf from '../../conf/http';
import v3Conf from '../../conf/v3';

const authorization = {
    bk_app_code: v3Conf.APP_ID,
    bk_app_secret: v3Conf.APP_SECRET
}

/**
 * 通过 ai 生成相应的 json
 * @param {*} bkToken 
 * @param {*} userName 当前用户名
 * @param {*} content 自然语言
 * @returns open ai 返回
 */
export const prompt = async (bkToken, userName, content) => {
    if (!isInWhiteList(userName)) {
        throw new Error('当前用户不在白名单内，无法使用 AI 相关功能')
    }
    const {
        result,
        data,
        message
    } = await execApiGateWay({
        apiName: 'bk-data',
        path: '/v3/aiops/serving/processing/aiops_openai_service/execute/',
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
                predict_args: {
                    service_params: "{\"temperature\": 0, \"max_tokens\": 2048, \"top_p\": 1.0, \"frequency_penalty\": 0.0, \"presence_penalty\": 0.0, \"stop\": [\"###\"], \"model\": \"gpt-3.5-turbo\"}"
                }
            }
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: httpConf.stageName === 'prod' ? 'dev' : 'prod'
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

// 是否在白名单中
export const isInWhiteList = (userName) => {
    const whiteList = process.env?.BK_AI_WHITE_LIST?.split(';') || []
    return whiteList.includes(userName) && !isEmpty(userName)
}
