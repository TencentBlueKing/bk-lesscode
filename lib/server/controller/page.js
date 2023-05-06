import _ from 'lodash'
import PageModel from '../model/page'
import Page from '../model/entities/page'
import PageComp from '../model/entities/page-comp'
import PageFunc from '../model/entities/page-func'
import PageRoute from '../model/entities/page-route'
import LayoutInst from '../model/entities/layout-inst'
import PageVariable from '../model/entities/page-variable'
import ProjectPage from '../model/entities/project-page'
import { hasRoute, formatRoutePath } from './route'
import { invalidPageIds } from '../system-conf/system'
import { getConnection, getRepository } from 'typeorm'
import OperationLogger from '../service/common/operation-logger'
import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'
import { POST_PAGE_CREATE, PUT_PAGE_UPDATE } from '../system-conf/operate-log'
import { whereVersionLiteral } from '../model/common'
import iamAppPermModel from '../model/iam-app-perm'

const fs = require('fs')

export const getPageList = async (ctx) => {
    try {
        const { projectId, versionId, lite } = ctx.query
        const res = await PageModel.getProjectPages(projectId, versionId)

        let list = res
        if (lite) {
            list = list.map(({ id, pageCode, pageName, pageType }) => ({ id, pageCode, pageName, pageType }))
        }

        ctx.send({
            code: 0,
            message: 'success',
            data: list
        })
    } catch (err) {
        ctx.throwError({
            message: err.message
        })
    }
}

// 创建demo页面
export const createDemoPage = async (data) => {
    try {
        const { projectId, pageData, pageContent } = data
        const projectPageData = {
            projectId
        }

        pageData.pageRoute = formatRoutePath(pageData.pageRoute)
        pageData.pageType = 'PC'

        const layoutInst = await getRepository(LayoutInst).findOne({ where: { projectId, isDefault: 1, deleteFlag: 0 } })

        // 设置默认layout
        pageData.layoutId = layoutInst.id
        // 设置默认lifeCycle
        pageData.lifeCycle = JSON.stringify({
            created: '',
            beforeMount: '',
            mounted: '',
            beforeUpdate: '',
            updated: '',
            activated: '',
            deactivated: '',
            beforeDestroy: '',
            destroyed: ''
        })
        const { id } = await PageModel.createPage(pageData, projectPageData)

        /** 创建demo页的具体内容 */
        const createPageContent = Object.assign(pageContent, { id: id })
        const editPage = getRepository(Page).create(createPageContent)
        await getConnection().transaction(async transactionalEntityManager => {
            const page = await transactionalEntityManager.save(editPage)

            // 处理lifeCycle
            page.lifeCycle = typeof page.lifeCycle === 'string' ? JSON.parse(page.lifeCycle) : page.lifeCycle

            return page
        })
    } catch (err) {
        console.error(err)
    }
}

// 创建default页面
export const createDefaultPage = async (projectId) => {
    try {
        const projectPageData = {
            projectId
        }
        const pageData = {
            pageName: 'home',
            pageCode: 'home',
            pageRoute: '/',
            pageType: 'PC'
        }

        pageData.pageRoute = formatRoutePath(pageData.pageRoute)

        // 始终使用空白布局，通过路径为 / 判定
        const layoutInst = await getRepository(LayoutInst).findOne({ where: { projectId, routePath: '/', deleteFlag: 0 } })

        // 设置默认layout
        pageData.layoutId = layoutInst.id
        // 设置默认lifeCycle
        pageData.lifeCycle = JSON.stringify({
            created: '',
            beforeMount: '',
            mounted: '',
            beforeUpdate: '',
            updated: '',
            activated: '',
            deactivated: '',
            beforeDestroy: '',
            destroyed: ''
        })

        const { id } = await PageModel.createPage(pageData, projectPageData)
        return id
    } catch (err) {
        console.error(err)
    }
}

