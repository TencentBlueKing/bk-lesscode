import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import axios from '../../utils/http'
import httpConf from '../../conf/http'
import v3Conf from '../../conf/v3'

const authorization = {
    bk_app_code: v3Conf.APP_ID,
    bk_app_secret: v3Conf.APP_SECRET
}

export const createBuilder = async (data, bkToken) => {
    console.log(data, 'create')
    const response = await execApiGateWay({
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'stage',
        apiName: 'bkaidev',
        path: `/aidev/intelligence/saas_builder/`,
        method: 'post',
        data: {
            app_definition: 'default_saas_builder',
            session_id: data.uuid,
            session_history: [],
            config: {
                app_name: data.app_name,
                saas_name: data.appCode,
                module_name: data.moduleCode
            }
        }
    })
    return response?.data;
}

export const patchBuilder = async (data, bkToken) => {
    console.log(data, 'patch')
    const params = {
        session_id: data.uuid,
        inputs: [
            { user_requirement: data.story || '' }
        ],
        config: {
            app_name: data.app_name,
            saas_name: data.appCode,
            module_name: data.moduleCode,
            passthrough_input: false,
            stream: false,
            stream_timeout: 5,
            async_process: true,
            include_ops: true,
            retry: data.retry || false
        },
    }
    const response = await execApiGateWay({
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'stage',
        apiName: 'bkaidev',
        path: `/aidev/intelligence/saas_builder/${data.uuid}/`,
        method: 'patch',
        data: params
    })
    console.log(response.result, 'patch builder')
    return response?.data;
}

export const updateBuilder = async (data, bkToken) => {
    const response = await execApiGateWay({
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'stage',
        apiName: 'bkaidev',
        path: `/aidev/intelligence/saas_builder/${data.uuid}/`,
        method: 'put',
        data: data.builderDetail
    })
    console.log(response.result, 'put builder')
    // 修改完后执行saasbuilder
    await patchBuilder(data, bkToken)
    return response?.data;
}

export const queryBuilder = async (id, bkToken) => {
    const response = await execApiGateWay({
        authorization: {
            ...authorization,
            [global.AUTH_NAME]: bkToken
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: 'stage',
        apiName: 'bkaidev',
        path: `/aidev/intelligence/saas_builder/${id}/`,
        method: 'get',
        data: {}
    })
    return response?.data
}

