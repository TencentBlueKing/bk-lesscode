/* eslint-disable no-unused-vars */
import { getRepository, IsNull, In } from 'typeorm'
import Page from '../../model/entities/page'
import ProjectPage from '../../model/entities/project-page'
import PageFunc from '../../model/entities/page-func'
import PageComp from '../../model/entities/page-comp'

import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'

// 获取项目下对应版本的页面关联记录
const getProjectPageList = async (projectId, versionId) => getRepository(ProjectPage).find({
    where: { projectId, versionId: versionId || IsNull() }
})

const getPageListByIds = async ids => getRepository(Page).find({ where: { id: In(ids) } })

const getNewPageEntities = (list, formIdMap) => getRepository(Page).create(list.map(item => {
    const { id, createTime, updateTime, ...others } = item
    if (['FORM', 'FORM_MANAGE'].includes(item.nocodeType) && item.formId) {
        others.formId = formIdMap[item.formId] || 0
    }
    others.activeUser = null
    return others
}))
const getNewProjectPageEntities = (list, { projectId, newVersionId, pageIdMap }) => getRepository(ProjectPage).create(list.map((item) => {
    const { id, createTime, updateTime, ...others } = item
    others.projectId = projectId
    others.versionId = newVersionId
    others.pageId = pageIdMap[others.pageId] || 0
    return others
}))

const getPageFuncListByIds = async ids => getRepository(PageFunc).find({ where: { pageId: In(ids) } })
const getNewPageFuncEntities = (list, { projectId, newVersionId, pageIdMap, funcIdMap }) => getRepository(PageFunc).create(list.map(item => {
    const { id, createTime, updateTime, ...others } = item
    others.pageId = pageIdMap[others.pageId] || 0
    others.funcId = funcIdMap[others.funcId] || 0
    others.projectId = projectId
    others.versionId = newVersionId
    return others
}))

const getPageCompListByIds = async ids => getRepository(PageComp).find({ where: { pageId: In(ids) } })
const getNewPageCompEntities = (list, { projectId, newVersionId, pageIdMap }) => getRepository(PageComp).create(list.map(item => {
    const { id, createTime, updateTime, ...others } = item
    others.pageId = pageIdMap[others.pageId] || 0
    others.projectId = projectId
    others.projectVersionId = newVersionId
    return others
}))

export const versionTask = async (ctx, next) => {
    const { projectId, versionId, newVersionId } = ctx
    const projectPageList = await getProjectPageList(projectId, versionId)

    // 不存在页面数据直接进入下一步骤
    if (!projectPageList.length) {
        await next()
        return
    }

    const pageIdList = projectPageList.map(item => item.pageId)

    const pageList = await getPageListByIds(pageIdList)
    // FORM类型的页面，formId也需要同步更新
    const { formIdMap = {} } = ctx
    const newPageList = await ctx.queryRunner.manager.save(getNewPageEntities(pageList, formIdMap))

    // 建立新老页面id的映射，在布局与路由等页面关联中使用
    const pageIdMap = {}
    pageIdList.forEach((id, index) => {
        pageIdMap[id] = newPageList[index]?.id || 0
    })

    const newProjectPageEntities = getNewProjectPageEntities(projectPageList, { projectId, newVersionId, pageIdMap })
    await ctx.queryRunner.manager.save(newProjectPageEntities)

    // 放入到ctx，在布局与路由等关联中使用
    ctx.pageIdMap = pageIdMap

    await next()

    // 此处能保证ctx中依赖的数据都存在
    const { funcIdMap = {} } = ctx
    if (!pageIdList.length || !Object.keys(funcIdMap).length) return

    // 新建页面函数关联记录
    const pageFuncList = await getPageFuncListByIds(pageIdList)
    const newPageFuncEntities = getNewPageFuncEntities(pageFuncList, { projectId, newVersionId, pageIdMap, funcIdMap })
    await ctx.queryRunner.manager.save(newPageFuncEntities)

    // 新建页面组件关联记录
    const pageCompList = await getPageCompListByIds(pageIdList)
    const newPageCompEntities = getNewPageCompEntities(pageCompList, { projectId, newVersionId, pageIdMap })
    await ctx.queryRunner.manager.save(newPageCompEntities)
}

export const importTask = async (ctx, next) => {
    const { projectId, idMap, importData } = ctx
    const { page = [], projectPage = [], pageFunc = [], pageComp = [] } = importData
    const { formIdMap = {}, funcIdMap = {} } = idMap
    console.log(idMap, 'map')

    const flowPageIdList = []
    const pageIdMap = {}
    await LCDataService.transaction(async (transactionalEntityHelper) => {
        // 新增页面
        const newPageList = await transactionalEntityHelper.add(
            TABLE_FILE_NAME.PAGE,
            page.map(item => {
                const { id, ...others } = item
                others.pageType = item.pageType || 'PC'
                others.flowId = 0
                others.activeUser = null
                // 替换formId
                others.formId = formIdMap[item.formId] || 0
                // 不处理流程类型页面
                if (item.nocodeType === 'FLOW' || item.nocodeType === 'FLOW_MANAGE') {
                    flowPageIdList.push(id)
                    others.deleteFlag = 1
                }
                return others
            })
        )
        
        page.forEach((item, index) => {
            pageIdMap[item.id] = newPageList[index]?.id || 0
        })
        // 新增projectPage
        await transactionalEntityHelper.add(
            TABLE_FILE_NAME.PROJECT_PAGE,
            projectPage.map(item => {
                const { id, ...others } = item
                return {
                    ...others,
                    projectId,
                    pageId: pageIdMap[others.pageId] || 0
                }
            })
        )
        
        // 页面函数关联记录
        if (pageFunc.length) {
            await transactionalEntityHelper.add(
                TABLE_FILE_NAME.PAGE_FUNC,
                pageFunc.map(item => {
                    const { id, ...others } = item
                    return {
                        ...others,
                        projectId,
                        pageId: pageIdMap[others.pageId] || 0,
                        funcId: funcIdMap[others.funcId] || 0
                    }
                })
            )
        }

        // 页面组件关联记录
        if (pageComp.length) {
            await transactionalEntityHelper.add(
                TABLE_FILE_NAME.PAGE_COMP,
                pageComp.map(item => {
                    const { id, ...others } = item
                    return {
                        ...others,
                        projectId,
                        pageId: pageIdMap[others.pageId] || 0
                    }
                })
            )
        }
    })
    ctx.idMap.pageIdMap = pageIdMap
    ctx.flowPageIdList = flowPageIdList
    await next()
}
