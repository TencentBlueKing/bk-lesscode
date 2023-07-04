import {
    Controller,
    Get,
    Ctx,
    OutputJson
} from '../decorator'
import token from '../conf/token'
const axios = require('axios')
const querystring = require('querystring')
const https = require('https')
const { setRequestContext } = require('../middleware/request-context')

@Controller('/api/user')
export default class UserController {
    @OutputJson()
    @Get('/getUser')
    async getUser (@Ctx() ctx) {
        const { host, header: { referer } } = ctx.request
        const isMobileRequest = referer && referer.includes(host + '/mobile')
        const result = {
            username: ''
        }
        if (isMobileRequest) {
            result.username = ctx.request.header['staffname']
        } else {
            const urlPrefix = process.env.BK_COMPONENT_API_URL
            const bkToken = ctx.cookies.get('bk_token')
            const params = querystring.stringify({
                bk_app_code: token.bk_app_code,
                bk_app_secret: token.bk_app_secret,
                bk_token: bkToken
            })
            const ret = await axios({
                withCredentials: true,
                url: `${urlPrefix}/api/c/compapi/v2/bk_login/get_user/?${params}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: ctx.cookies.request.headers.cookie || ''
                },
                responseType: 'json',
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            })
            const resData = ret.data
            if (resData.code === 0) {
                Object.assign(result, { username: resData?.data?.bk_username })
                setRequestContext(ctx)
                ctx.session.userInfo = result
            } else {
                ctx.status = 401
                ctx.send(resData.data)
                return
            }
        }
        return result
    }
}
