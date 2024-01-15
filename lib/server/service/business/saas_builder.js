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
    // return execApiGateWay({
    //     authorization: {
    //         ...authorization,
    //         [global.AUTH_NAME]: bkToken
    //     },
    //     apiUrlTemp: httpConf.apiGateWayUrlTmpl,
    //     stageName: 'stag',
    //     apiName: 'bkaidev',
    //     path: `/aidev/intelligence/saas_builder/${data.uuid}`,
    //     method: 'post',
    //     data: {
    //         app_definition: `${data.appCode}-${data.moduleCode}`,
    //         session_id: data.uuid,
    //         session_history: [],
    //         config: { app_name: data.appName },
    //     }
    // })
    const response = await axios({
        url: `${process.env.BK_AIDEV_INTELLIGENCE_HOST}/aidev/intelligence/saas_builder/`,
        method: 'POST',
        headers: {
          Cookie: `${global.AUTH_NAME}=${bkToken}`,
        },
        timeout: 30000,
        data: {
            //app_definition: `${data.appCode}-${data.moduleCode}`,
            app_definition: 'default_saas_builder',
            session_id: data.uuid,
            session_history: [],
            config: {
                app_name: data.appName,
                saas_name: data.appCode,
                module_name: data.moduleCode
            },
        }
    });
    if (!response?.result) {
        throw new global.BusinessError(response?.message, response?.code, 200, (new Error()).stack, data);
    }
    return response?.data;
}

export const patchBuilder = async (data, bkToken) => {
    // return execApiGateWay({
    //     authorization: {
    //         ...authorization,
    //         [global.AUTH_NAME]: bkToken
    //     },
    //     apiUrlTemp: httpConf.apiGateWayUrlTmpl,
    //     stageName: 'stag',
    //     apiName: 'bkaidev',
    //     path: `/aidev/intelligence/saas_builder/${data.uuid}/`,
    //     method: 'patch',
    //     data: {
    //         inputs: [
    //             { user_requirement: data.story }
    //         ],
    //         config: {app_name: data.appName},
    //     }
    // })
    const url = `${process.env.BK_AIDEV_INTELLIGENCE_HOST}/aidev/intelligence/saas_builder/${data.uuid}/`
    const params = {
        session_id: data.uuid,
        inputs: [
            { user_requirement: data.story }
        ],
        config: {
            app_name: data.appName,
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
    const options = {
        headers: {
            Cookie: `${global.AUTH_NAME}=${bkToken}`
        },
        timeout: 30000
    }
    const response = await axios.patch(url, params, options)
    if (!response?.result) {
        throw new global.BusinessError(response?.message, response?.code, 200, (new Error()).stack, data);
    }
    console.log(response.result, 'patch builder')
    return response?.data;
}

export const updateBuilder = async (data, bkToken) => {
    const url = `${process.env.BK_AIDEV_INTELLIGENCE_HOST}/aidev/intelligence/saas_builder/${data.uuid}/`
    const params = data.builderDetail
    const options = {
        headers: {
            Cookie: `${global.AUTH_NAME}=${bkToken}`
        },
        timeout: 30000
    }
    const response = await axios.put(url, params, options)
    if (!response?.result) {
        throw new global.BusinessError(response?.message, response?.code, 200, (new Error()).stack, data);
    }
    console.log(response.result, 'put builder')

    // 修改完后执行saasbuilder
    await patchBuilder(data, bkToken)
    return response?.data;
}

export const queryBuilder = async (id, bkToken) => {
    const url = `${process.env.BK_AIDEV_INTELLIGENCE_HOST}/aidev/intelligence/saas_builder/${id}/`
    const response = await axios({
        url,
        method: 'GET',
        headers: {
          Cookie: `${global.AUTH_NAME}=${bkToken}`,
        },
        timeout: 30000
    });
    if (!response?.result) {
        throw new global.BusinessError(response?.message, response?.code, 200, (new Error()).stack, data);
    }
    return response?.data;
    // return execApiGateWay({
    //     authorization: {
    //         ...authorization,
    //         [global.AUTH_NAME]: bkToken
    //     },
    //     apiUrlTemp: httpConf.apiGateWayUrlTmpl,
    //     stageName: 'stag',
    //     apiName: 'bkaidev',
    //     path: `/aidev/intelligence/saas_builder/${id}/`,
    //     method: 'get',
    //     data: {}
    // })
}

