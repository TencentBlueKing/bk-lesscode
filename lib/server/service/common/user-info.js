const axios = require('axios')
const querystring = require('querystring')
const httpConf = require('../../conf/http')
const https = require('https')

export const getUserInfoByToken = async (bkToken) => {
    const hostUrl = httpConf.hostUrl.replace(/\/$/, '')
    const params = querystring.stringify({
        bk_app_code: httpConf.appCode,
        bk_app_secret: httpConf.appSecret,
        bk_token: bkToken
    })
    const response = await axios({
        withCredentials: true,
        url: `${hostUrl}/api/c/compapi/v2/bk_login/get_user/?${params}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        responseType: 'json',
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        // 不设置 proxy false 的话，会导致 rejectUnauthorized: false 的设置（忽略 ssl 证书）生效
        proxy: false
    })
    return response
}
