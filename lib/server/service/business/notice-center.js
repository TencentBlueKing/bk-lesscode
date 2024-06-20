import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import httpConf from '../../conf/http'
import v3Conf from '../../conf/v3'

const authorization = {
    bk_app_code: v3Conf.APP_ID,
    bk_app_secret: v3Conf.APP_SECRET
}

export const getCurrentNoticeList = async () => {
    if (!global.NOTICE_CENTER_ENABLE) return []
    const response = await execApiGateWay({
        authorization: {
            ...authorization
        },
        apiUrlTemp: httpConf.apiGateWayUrlTmpl,
        stageName: httpConf.stageName === 'prod' ? 'prod' : 'stage',
        apiName: 'bk-notice',
        path: '/apigw/v1/announcement/get_current_announcements/',
        method: 'get',
        data: { platform: v3Conf.APP_ID }
    })
    return response?.data
}

export const registerNoticeCenter = async () => {
    if (global.NOTICE_CENTER_ENABLE) {
        try {
            const response = await execApiGateWay({
                authorization: {
                    ...authorization
                },
                apiUrlTemp: httpConf.apiGateWayUrlTmpl,
                stageName: httpConf.stageName === 'prod' ? 'prod' : 'stage',
                apiName: 'bk-notice',
                path: '/apigw/v1/register/',
                method: 'post',
                data: {}
            })
            return response?.data
        } catch (err) {
            console.error('register notice center error:\n', err)
            return {
                data: [],
                errorMsg: `register notice center error: ${err}`
            }
        }
    }
}
