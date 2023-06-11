/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
require('reflect-metadata')
require('@babel/register')
// 注入自定义全局对象
require('./custom-global')

const i18next = require('i18next')
const i18m = require('koa-i18next-middleware-fixed')
const enJosn = require('./locales/en.json')
const zhCNJosn = require('./locales/zh-cn.json')

const http = require('http')
const { resolve } = require('path')
const Koa = require('koa')
// const bodyparser = require('koa-bodyparser')
const koaBody = require('koa-body')
const json = require('koa-json')
const session = require('koa-session')
const koaStatic = require('koa-static')
const views = require('co-views')
const koaMount = require('koa-mount')
const chalk = require('chalk')
const { historyApiFallback } = require('koa2-connect-history-api-fallback')
const convert = require('koa-convert')
const promClient = require('prom-client')

const { logger } = require('./logger')
const { getIP } = require('./util')
const { routes, allowedMethods } = require('./router')

const { executeApi } = require('./controller/db-migration-helper')
const { executeIamMigration } = require('./controller/iam-migration-helper')

const authMiddleware = require('./middleware/auth')
const httpMiddleware = require('./middleware/http')
const errorMiddleware = require('./middleware/error')
const jsonSendMiddleware = require('./middleware/json-send')
const { requestContextMiddleware } = require('./middleware/request-context')
const operationLoggerMiddleware = require('./middleware/operation-logger')

const { createConnection } = require('typeorm')
const dataBaseConf = require('./conf/data-base')
const { OrmLog } = require('./logger')

const componentController = require('./controller/component')
const { generateApiGateway, grantApiPermissionForApps } = require('./service/business/open-api')

const SESSION_CONFIG = {
    // cookie key
    key: 'lesscode-session',
    // cookie 的过期时间，毫秒
    maxAge: 86400000,
    // 自动提交到响应头
    autoCommit: true,
    // 是否允许重写
    overwrite: true,
    httpOnly: true,
    // 是否签名
    signed: true,
    // 每次响应时是否刷新 session 的有效期
    rolling: false,
    // 在 session 快过期时是否刷新 session 的有效期
    renew: false
}

const counter = new promClient.Counter({
    name: 'bk_lesscode_http_requests_error_count',
    help: 'Counter for total error requests received',
    labelNames: ['path', 'method', 'status', 'code']
})

const histogram = new promClient.Histogram({
    name: 'bk_lesscode_http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['path', 'method', 'status', 'code'],
    buckets: [50, 100, 250, 500, 750, 1000, 2500, 5000] // buckets 单位 ms
})

const hrtime2ms = (hrtime) => ((hrtime[0] * 1e9) + hrtime[1]) / 1e6

const IS_DEV = process.env.NODE_ENV === 'development'

const lngDetector = new i18m.LanguageDetector()
lngDetector.addDetector({
    name: 'cookieDetector',
    lookup (ctx, options) {
        let found
        if (options.lookupSession && ctx && ctx.sessions) {
            found = ctx.sessions[options.lookupMySession]
        }
        return found
    },

    cacheUserLanguage (ctx, lng, options = {}) {
        if (options.lookupMySession && ctx && ctx.session) {
            ctx.session[options.lookupMySession] = lng
        }
    }
})
i18next.use(lngDetector).init(
    {
        lng: 'zh', // language to use (overrides language detection)
        fallbackLng: 'en', // language to use if translations in user language are not available.
        preload: ['en', 'zh'], // array of languages to preload.
        resources: {
            en: {
                translation: {
                    ...enJosn
                }
            },
            zh: {
                translation: {
                    ...zhCNJosn
                }
            }
        },
        detection: {
            order: [
                'cookie',
                'querystring',
                'path',
                'session',
                'cookieDetector'
            ],
            lookupQuerystring: 'lng',
            lookupParam: 'lng', // for route like: 'path1/:lng/result'
            lookupFromPathIndex: 0,
            lookupCookie: 'blueking_language',
            lookupSession: 'lng',
            lookupMySession: 'lang',
            // cache user language
            caches: ['cookie', 'cookieDetector']
        }
    }
)

