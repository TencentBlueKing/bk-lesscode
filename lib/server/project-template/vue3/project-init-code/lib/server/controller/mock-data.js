import tokenConf from '../conf/token'
import {
    Controller,
    Get,
    Post,
    Ctx,
    OutputJson
} from '../decorator'
import { validateUrl } from '../util/validate-url'

const METHODS_WITH_DATA = ['post', 'put', 'patch']

@Controller('/api/data')
export default class DataController {
    @OutputJson({ decorator: false })
    @Post('/getApiData')
    async getApiData (@Ctx() ctx) {
        const {
            type = 'get',
            withToken = 0,
            apiData = {},
            header = {},
            axiosConfig = {}
        } = ctx.request.body || {}

        let hostUrl = ctx.origin
        // 子路径部署的应用，url要拼上子路径
        if (global.AUTH_NAME === 'bk_token') {
            hostUrl = ctx.origin + process.env.BKPAAS_SUB_PATH
        }

        let url = ctx.request.body?.url
        url = url?.replaceAll('@', '')
        // /开头的是相对路径
        if (url.startsWith('/')) {
            url = hostUrl
        }

        const checkUrl = await validateUrl(url, ctx.origin)

        if (checkUrl?.result !== true) {
            ctx.throwError({
                message: checkUrl?.message || '请求异常'
            })
        }

        // 发送请求的参数
        const httpConf = {
            ...axiosConfig,
            url,
            method: type,
            headers: {
                ...axiosConfig?.headers
            },
            // 不允许重定向
            maxRedirects: 0,
            timeout: 5000
        }

        // 请求携带的数据
        const httpData = apiData
        if (METHODS_WITH_DATA.includes(type)) {
            httpConf.data = httpData
        } else {
            const urlObj = new URL(httpConf.url)
            Object.keys(httpData).forEach((key) => {
                urlObj.searchParams.delete(key)
                urlObj.searchParams.append(key, httpData[key])
            })
            httpConf.url = urlObj.href
        }

        // 携带 cookie
        ctx.http.defaults.withCredentials = true
        if (ctx.cookies.request.headers.cookie) ctx.http.defaults.headers.Cookie = ctx.cookies.request.headers.cookie

        // 携带时区
        const timezoneOffset = ctx.request.headers['x-timezone-offset']
        if (timezoneOffset) {
            httpConf.headers['X-TIMEZONE-OFFSET'] = timezoneOffset
        }

        // 携带 token
        if (withToken) {
            const bkTicket = ctx.cookies.get(global.AUTH_NAME)
            const token = {
                ...tokenConf,
                [global.AUTH_NAME]: bkTicket
            }
            httpConf.headers['X-BKAPI-AUTHORIZATION'] = JSON.stringify(token)
        }
        
        // 最后 merge header，以用户的为准
        Object.assign(httpConf.headers, header || {})

        const re = await ctx.http(httpConf)
        return re.data
    }

    @Get('/getMockData')
    async getMockData (@Ctx() ctx) {
        const { page, pageSize, keyWords } = ctx.request.query || {}
        let count = 200
        let list = []
        for (let i = 0; i < count; i++) {
            list.push({
                id: i,
                projectId: `id-${i}`,
                projectCode: `code-${i}`,
                projectName: `应用-${i}`,
                name: `名称-${i}`
            })
        }
        if (keyWords) {
            list = list.filter(item => item.name.includes(keyWords))
            count = list.length
        }
        if (page && pageSize) {
            const start = (+page - 1) * +pageSize
            const end = +page * +pageSize
            list = list.slice(start, end)
        }
        ctx.body = {
            code: 0,
            message: 'success',
            count,
            data: list
        }
    }
}
