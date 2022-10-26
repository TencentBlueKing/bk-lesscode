import {
    Controller,
    Get,
    Ctx,
    OutputJson
} from '../decorator'

const loginUrl = 'http://login.o.oa.com/'
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
            const token = ctx.cookies.get('bk_ticket')
            const ret = await ctx.http.get(`${loginUrl}/user/get_info?bk_ticket=${token}`)
            const resData = ret.data
            if (resData.ret === 0) {
                const { username, avatar_url } = ret.data.data
                Object.assign(result, { username, avatar_url })
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