async function startServer () {
    // 创建网关
    await generateApiGateway()
    // 默认给itsm授权
    await grantApiPermissionForApps()

    const PORT = IS_DEV ? process.env.BK_APP_PORT - 1 : process.env.BK_APP_PORT

    const app = new Koa()

    // session 加密密钥
    app.keys = ['lesscode login secret']

    app.use(errorMiddleware())
    app.use(session(SESSION_CONFIG, app))

    // 语言环境切换
    app.use(async (ctx, next) => {
        const lang = ctx.cookies.get('blueking_language') === 'en' ? 'en' : 'zh'
        i18next.changeLanguage(lang)
        global.i18n = i18next
        await next()
    })

    app.on('error', (err, ctx) => {
        logger.error('app error:')
        logger.error(err.message || '')
        // {"errno":"ECONNRESET","code":"ECONNRESET","syscall":"read","headerSent":true}
        logger.error(err)

        const labels = {
            path: ctx.path,
            method: ctx.method,
            status: ctx.status,
            code: err.code
        }
        counter.inc(labels, 1)
    })

    // app.use(errorMiddleware())

    // 监控指标中间件
    app.use(async (ctx, next) => {
        if (ctx.path === '/metrics') {
            ctx.set('Content-Type', promClient.register.contentType)
            ctx.body = await promClient.register.metrics()
            return
        }

        const start = process.hrtime() // 开始时间
        try {
            await next()
        } finally {
            // 只统计接口
            if (/^\/api\//.test(ctx.path)) {
                // 请求处理时间
                const dur = hrtime2ms(process.hrtime(start))
                const labels = {
                    path: ctx.path,
                    method: ctx.method,
                    status: ctx.status
                }
                // 统计响应时间
                histogram.observe(labels, dur)
            }
        }
    })

    // 自定义组件注册
    app.use(async (ctx, next) => {
        if (/component\/register\.js/.test(ctx.url)) {
            // 编辑页面注册自定义组件
            await componentController.register(ctx)
        } else if (/component\/preview-register\.js/.test(ctx.url)) {
            // 预览页面注册自定义组件
            await componentController.previewRegister(ctx)
        } else {
            await next()
        }
    })

    app.use(koaBody(
        {
            multipart: true,
            formidable: {
                maxFileSize: 1000 * 1024 * 1024 // 设置上传文件大小最大限制，默认10M
            },
            formLimit: '10mb',
            jsonLimit: '10mb',
            textLimit: '10mb'
        }
    ))
    app.use(json())

    app.use(httpMiddleware())
    app.use(jsonSendMiddleware())
    app.use(authMiddleware().unless({ path: [/^\/api\/open\//, /^\/api\/iam\//] }))
    app.use(requestContextMiddleware())
    app.use(operationLoggerMiddleware())
    // csp
    // app.use(helmet({
    //     referrerPolicy: { policy: "origin" }
    // }))

    app.use(koaMount(
        '/static', koaStatic(resolve(__dirname, '..', IS_DEV ? 'client/static' : 'client/dist/static')))
    )

    app.use(convert.compose(routes))
    app.use(convert.compose(allowedMethods))

    app.context.render = views(resolve(__dirname, '..', IS_DEV ? 'client' : 'client/dist'), {
        map: { html: 'swig' }
    })

    app.use(historyApiFallback({
        verbose: false,
        whiteList: ['/api'],
        rewrites: [
            {
                // connect-history-api-fallback 默认会对 url 中有 . 的 url 当成静态资源处理而不是当成页面地址来处理
                // from: /\d+\.\d+\.\d+\.\d+$/,
                from: /\/(\d+\.)*\d+$/,
                to: '/'
            },
            {
                // connect-history-api-fallback 默认会对 url 中有 . 的 url 当成静态资源处理而不是当成页面地址来处理
                from: /\/\/+.*\..*\//,
                to: '/'
            }
        ]
    }))

    const server = http.createServer(app.callback())
    server.listen(PORT)

    server.on('error', error => {
        if (error.syscall !== 'listen') {
            throw error
        }

        const bind = typeof PORT === 'string' ? ('Pipe ' + PORT) : 'Port ' + PORT

        switch (error.code) {
            case 'EACCES':
                logger.error(bind + ' requires elevated privileges')
                process.exit(1)
            case 'EADDRINUSE':
                logger.error(bind + ' is already in use')
                process.exit(1)
            default:
                throw error
        }
    })

    server.on('listening', async () => {
        const addr = server.address()
        console.log(chalk.cyan(
            'Listening at http://localhost:' + addr.port + ' or http://' + getIP() + ':' + addr.port + '\n'
        ))
    })

    // 进程级捕获 ECONNRESET 异常
    process.on('uncaughtException', function (err) {
        logger.error('uncaughtException:')
        logger.error(err.stack)
        logger.error('not exit...')
    })
}

// 自动执行接口变更操作
async function execSql (connection, callBack) {
    try {
        // 导入资源时，设置默认语言
        i18next.changeLanguage(global.IMPORT_LANG || 'zh')
        global.i18n = i18next
        
        // 自动执行接口刷数据
        await executeApi()
        if (global.IAM_ENABLE) {
            await executeIamMigration()
        }
        callBack()
        return
    } catch (err) {
        logger.error(err.message || err)
    }
}

const config = process.env.NODE_ENV === 'production' ? dataBaseConf.prod : dataBaseConf.dev
const ormConfig = {
    type: config.dialect,
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    entities: [resolve(__dirname, '.', 'model/entities/!(base){.js,.ts}')],
    // 打印日志的类型
    logger: new OrmLog(config.logging),
    // 自动同步数据库表结构，有删除数据风险，推荐关闭
    synchronize: false,
    // 会自动执行更新SQL，推荐手动执行脚本，关闭该选项
    migrationsRun: false,
    extra: {
        connectionLimit: 5
    }
}

createConnection(ormConfig).then((connection) => {
    return execSql(connection, startServer)
}).catch((err) => logger.error(err.message || err))
