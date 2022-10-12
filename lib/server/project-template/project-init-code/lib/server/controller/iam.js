import http from '../util/http'
import { IAM_HOST, IAM_APP_ID, IAM_APP_SECRET, IAM_SYSTEM_ID } from '../conf/iam'
import { IAM_BUILDIN_ACTION, IAM_RESOURCE_TYPE_ID } from '../../shared/constant.js'

/* eslint-disable no-unused-vars */
import { Controller, Ctx, Post } from '../decorator'

/**
 * 生成无权限申请 URL
 */
async function createApplyUrl (ctx, actions = []) {
    try {
        const params = {
            system: IAM_SYSTEM_ID,
            actions
        }

        const res = await http.post(`${IAM_HOST}/api/v1/open/application/`, params, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
        })

        if (!res.result) {
            ctx.throw({
                message: `${res.code}: ${res.message}`
            })
        }

        const data = res.data || {}
        return data.url || ''
    } catch (e) {
        ctx.throw(e)
    }
}

@Controller('/api/iam', { userControl: true })
export default class IamController {
    @Post('/check')
    async check (
        @Ctx() ctx
    ) {
        if (!global.IAM_ENABLE) {
            ctx.send({ code: 0, message: 'OK', data: { allowed: true, pass: true } })
            return
        }

        // 这几个配置中有一个为空，就认为是权限中心配置不正确，不鉴权
        // 当应用未进行部署直接下载源码时，生成项目源码时，这四个配置不会设置
        if (!IAM_HOST || !IAM_APP_ID || !IAM_APP_SECRET || !IAM_SYSTEM_ID) {
            ctx.send({ code: 0, message: 'OK', data: { allowed: true, pass: true } })
            return
        }

        const { action = '', resourceId = '', resourceName = '', needAuth = false } = ctx.request.body

        if (!needAuth) {
            ctx.send({ code: 0, message: 'OK', data: { allowed: true, pass: true } })
            return
        }

        if (action === '' || action === null || action === undefined) {
            ctx.throw({
                message: '权限中心鉴权: 需要 action 参数'
            })
        }

        const userInfo = ctx.session.userInfo

        try {
            const params = {
                system: IAM_SYSTEM_ID,
                subject: {
                    type: 'user',
                    id: userInfo.username
                },
                action: {
                    id: action
                },
                resources: []
            }

            // 后面生成无权限申请 URL 要用到
            const relatedResourceTypes = []

            if (resourceId !== '' && resourceId !== null && resourceId !== undefined) {
                params.resources.push({
                    system: IAM_SYSTEM_ID,
                    type: IAM_RESOURCE_TYPE_ID,
                    id: String(resourceId)
                })

                relatedResourceTypes.push({
                    system: IAM_SYSTEM_ID,
                    type: IAM_RESOURCE_TYPE_ID,
                    instances: [
                        [{ type: IAM_RESOURCE_TYPE_ID, id: String(resourceId) }]
                    ]
                })
            }

            const res = await http.post(`${IAM_HOST}/api/v1/policy/auth`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })

            if (res.code !== 0) {
                ctx.throw({
                    message: `${res.code}: ${res.message}`
                })
            }

            const data = {}
            data.pass = !!((res.data || {}).allowed)

            if (data.pass) {
                ctx.send({ code: 0, message: '', data })
                return
            }

            data.applyUrl = await createApplyUrl(ctx, [
                {
                    id: action,
                    related_resource_types: relatedResourceTypes
                }
            ])

            // 之后内置操作 access_page 才有关联资源
            data.requiredPermissions = [
                {
                    actionName: IAM_BUILDIN_ACTION.access_page[1],
                    relatedResources: [{
                        resourceTypeName: '页面',
                        resourceName: resourceName || `页面_${resourceId}`
                    }]
                }
            ]
            data.permissionType = 'page'

            ctx.send({ code: 403, message: '没有权限，请去权限中心申请权限', data })
        } catch (e) {
            console.error(e)
            throw new global.BusinessError(`iam/check 接口错误: ${e}`, -1, 500)
        }
    }

    @Post('/check-batch')
    async checkBatch (
        @Ctx() ctx
    ) {
        if (!global.IAM_ENABLE) {
            ctx.send({ code: 0, message: 'OK', data: { allowed: true, pass: true } })
            return
        }

        // 这几个配置中有一个为空，就认为是权限中心配置不正确，不鉴权
        // 当应用未进行部署直接下载源码时，生成项目源码时，这四个配置不会设置
        if (!IAM_HOST || !IAM_APP_ID || !IAM_APP_SECRET || !IAM_SYSTEM_ID) {
            ctx.send({ code: 0, message: 'OK', data: { allowed: true, pass: true } })
            return
        }

        const { actions = [] } = ctx.request.body

        if (!actions || !actions.length) {
            ctx.throw({
                message: '权限中心鉴权: 需要 action 参数'
            })
        }

        const userInfo = ctx.session.userInfo

        try {
            const params = {
                system: IAM_SYSTEM_ID,
                subject: {
                    type: 'user',
                    id: userInfo.username
                },
                actions: actions.map(item => {
                    return {
                        id: item
                    }
                }),
                resources: []
            }

            const res = await http.post(`${IAM_HOST}/api/v1/policy/auth_by_actions`, params, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })

            if (res.code !== 0) {
                ctx.throw({
                    message: `${res.code}: ${res.message}`
                })
            }

            const data = res.data || {}
            data.pass = false

            const notPassedActions = actions.filter(item => !data[item]) || []

            // 所有操作都有权限
            if (notPassedActions.length === 0) {
                data.pass = true
                ctx.send({ code: 0, message: '', data })
                return
            }

            data.applyUrl = await createApplyUrl(ctx, notPassedActions.map(item => {
                return {
                    id: item,
                    related_resource_types: []
                }
            }))

            data.requiredPermissions = notPassedActions.map(item => {
                return {
                    actionName: item,
                    relatedResources: []
                }
            })
            ctx.send({ code: 403, message: '没有权限，请去权限中心申请权限', data })
        } catch (e) {
            console.error(e)
            throw new global.BusinessError(`iam/check 接口错误: ${e}`, -1, 500)
        }
    }
}