// 新建页面
export const createPage = async (ctx) => {
    try {
        const { projectId, versionId, pageData, layout } = ctx.request.body
        const projectPageData = {
            projectId,
            versionId
        }

        if (pageData.pageCode && invalidPageIds.includes(pageData.pageCode)) {
            ctx.throw(400, global.i18n.t('页面ID不能为内置关键字'))
        }

        if (pageData.pageCode && !/^[a-z][a-z0-9]{0,60}$/.test(pageData.pageCode)) {
            ctx.throw(400, global.i18n.t('页面ID以小写字母开头，由小写字母与数字组成,少于60个字符'))
        }

        pageData.pageRoute = formatRoutePath(pageData.pageRoute)

        const fullPath = `${layout.routePath}/${pageData.pageRoute}`
        if (await hasRoute({ path: fullPath }, projectId, versionId)) {
            ctx.throw(400, global.i18n.t('该页面路由已存在'))
        }

        // 设置默认layout
        pageData.layoutId = layout.id
        // 设置默认lifeCycle
        pageData.lifeCycle = JSON.stringify({
            created: '',
            beforeMount: '',
            mounted: '',
            beforeUpdate: '',
            updated: '',
            activated: '',
            deactivated: '',
            beforeDestroy: '',
            destroyed: ''
        })

        const { id } = await PageModel.createPage(pageData, projectPageData)
        ctx.send({
            code: 0,
            message: 'success',
            data: id
        })
    } catch (err) {
        ctx.throw(err)
    }
}

// 编辑页面
export const updatePage = async (ctx) => {
    try {
        const { pageData, customCompData, projectId, versionId, pageCode, functionData, templateData, usedVariableMap, pageComponentPermActionMap = {} } = ctx.request.body
        const editPage = getRepository(Page).create(pageData)
        const userInfo = ctx.session.userInfo || {}

        const lockStatus = await getPageLockStatus(ctx, pageData)
        if (lockStatus.isLock && lockStatus.activeUser !== userInfo.username) {
            return ctx.send({
                code: -1,
                message: global.i18n.t('当前画布无编辑权，无法保存')
            })
        }

        await getConnection().transaction(async transactionalEntityManager => {
            await transactionalEntityManager.save(editPage)
            const pageId = pageData.id
            // 页面与自定义组件关联更新
            if (customCompData) {
                const pageCompList = await getRepository(PageComp).find({ where: { pageId } })

                // 待添加的
                const addCompList = customCompData.filter(customComp => {
                    return pageCompList.findIndex(pageComp => {
                        return pageComp.compId === customComp.compId && pageComp.versionId === customComp.versionId
                    }) === -1
                })
                const addCompValues = getRepository(PageComp).create(addCompList.map(item => ({
                    ...item,
                    pageId,
                    projectId,
                    projectVersionId: versionId,
                    createTime: new Date()
                })))
                await transactionalEntityManager.save(addCompValues)

                // 待删除的
                const delCompList = pageCompList.filter(pageComp => {
                    return customCompData.findIndex(customComp => {
                        return pageComp.compId === customComp.compId && pageComp.versionId === customComp.versionId
                    }) === -1
                })
                await transactionalEntityManager.remove(delCompList)
            }

            // 页面与函数关联更新
            if (functionData) {
                const pageFuncList = await getRepository(PageFunc).find({ where: { pageId } })

                // 待添加的
                const addFuncList = functionData.filter(funcId => {
                    return pageFuncList.findIndex(pageFunc => pageFunc.funcId === funcId) === -1
                })
                const addFuncValues = getRepository(PageFunc).create(addFuncList.map(funcId => ({
                    funcId,
                    pageId,
                    projectId,
                    versionId,
                    createTime: new Date()
                })))
                await transactionalEntityManager.save(addFuncValues)

                // 待删除的
                const delFuncList = pageFuncList.filter(pageFunc => {
                    return functionData.findIndex(funcId => pageFunc.funcId === funcId) === -1
                })
                await transactionalEntityManager.remove(delFuncList)
            }

            // 布局模板
            if (templateData) {
                const { layoutId } = await getRepository(PageRoute).findOne({ pageId })
                const layoutInst = await getRepository(LayoutInst).findOne(layoutId)
                layoutInst.content = JSON.stringify(templateData)
                await transactionalEntityManager.save(layoutInst)
            }

            // 页面与变量关联更新
            if (usedVariableMap) {
                const variableIds = Object.keys(usedVariableMap || {})
                // 新增部分
                const addUsedVariableValues = getRepository(PageVariable).create(variableIds.map(variableId => ({
                    projectId,
                    versionId,
                    variableId,
                    pageCode,
                    useInfo: JSON.stringify(usedVariableMap[variableId])
                })))
                // 删除部分
                const deleteUsedVariables = await getRepository(PageVariable).find({
                    where: { projectId, versionId: whereVersionLiteral(versionId), pageCode }
                }) || []

                await Promise.all([transactionalEntityManager.save(addUsedVariableValues), transactionalEntityManager.remove(deleteUsedVariables)])
            }

            // 页面中所有配置了操作权限的数据，存入 iam_app_perm_action 表，便于"应用权限模型"表格统计页面组件引用
            // 组件与操作是多对多的关系，多个页面上的不同组件也可绑定同样的操作，所以这里采用全量更新去重的方式更新数据，先获取再 merge 最后去重插入数据库
            const pageComponentPermActionIdList = Object.keys(pageComponentPermActionMap)
            for (let i = 0; i < pageComponentPermActionIdList.length; i++) {
                const iamPermActionId = parseInt(pageComponentPermActionIdList[i], 10)
                const appPermAction = await iamAppPermModel.getIamAppPermActionById(iamPermActionId)

                const oldData = appPermAction.pageComponentRef

                const insertData = pageComponentPermActionMap[pageComponentPermActionIdList[i]].map(item => {
                    return {
                        pageCode: item.pageCode,
                        componentId: item.componentId
                    }
                })

                // 无数据，第一次，直接插入
                if (!oldData) {
                    await iamAppPermModel.updateIamAppPermAction(iamPermActionId, {
                        pageComponentRef: insertData
                    })
                } else {
                    // 之前有数据，merge 后再去重全量插入，每次都是全量插入

                    // 待插入的数据为空，即表示页面上删除了组件绑定的操作
                    if (!insertData.length) {
                        await iamAppPermModel.updateIamAppPermAction(iamPermActionId, {
                            pageComponentRef: []
                        })
                    } else {
                        const uniqData = _.uniqWith([...oldData, ...insertData], _.isEqual)
                        await iamAppPermModel.updateIamAppPermAction(iamPermActionId, {
                            pageComponentRef: uniqData
                        })
                    }
                }
            }
        })

        const detail = await queryPageDeatail(pageData.id)

        ctx.send({
            code: 0,
            message: 'success',
            data: detail
        })
    } catch (err) {
        ctx.throw(err)
    }
}

