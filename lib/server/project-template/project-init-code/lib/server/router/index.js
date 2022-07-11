const KoaRouter = require('koa-router')
const pageRouter = new KoaRouter()

const IS_DEV = process.env.NODE_ENV === 'development'
const pageTemplateName = IS_DEV ? 'index-dev' : 'index'

const staticUrl = process.env.BKPAAS_SUB_PATH ? process.env.BKPAAS_SUB_PATH.substring(0, process.env.BKPAAS_SUB_PATH.length - 1) : ''

const renderParams = {
    SITE_URL: staticUrl,
    BK_STATIC_URL: staticUrl,
    REMOTE_STATIC_URL: process.env.BKPAAS_REMOTE_STATIC_URL || '',
    BKPAAS_ENVIRONMENT: process.env.BKPAAS_ENVIRONMENT
}
// 把所有前端的页面路由都指向 index，为了方便前端 vue router 使用 browserHistory
pageRouter.get('*', async (ctx, next) => {
    const HTTP_X_SCRIPT_NAME = ctx.get('x-script-name')
    if (HTTP_X_SCRIPT_NAME) {
        renderParams['SITE_URL'] = renderParams['BK_STATIC_URL'] = HTTP_X_SCRIPT_NAME.substring(0, HTTP_X_SCRIPT_NAME.length - 1)
    }
    ctx.body = await ctx.render(pageTemplateName, renderParams)
    await next()
})
const routes = [pageRouter.routes()]
const allowedMethods = [pageRouter.allowedMethods()]

const fs = require('fs')
const path = require('path')

// 加载装饰器模式下的路由
const controllerFiles = fs.readdirSync(path.resolve(__dirname, '../controller'))
controllerFiles.forEach((name) => {
    const controller = require(`../controller/${name}`)
    const controllerModule = controller.default || controller
    const hasBasePath = Reflect.hasMetadata('basePath', controllerModule)
    const hasRouter = Reflect.hasMetadata('routes', controllerModule.prototype || controllerModule)
    if (hasBasePath && hasRouter) {
        const basePath = Reflect.getMetadata('basePath', controllerModule)
        const controllerRoutes = Reflect.getMetadata('routes', controllerModule.prototype || controllerModule)
        const router = new KoaRouter({
            prefix: basePath
        })
        controllerRoutes.forEach((route) => {
            router[route.method](route.path, controllerModule.prototype[route.propertyKey])
        })
        routes.push(router.routes())
        allowedMethods.push(router.allowedMethods())
    }
})

exports.routes = routes
exports.allowedMethods = allowedMethods
