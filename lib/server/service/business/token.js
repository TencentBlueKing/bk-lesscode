import v3Config from '../../conf/v3'
import http from '../../utils/http'

/**
 * 生成token，用于和apigateway交互
 */
export const generateToken = async (bkTikcet, appCode) => {
    const headerKey = global.AUTH_NAME === 'bk_ticket' ? 'X-USER-BK-TICKET' : 'X-USER-BK-TOKEN'
    const reData = await http.get(
        `${v3Config.URL_PREFIX}/bkapps/applications/${appCode}/oauth/token/lesscode/?bk_app_code=${v3Config.APP_ID}&bk_app_secret=${encodeURI(v3Config.APP_SECRET)}&${global.AUTH_NAME}=${bkTikcet}`,
        {
            headers: {
                [headerKey]: bkTikcet
            }
        }
    )
    if (!reData.access_token) throw new Error(reData.message || '生成 Token 失败')
    return reData.access_token
}