// 复制页面
export const copyPage = async (ctx) => {
    try {
        const { projectId, versionId, pageData } = ctx.request.body
        const projectPageData = {
            projectId,
            versionId
        }

        const { id: postId, pageName: postName, pageCode, pageRoute } = pageData
        const prePage = await getRepository(Page).findOne(postId)
        const newPageRoute = formatRoutePath(pageRoute)
        const newPageData = Object.assign(prePage, { pageName: postName, pageCode, pageRoute: newPageRoute, id: undefined })

        // 页面使用的layout
        const { layoutId } = await getRepository(PageRoute).findOne({ pageId: pageData.id })
        const layoutInst = await getRepository(LayoutInst).findOne(layoutId)
        const fullPath = `${layoutInst.routePath}/${newPageData.pageRoute}`

        if (await hasRoute({ path: fullPath }, projectId, versionId)) {
            throw Error(global.i18n.t('该页面路由已存在'))
        }

        newPageData.layoutId = layoutInst.id
        newPageData.activeUser = null
        newPageData.activeTime = null

        const { id } = await PageModel.createPage(newPageData, projectPageData, pageData.id)
        ctx.send({
            code: 0,
            message: 'success',
            data: id
        })
    } catch (err) {
        ctx.throwError({
            message: err.message
        })
    }
}

export const getDeletePageCodes = async (ctx) => {
    try {
        const { projectId, versionId } = ctx.request.query
        const pages = await PageModel.getDeletePageCodes(projectId, versionId)
        const codes = (pages || []).map(item => item.pageCode)
        ctx.send({
            code: 0,
            message: 'success',
            data: codes
        })
    } catch (err) {
        ctx.throwError({
            message: err.message
        })
    }
}

export const detail = async (ctx) => {
}

