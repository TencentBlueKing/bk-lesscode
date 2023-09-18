import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import httpConf from '../../conf/http'
import v3Conf from '../../conf/v3'
import {
    LCDataService,
    TABLE_FILE_NAME
} from './data-service'

const authorization = {
    bk_app_code: v3Conf.APP_ID,
    bk_app_secret: v3Conf.APP_SECRET
}

export const createChat = (bkToken) => {
    return execApiGateWay({
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'prod',
        apiName: 'bkaidev',
        path: '/aidev/intelligence/chat_completion/',
        method: 'post',
        data: {
            session_id: 'lesscodeAiSession',
            variables: {},
            session_history: [],
            llm: 'openai.ChatCompletion:gpt-4',
            app_collection: 'default_chat_completion'
        }
    })
}

/**
 * 通过 ai 生成相应的 json
 * @param {*} bkToken 登录态
 * @param {*} content 自然语言
 * @returns open ai 返回
 */
export const prompt = async (bkToken, prompts) => {
    const data = {
        session_id: 'lesscodeAiSession',
        session_history: prompts.slice(0, -1),
        chat_prompts: prompts.slice(-1),
        llm: 'openai.ChatCompletion:gpt-4',
        variables: {},
        execute_kwargs: {}
    }
    return execApiGateWay({
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'prod',
        apiName: 'bkaidev',
        path: `/aidev/intelligence/chat_completion/${data.session_id}/`,
        method: 'patch',
        data
    })
}

/**
 * 通过 ai 生成相应的 json
 * @param {*} bkToken 登录态
 * @param {*} userName 当前用户名
 * @param {*} content 自然语言
 * @returns openai stream
 */
export const streamPrompt = (bkToken, prompts) => {
    const data = {
        session_id: 'lesscodeAiSession',
        session_history: prompts.slice(0, -1),
        chat_prompts: prompts.slice(-1),
        llm: 'openai.ChatCompletion:gpt-4',
        variables: {},
        execute_kwargs: {
            stream: true,
            stream_timeout: 20
        }
    }
    return execApiGateWay({
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'prod',
        apiName: 'bkaidev',
        path: `/aidev/intelligence/chat_completion/${data.session_id}/`,
        method: 'patch',
        data,
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
