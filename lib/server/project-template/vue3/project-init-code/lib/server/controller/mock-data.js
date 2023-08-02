import tokenConf from '../conf/token'
import {
    Controller,
    Get,
    Post,
    Ctx,
    OutputJson
} from '../decorator'

function strToJson (str) {
    // eslint-disable-next-line no-new-func
    const json = (new Function('return ' + str))()
    return json
}

@Controller('/api/data')
export default class DataController {
    @OutputJson({ decorator: false })
    @Post('/getApiData')
    async getApiData (@Ctx() ctx) {
        const axiosParam = []
        const { url, type = 'get', withToken = 0, apiData, header = {} } = ctx.request.body || {}
        let hostUrl = ctx.origin
        // 子路径部署的应用，url要拼上子路径
        if (global.AUTH_NAME === 'bk_token') {
            hostUrl = ctx.origin + process.env.BKPAAS_SUB_PATH
        }
        const completeUrl = /^http(s)?\:\/\//.test(url) ? url : hostUrl + url
        axiosParam.push(completeUrl)
        const methodsWithData = ['post', 'put', 'patch']
        const httpData = typeof apiData === 'string' ? strToJson(apiData || '{}') : apiData
        if (methodsWithData.includes(type)) {
            axiosParam.push(httpData)
        } else {
            const urlObj = new URL(completeUrl)
            const keys = Object.keys(httpData)
            keys.forEach((key) => {
                urlObj.searchParams.delete(key)
                urlObj.searchParams.append(key, httpData[key])
            })
            axiosParam[0] = urlObj.href
        }
        // 携带 cookie
        ctx.http.defaults.withCredentials = true
        if (ctx.cookies.request.headers.cookie) ctx.http.defaults.headers.Cookie = ctx.cookies.request.headers.cookie
        // 判断是否携带 token
        const options = {}
        if (withToken) {
            const bkTicket = ctx.cookies.get(global.AUTH_NAME)
            const token = {
                ...tokenConf,
                [global.AUTH_NAME]: bkTicket
            }
            options.headers = {
                'X-BKAPI-AUTHORIZATION': JSON.stringify(token)
            }
        }
        const timezoneOffset = ctx.request.headers['x-timezone-offset']
        if (timezoneOffset) {
            if (!options.headers) options.headers = {}
            options.headers['X-TIMEZONE-OFFSET'] = timezoneOffset
        }
        // 最后 merge header，以用户的为准
        Object.assign(options.headers, header)

        axiosParam.push(options)
        const re = await ctx.http[type](...axiosParam)
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
