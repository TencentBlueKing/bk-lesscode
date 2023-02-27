import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'

/* eslint-disable no-unused-vars */
import { getConnection, getRepository } from 'typeorm'
import Project from '../../model/entities/project'
import userProjectRole from '../../model/entities/user-project-role'
import CompCategory from '../../model/entities/comp-category'
import { getTypeAndVersion } from '../../model/page-comp'
import Layout from '../../model/layout'
import { createV3App } from './v3-service'
import lcCompose from '../../utils/lc-compose'
import * as templateService from './template'
import * as apiService from './api'
import * as dataTableService from './data-table'
import * as pageService from './page'
import * as layoutService from './layout'
import * as routeService from './route'
import * as formService from './nocode-form'
import * as functionService from './function'
import * as variableService from './variable'
import prop from 'lodash/fp/prop'
import map from 'lodash/fp/map'

// 导出应用
export const getExportProjectData = async (projectId, versionId = null) => {
    let page = []
    let route = []
    let pageFunc = []
    let pageComp = []
    let func = []
    let api = []
    let pageTemplate = []
    let layoutInst = []
    const query = {
        projectId,
        deleteFlag: 0
    }
    const queryWithVersion = Object.assign({}, query, { versionId })
    const [
        layoutInstData,
        projectData,
        { list: comp },
        { list: funcGroup },
        { list: funcFunc },
        { list: projectPage },
        { list: pageRoute },
        { list: variable },
        { list: pageTemplateCategory },
        { list: dataTable },
        { list: dataTableModifyRecord },
        { list: apiCategory },
        { list: funcApi },
        { list: form },
        { list: pageVariable },
        { list: funcVariable },
        { list: variableFunc },
        { list: variableVariable }
    ] = await Promise.all([
        Layout.getList(projectId, versionId),
        LCDataService.findOne(TABLE_FILE_NAME.PROJECT, {
            id: projectId
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.COMP,
            query: {
                belongProjectId: projectId,
                deleteFlag: 0
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_GROUP,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_FUNC,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PROJECT_PAGE,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE_ROUTE,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.VARIABLE,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE_TEMPLATE_CATEGORY,
            query: {
                belongProjectId: projectId,
                deleteFlag: 0
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.DATA_TABLE,
            query
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.DATA_TABLE_MODIFY_RECORD,
            query,
            order: {
                id: 'ASC'
            }
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.API_CATEGORY,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_API,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FORM,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE_VARIABLE,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_VARIABLE,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.VARIABLE_FUNC,
            query: queryWithVersion
        }),
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.VARIABLE_VARIABLE,
            query: queryWithVersion
        })
    ])
    // 解析出projectCode、projectName、projectDesc
    const project = { projectCode: projectData.projectCode, projectName: projectData.projectName, projectDesc: projectData.projectDesc }
    // 导出函数
    if (funcGroup.length) {
        const funcGroupIds = funcGroup.map(item => item.id)
        const { list: funcData } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC,
            query: { funcGroupId: funcGroupIds }
        })
        func = funcData || []
    }
    // 导出路由实例，并加上type字段
    if (layoutInstData.length) {
        layoutInst = layoutInstData.map(item => {
            const { defaultPath, defaultName, ...others } = item
            return others
        })
    }
    // 导出页面模板
    if (pageTemplateCategory.length) {
        const templateCategoryIds = await pageTemplateCategory.map(item => item.id)
        const { list: pageTemplateData } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE_TEMPLATE,
            query: { categoryId: templateCategoryIds }
        })
        pageTemplate = (pageTemplateData || []).map(item => ({
            ...item,
            previewImg: ''
        }))
    }
    // 导出页面、页面函数关联、页面组件关联数据、page\pageFunc\pageComp
    if (projectPage.length) {
        const pageIds = projectPage.map(item => item.pageId)
        // page
        const { list: pageData } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE,
            query: { id: pageIds }
        })
        page = (pageData || []).map(item => ({
            ...item,
            previewImg: ''
        }))

        // pageFunc
        const { list: pageFuncData } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE_FUNC,
            query: {
                pageId: pageIds
            }
        })
        pageFunc = pageFuncData || []

        // pageComp, 由于新环境没有本项目的自定义组件，因此需要把组件type跟版本号记录下来,同时把compId跟versionId置为0
        const pageCompData = await getTypeAndVersion(pageIds)
        pageComp = (pageCompData || []).map(item => {
            const { realType, realVersion, ...others } = item
            others.compType = realType || item.compType
            others.compVersion = realVersion || item.compVersion
            others.versionId = 0
            others.compId = 0
            return others
        })
    }

    // pageroute
    if (pageRoute.length) {
        const routeIds = pageRoute.map(item => item.routeId).filter(routeId => (routeId !== -1))
        const { list: routeData } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.ROUTE,
            query: {
                id: routeIds
            }
        })
        route = routeData || []
    }
    if (apiCategory.length) {
        const categoryIds = apiCategory.map(item => item.id)
        const { list: apiData } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.API,
            query: {
                categoryId: categoryIds
            }
        })
        api = apiData || []
    }
    const exportData = {
        project,
        projectPage,
        page,
        pageFunc,
        pageComp,
        pageRoute,
        route,
        layoutInst,
        pageTemplateCategory,
        pageTemplate,
        dataTable,
        dataTableModifyRecord,
        form,
        comp,
        funcGroup,
        func,
        funcFunc,
        apiCategory,
        api,
        funcApi,
        variable,
        funcVariable,
        variableVariable,
        variableFunc,
        pageVariable
    }
    // 把每一项里面的createUser, updateUser, createTime, updateTime字段去掉
    Object.keys(exportData).forEach((key) => {
        if (key !== 'project') {
            exportData[key] = (exportData[key] || []).map(item => {
                const { createUser, updateUser, createTime, updateTime, ...others } = item
                return others
            })
        }
    })
    return exportData
}