// 删除页面
export const deletePage = async (ctx) => {
    try {
        const { pageId } = ctx.query
        const pageData = {
            id: parseInt(pageId),
            deleteFlag: 1
        }

        const result = await getConnection().transaction(async transactionalEntityManager => {
            const delPage = getRepository(Page).create(pageData)
            const { id } = await transactionalEntityManager.save(delPage)

            // 删除页面与组件关联记录
            const pageCompList = await getRepository(PageComp).find({ where: { pageId } })
            await transactionalEntityManager.remove(pageCompList)

            // 删除页面与路由关联记录
            const pageRouteList = await getRepository(PageRoute).find({ where: { pageId } })
            const savePageRouteList = pageRouteList.map(item => {
                return {
                    ...item,
                    deleteFlag: 1
                }
            })
            await transactionalEntityManager.save(PageRoute, savePageRouteList)

            // 删除页面与项目关联记录
            const projectPageList = await getRepository(ProjectPage).find({ where: { pageId } })
            const saveProjectPageList = projectPageList.map(item => {
                return {
                    ...item,
                    deleteFlag: 1
                }
            })
            await transactionalEntityManager.save(ProjectPage, saveProjectPageList)

            return id
        })

        ctx.send({
            code: 0,
            message: 'success',
            data: result
        })
    } catch (err) {
        ctx.throwError({
            message: err.message
        })
    }
}

// checkName
export const checkName = async (ctx) => {
    const { pageName, pageCode, projectId, versionId, from } = ctx.request.body
    try {
        let existPageCode
        const existPageName = await PageModel.checkProjectPageExist(projectId, versionId, pageName)
        if (pageCode) {
            existPageCode = await PageModel.checkProjectPageCodeExist(projectId, versionId, pageCode)
        }

        if (existPageName && existPageName.length) {
            ctx.throwError({
                message: global.i18n.t('页面名称“{{n}}”已存在', { n: pageName })
            })
        } else if (existPageCode && existPageCode.length) {
            ctx.throwError({
                message: global.i18n.t('页面ID“{{n}}”已存在', { n: pageCode })
            })
        } else {
            ctx.send({
                code: 0,
                message: 'OK',
                data: null
            })
        }
    } catch (err) {
        const apiKey = from === 'create' ? POST_PAGE_CREATE : PUT_PAGE_UPDATE
        const operationLogger = new OperationLogger(ctx, { apiKey })
        operationLogger.error(err)
        ctx.throwError({
            message: err.message
        })
    }
}

// 页面详情
export const pageDetail = async (ctx) => {
    try {
        const { pageId } = ctx.request.query
        const detail = await queryPageDeatail(pageId)
        ctx.send({
            code: 0,
            message: 'OK',
            data: detail
        })
    } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
    }
}

async function queryPageDeatail (pageId) {
    const queryParams = Object.assign({}, { id: pageId }, { deleteFlag: 0 })
    const detail = await getRepository(Page).findOne(queryParams) || {}
    detail.content = JSON.parse(detail.content || '[]')
    if (detail.lifeCycle) detail.lifeCycle = JSON.parse(detail.lifeCycle)
    if (detail.styleSetting) {
        detail.styleSetting = JSON.parse(detail.styleSetting)
    } else {
        // migration调整
        detail.styleSetting = {
            minWidth: '',
            marginTop: '',
            marginBottom: '',
            marginLeft: '',
            marginRight: '',
            paddingTop: '',
            paddingBottom: '',
            paddingLeft: '',
            paddingRight: '',
            backgroundColor: '',
            customStyle: {}
        }
    }
    // 流程提单页或者流程数据管理页返回流程名称
    if (detail.flowId) {
        const flowDetail = await LCDataService.findOne(
            TABLE_FILE_NAME.FLOW,
            {
                id: detail.flowId
            }
        )
        if (flowDetail) {
            detail.flowName = flowDetail.flowName
        }
    }
    return detail
}

// 导入json文件并返回内容
export const importJson = async (ctx) => {
    try {
        const file = ctx.request.files || {}
        const uploadFile = file.upload_file || {}
        const data = fs.readFileSync(uploadFile.path, 'utf8')
        ctx.send({
            code: 0,
            message: 'OK',
            data
        })
    } catch (err) {
        ctx.throwError({
            message: global.i18n.t('上传失败：{{n}}', { n: err.message })
        })
    }
}

