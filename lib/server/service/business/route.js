import { getRepository, IsNull, In } from 'typeorm'
import Route from '../../model/entities/route'
import PageRoute from '../../model/entities/page-route'

import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'

// 获取项目下对应版本的路由关联记录
const getProjectRouteList = async (projectId, versionId) => getRepository(PageRoute).find({
    where: { projectId, versionId: versionId || IsNull() }
})

const getRouteListByIds = async ids => getRepository(Route).find({ where: { id: In(ids) } })

const getNewRouteEntities = list => getRepository(Route).create(list.map(item => {
    const { id, createTime, updateTime, ...others } = item
    return others
}))

const getNewPageRouteEntities = (list, { projectId, newVersionId, routeIdMap, pageIdMap, layoutIdMap }) => getRepository(PageRoute).create(list.map(item => {
    const { id, createTime, updateTime, ...others } = item
    // 未绑定路由或页面或删除的路由值为-1
    others.routeId = others.routeId !== -1 ? routeIdMap[others.routeId] : -1
    others.pageId = others.pageId !== -1 ? pageIdMap[others.pageId] : -1
    others.redirect = others.redirect ? routeIdMap[others.redirect] : null
    others.layoutId = layoutIdMap[others.layoutId] || 0
    others.projectId = projectId
    others.versionId = newVersionId
    return others
}))

export const versionTask = async (ctx, next) => {
    const { projectId, versionId, newVersionId } = ctx
    const projectRouteList = await getProjectRouteList(projectId, versionId)

    if (!projectRouteList.length) {
        await next()
        return
    }

    const routeIdList = projectRouteList.map(item => item.routeId).filter(routeId => routeId !== -1)
    const routeList = await getRouteListByIds(routeIdList)
    const newRouteList = await ctx.queryRunner.manager.save(getNewRouteEntities(routeList))

    const routeIdMap = {}
    routeIdList.forEach((id, index) => (routeIdMap[id] = newRouteList[index]?.id || 0))

    await next()

    // 此处能保证ctx中依赖的数据都存在，新建页面路由关联记录
    const { pageIdMap = {}, layoutIdMap = {} } = ctx
    if (!routeIdList.length || !Object.keys(pageIdMap).length || !Object.keys(layoutIdMap)) return

    const newProjectRouteEntities = getNewPageRouteEntities(projectRouteList, { projectId, newVersionId, routeIdMap, pageIdMap, layoutIdMap })
    await ctx.queryRunner.manager.save(newProjectRouteEntities)
}

export const importTask = async (ctx, next) => {
    const { projectId, flowPageIdList = [] } = ctx
    const { route = [], pageRoute = [] } = ctx.importData
    const { pageIdMap = {}, layoutIdMap = {} } = ctx.idMap

    await LCDataService.transaction(async (transactionalEntityHelper) => {
        // 新增Route
        const newRouteList = await transactionalEntityHelper.add(
            TABLE_FILE_NAME.ROUTE,
            route.map(item => {
                const { id, ...others } = item
                return others
            })
        )
        
        const routeIdMap = {}
        route.forEach((item, index) => {
            routeIdMap[item.id] = newRouteList[index]?.id || 0
        })
        // 新增pageRoute
        await transactionalEntityHelper.add(
            TABLE_FILE_NAME.PAGE_ROUTE,
            pageRoute.map(item => {
                const { id, ...others } = item
                // 流程页面的路由deleteFlag也设置为1
                others.deleteFlag = flowPageIdList.includes(others.pageId) ? 1 : others.deleteFlag
                // 未绑定路由或页面或删除的路由值为-1
                others.routeId = others.routeId !== -1 ? routeIdMap[others.routeId] : -1
                others.pageId = others.pageId !== -1 ? pageIdMap[others.pageId] : -1
                others.redirect = others.redirect ? routeIdMap[others.redirect] : null
                others.layoutId = layoutIdMap[others.layoutId] || 0
                others.projectId = projectId
                return others
            })
        )
    })
    await next()
}