// 导入应用
export const importProject = async (projectData, userProjectRoleData, importData, bkTicket) => {
    // 获取连接并创建queryRunner
    const queryRunner = getQueryRunner()
    await queryRunner.connect()

    // 建立生产版本的ctx
    const versionCtx = getVersionContext({ importData, idMap: {}, queryRunner })

    // 开始事务
    await queryRunner.startTransaction()

    // 创建新应用
    const newProject = getRepository(Project).create(projectData)
    const { id: projectId } = await queryRunner.manager.save(newProject)

    // 将新版本ID放入ctx供后续使用
    versionCtx.projectId = projectId
    versionCtx.projectCode = projectData.projectCode
    
    try {
        // 写入user_project_role数据
        userProjectRoleData['projectId'] = projectId
        await queryRunner.manager.save(getRepository(userProjectRole).create(userProjectRoleData))

        // 创建默认组件分类，由于暂不导入组件因此无论是否复制都需创建默认分类
        const compCategory = getRepository(CompCategory).create({
            name: '默认分类',
            belongProjectId: projectId,
            order: -1
        })
        await queryRunner.manager.save(compCategory)

        await projectRunner(versionCtx)

        // 当有配置v3配置文件时，同步创建v3项目
        const res = await createV3App({ projectCode: projectData.projectCode, projectName: projectData.projectName }, bkTicket)
        if (res?.application) {
            const updateProject = {
                id: projectId,
                appCode: projectData.projectCode,
                moduleCode: 'default'
            }
            await queryRunner.manager.save(getRepository(Project).create(updateProject))
        }

        // 提交事务
        await queryRunner.commitTransaction()

        // 成功返回projectId
        return Promise.resolve(projectId)
    } catch (err) {
        // 有错误则回滚
        await queryRunner.rollbackTransaction()
        console.log(err, 'import error')
        return Promise.reject(new Error(err.message || err))
    }
}

const getVersionContext = (properties) => {
    const ctx = Object.create(null)
    for (const [key, value] of Object.entries(properties)) {
        Object.defineProperty(ctx, key, { value })
    }

    return new Proxy(ctx, {
        set: function (obj, prop, value) {
            Object.defineProperty(obj, prop, { value })
            return true
        }
    })
}

const getQueryRunner = () => getConnection().createQueryRunner()

const getImportTask = map(prop('importTask'))

const projectRunner = lcCompose(getImportTask([
    templateService,
    layoutService,
    functionService,
    apiService,
    dataTableService,
    formService,
    pageService,
    routeService,
    variableService
]))