const getPageLockStatus = async (ctx, pageData) => {
    const pageId = ctx.request.query.pageId || ctx.request.body.pageId || pageData.id
    const pageResp = await getRepository(Page).findOne(pageId) || {}
    const { activeUser, activeTime } = pageResp

    const pageLockStatus = {
        isLock: false,
        activeUser: activeUser,
        accessible: false,
        pageId: pageId
    }

    const userInfo = ctx.session.userInfo || {}

    if (activeUser !== null && userInfo.username !== activeUser) {
        const invalidTime = 30 * 60 * 1000
        const accessedTime = 10 * 60 * 1000
        Object.assign(pageLockStatus, {
            isLock: !(new Date().getTime() - new Date(activeTime).getTime() > invalidTime),
            activeUser: activeUser,
            accessible: new Date().getTime() - new Date(activeTime).getTime() > accessedTime
        })
    }

    return pageLockStatus
}

const updagePageActiveInfo = async (pageId, activeUser) => {
    const repository = getRepository(Page)
    const currentPage = await repository.findOne(pageId) || {}

    await repository.update({
        id: currentPage.id
    }, {
        activeUser,
        activeTime: new Date(),
        updateTime: currentPage.updateTime,
        updateUser: currentPage.updateUser
    })
    return currentPage
}

// 获取当前页面状态，是否空闲、可抢占等
export const pageLockStatus = async ctx => {
    try {
        const pageLockStatus = await getPageLockStatus(ctx)

        ctx.send({
            code: 0,
            message: 'OK',
            data: pageLockStatus
        })
    } catch (error) {
        ctx.throwError({
            message: error
        })
    }
}

// 更新当前活跃用户和及活跃时间
export const updatePageActive = async ctx => {
    try {
        const pageId = ctx.request.body.pageId
        const userInfo = ctx.session.userInfo || {}
        const currentPage = await updagePageActiveInfo(pageId, userInfo.username)

        ctx.send({
            code: 0,
            message: 'OK',
            data: {
                activeUser: currentPage.activeUser,
                activeTime: currentPage.activeTime
            }
        })
    } catch (error) {
        ctx.throwError({
            message: error
        })
    }
}

// 抢占画布所有权
export const occupyPage = async ctx => {
    try {
        const curPageStatus = await getPageLockStatus(ctx)
        const userInfo = ctx.session.userInfo || {}
        const { accessible, pageId } = curPageStatus
        if (!accessible) {
            ctx.send({
                code: -1,
                message: global.i18n.t('没有抢占权限')
            })
        }

        const currentPage = await updagePageActiveInfo(pageId, userInfo.username)
        ctx.send({
            code: 0,
            message: 'ok',
            data: {
                activeUser: currentPage.activeUser,
                activeTime: currentPage.activeTime
            }
        })
    } catch (error) {
        ctx.throwError({
            message: error
        })
    }
}

export const releasePage = async ctx => {
    try {
        const { pageId, activeUser } = ctx.request.body
        const repository = getRepository(Page)
        const currentPage = await repository.findOne(pageId) || {}

        if (activeUser === currentPage.activeUser) {
            await repository.update({
                id: currentPage.id
            }, {
                activeUser: null,
                updateTime: currentPage.updateTime,
                updateUser: currentPage.updateUser
            })
            ctx.send({
                code: 0,
                message: global.i18n.t('解锁成功')
            })
        } else {
            ctx.send({
                code: -1,
                message: global.i18n.t('锁定用户与当前用户不一致，无法解锁')
            })
        }
    } catch (error) {
        throw ctx.Erro({
            message: error
        })
    }
}

export const getPreviewImg = async (ctx) => {
    const { id } = ctx.request.query
    let { previewImg } = await PageModel.findPagePreviewImg(id) || {}

    const dataUriPrefix = 'data:image/png;base64,'

    if (!previewImg || !previewImg.startsWith(dataUriPrefix)) {
        // 返回 1×1 px 透明png，用于在前台标记为空区别于加载失败
        previewImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    }

    const imgBase64 = previewImg.replace(dataUriPrefix, '')
    const buf = Buffer.from(imgBase64, 'base64')
    ctx.type = 'image/png'
    ctx.body = buf
}
