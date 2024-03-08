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
            llm: process.env.BK_LLM,
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
        llm: process.env.BK_LLM,
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
        llm: process.env.BK_LLM,
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

const isOnlyComment = (code = '') => {
    const regexSingleComment = /\/\/.*/gm
    const regexMultiComment = /\/\*[\s\S]*?\*\//gm

    let cleaned = code.replace(regexSingleComment, '')
    cleaned = cleaned.replace(regexMultiComment, '')
    return !cleaned.trim() && code.trim()
}

/**
 * code 生成代码
 * @param {*} bkToken 登录态
 * @param {*} prompt 前缀
 * @param {*} promptSuffix 后缀
 * @param {*} lang 语言
 * @returns code
 */
export const code = (bkToken, prompt, promptSuffix, lang) => {
    let scene = 'general_generation'

    if (isOnlyComment(prompt)) {
        scene = 'code_generation'
    }

    return execApiGateWay({
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'prod',
        apiName: 'bkaidev',
        path: '/aidev/intelligence/raw_service/model-self_host-fastcoder-Completion/execute/',
        method: 'post',
        data: {
            data: {
                inputs: [{
                    prompt,
                    prompt_suffix: promptSuffix,
                    lang,
                    scene
                }]
            },
            config: {
                action: 'create'
            }
        }
    })
}

// 是否在白名单中
export const isInWhiteList = async (userName, type = 'ai') => {
    const isAllowed = await LCDataService.findOne(TABLE_FILE_NAME.WHITE_LIST, {
        userName,
        type
    })
    return !!isAllowed
}
