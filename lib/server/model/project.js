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
import { getConnection, getRepository } from 'typeorm'
import { invalidProjectIds } from '../system-conf/system'
import Project from './entities/project'
import Page from './entities/page'
import PageFunc from './entities/page-func'
import Comp from './entities/comp'
import CompCategory from './entities/comp-category'
import PageTemplate from './entities/page-template'
import TemplateCategory from './entities/page-template-category'
import UserProjectRole from './entities/user-project-role'
import CompShare from './entities/comp-share'
import PageComp from './entities/page-comp'
import ProjectPage from './entities/project-page'
import ProjectFavourite from './entities/project-favourite'
import FuncGroup from './entities/func-group'
import Func from './entities/func'
import Route from './entities/route'
import PageRoute from './entities/page-route'
import LayoutInst from './entities/layout-inst'
import Variable from './entities/variable'
import PageVariable from './entities/page-variable'
import FuncVariable from './entities/func-variable'
import VariableFunc from './entities/variable-func'
import VariableVariable from './entities/variable-variable'
import FuncFunc from './entities/func-func'
import DataTable from './entities/data-table'
import Form from './entities/form'
import DataTableModifyRecord from './entities/data-table-modify-record'
import ApiCategory from './entities/api-category'
import Api from './entities/api'
import FuncApi from './entities/func-api'
import { RequestContext } from '../middleware/request-context'
import { enablePerviewDb, getPreviewDbConfig } from '../service/business/preview-db-service'
import DBEngineService from '../service/common/db-engine-service'
import { whereVersionLiteral, whereVersion } from './common'

import { createV3App } from '../service/business/v3-service'

const { CODE } = require('../util')

const projectSelectFields = [
    'project.id',
    'project.projectCode',
    'project.projectName',
    'project.projectDesc',
    'project.status',
    'project.isOffcial',
    'project.offcialType',
    'project.templateImg',
    'project.createTime',
    'project.createUser',
    'project.deleteFlag',
    'project.isEnableDataSource'
]

const getDefaultFunc = function (options) {
    return [
        {
            funcName: 'getMockData',
            funcBody: 'return this.$http.get(\'/data/getMockData\').then((res) => {\r\n    const data = JSON.stringify(res)\r\n    alert(data)\r\n    return res.data\r\n})\r\n',
            funcSummary: global.i18n.t('获取mock数据'),
            funcType: 0,
            funcCode: 'getMockData',
            ...options
        },
        {
            funcName: 'getApiData',
            remoteParams: 'res',
            funcBody: 'const data = res.data || []\r\nreturn data\r\n',
            funcSummary: global.i18n.t('远程函数，获取数据'),
            funcType: 1,
            funcMethod: 'get',
            funcApiUrl: '/api/data/getMockData',
            funcApiData: '{ \"page\": 1, \"pageSize\": 20 }',
            funcCode: 'getApiData',
            ...options
        }
    ]
}

export default {
    getDataByIds: async function (params = []) {
        const res = await getRepository(Project)
            .createQueryBuilder('project')
            .select('project.*')
            .where('project.id IN (:...ids)', { ids: params })
            .getRawMany()
        return res
    },

    createProject (projectData, userProjectRoleData, layoutData, bkTicket) {
        const project = getRepository(Project).create(projectData)

        return getConnection().transaction(async transactionalEntityManager => {
            // 创建项目基本信息记录
            const { id: projectId, projectCode } = await transactionalEntityManager.save(project)

            // 创建用户项目角色关联记录
            userProjectRoleData.projectId = projectId
            const userProjectRole = getRepository(UserProjectRole).create(userProjectRoleData)
            await transactionalEntityManager.save(userProjectRole)

            // 创建默认组件分类，由于暂不复制组件因此无论是否复制都需创建默认分类
            const compCategory = getRepository(CompCategory).create({
                name: global.i18n.t('默认分类'),
                belongProjectId: projectId,
                order: -1
            })
            await transactionalEntityManager.save(compCategory)

            // 复制项目
            if (projectData.copyFrom) {
                const whereCopyForm = { projectId: projectData.copyFrom }

                // 复制项目的默认版本，当资源数据有做版本控制时使用此条件
                const whereWithDefaultVersion = { projectId: projectData.copyFrom, versionId: whereVersionLiteral(null) }
                const defaultVersionId = null

                const [
                    projectCompCopyValues,
                    projectFuncGroupCopyValues,
                    projectPageCopyValues,
                    projectRouteCopyValues,
                    projectLayoutValues,
                    variableList,
                    templateCategoryValues,
                    projectDataTables,
                    apiCategoryList,
                    formValues
                ] = await Promise.all([
                    getRepository(Comp)
                        .createQueryBuilder('comp')
                        .where('comp.belongProjectId = :projectId', whereCopyForm)
                        .getMany(),
                    getRepository(FuncGroup)
                        .createQueryBuilder('funcGroup')
                        .where('funcGroup.projectId = :projectId', whereCopyForm)
                        .andWhere(whereVersion(defaultVersionId, 'funcGroup'))
                        .getMany(),
                    getRepository(ProjectPage)
                        .createQueryBuilder('projectPage')
                        .where('projectPage.projectId = :projectId', whereCopyForm)
                        .andWhere(whereVersion(defaultVersionId, 'projectPage'))
                        .getMany(),
                    getRepository(PageRoute)
                        .createQueryBuilder('pageRoute')
                        .where('pageRoute.projectId = :projectId', whereCopyForm)
                        .andWhere(whereVersion(defaultVersionId, 'pageRoute'))
                        .getMany(),
                    getRepository(LayoutInst)
                        .createQueryBuilder('layoutInst')
                        .where('layoutInst.projectId = :projectId', whereCopyForm)
                        .andWhere(whereVersion(defaultVersionId, 'layoutInst'))
                        .getMany(),
                    getRepository(Variable)
                        .createQueryBuilder('variable')
                        .where('variable.projectId = :projectId', whereCopyForm)
                        .andWhere(whereVersion(defaultVersionId, 'variable'))
                        .getMany(),
                    getRepository(TemplateCategory)
                        .createQueryBuilder('pageTemplateCategory')
                        .where('pageTemplateCategory.belongProjectId = :projectId', whereCopyForm)
                        .getMany(),
                    getRepository(DataTable)
                        .createQueryBuilder('dataTable')
                        .where('dataTable.projectId = :projectId', whereCopyForm)
                        .getMany(),
                    getRepository(ApiCategory)
                        .createQueryBuilder('apiCategory')
                        .where('apiCategory.projectId = :projectId', whereCopyForm)
                        .andWhere(whereVersion(defaultVersionId, 'apiCategory'))
                        .getMany(),
                    getRepository(Form)
                        .createQueryBuilder('form')
                        .where('form.projectId = :projectId', whereCopyForm)
                        .andWhere(whereVersion(defaultVersionId, 'form'))
                        .getMany()
                ])

                if (projectCompCopyValues.length) {
                    const copmIdList = projectCompCopyValues.map(item => item.id)
                    // 新建组件共享记录，复制项目则项目下的组件全部对目标项目公开
                    const saveCompShares = getRepository(CompShare).create(copmIdList.map(compId => {
                        return {
                            compId,
                            sourceProjectId: projectData.copyFrom,
                            targetProjectId: projectId
                        }
                    }))
                    await transactionalEntityManager.save(saveCompShares)

                    // 公开给源项目的组件需要公开给新项目
                    const sourceCompShareList = await getRepository(CompShare).find({
                        where: { targetProjectId: projectData.copyFrom }
                    })
                    const saveTargetCompShares = getRepository(CompShare).create(sourceCompShareList.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.targetProjectId = projectId
                        return others
                    }))
                    await transactionalEntityManager.save(saveTargetCompShares)
                }

                // 模板分类和模板数据记录
                if (templateCategoryValues.length) {
                    const categoryIdMap = {}
                    const categoryIdList = templateCategoryValues.map(item => item.id)
                    const saveTemplateCategory = getRepository(TemplateCategory).create(templateCategoryValues.map(item => {
                        const { id, createTime, updateTime, createUser, ...others } = item
                        others.belongProjectId = projectId
                        return others
                    }))
                    const newTemplateCategory = await transactionalEntityManager.save(saveTemplateCategory)
                    categoryIdList.forEach((id, index) => {
                        categoryIdMap[id] = newTemplateCategory[index]?.id || 0
                    })

                    const copyTemplates = await getRepository(PageTemplate)
                        .createQueryBuilder('pageTemplate')
                        .where('pageTemplate.categoryId IN (:...categoryIds)', { categoryIds: categoryIdList })
                        .andWhere('pageTemplate.isOffcial = 0')
                        .getMany()

                    const saveCopyTemplates = getRepository(PageTemplate).create(copyTemplates.map(item => {
                        const { id, createTime, updateTime, createUser, ...others } = item
                        others.categoryId = categoryIdMap[others.categoryId] || 0
                        others.belongProjectId = projectId
                        return others
                    }))
                    await transactionalEntityManager.save(saveCopyTemplates)
                }

                const funcIdMap = {}
                if (projectFuncGroupCopyValues.length) {
                    const funcGroupIdList = projectFuncGroupCopyValues.map(item => item.id)
                    // 得到要复制的主体数据
                    const copyFuncs = await getRepository(Func)
                        .createQueryBuilder('func')
                        .where('func.funcGroupId IN (:...funcGroupIds)', { funcGroupIds: funcGroupIdList })
                        .getMany()

                    // 新建函数组主体数据
                    const saveCopyFuncGroups = getRepository(FuncGroup).create(projectFuncGroupCopyValues.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.projectId = projectId
                        return others
                    }))
                    const newFuncGroupList = await transactionalEntityManager.save(saveCopyFuncGroups)

                    // 复制出的新函数中的分组id需要与新添加的函数组id对应
                    const funcGroupIdMap = {}
                    funcGroupIdList.forEach((id, index) => {
                        funcGroupIdMap[id] = newFuncGroupList[index]?.id || 0
                    })
                    // 新建函数主体数据
                    const saveCopyFuncs = getRepository(Func).create(copyFuncs.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.funcGroupId = funcGroupIdMap[others.funcGroupId] || 0
                        others.projectId = projectId
                        return others
                    }))

                    const newFuncList = await transactionalEntityManager.save(saveCopyFuncs)
                    copyFuncs.forEach((item, index) => {
                        funcIdMap[item.id] = newFuncList[index]?.id || 0
                    })

                    // 新建函数和函数关联关系
                    const copyFuncFuncs = await getRepository(FuncFunc)
                        .createQueryBuilder('funcFunc')
                        .where('funcFunc.projectId = :projectId', whereCopyForm)
                        .andWhere(whereVersion(defaultVersionId, 'funcFunc'))
                        .getMany()
                    const newFuncFuncs = getRepository(FuncFunc).create(copyFuncFuncs.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.projectId = projectId
                        return others
                    }))
                    await transactionalEntityManager.save(newFuncFuncs)
                }

                const layoutIdMap = {}
                if (projectLayoutValues.length) {
                    const saveCopyLayouts = getRepository(LayoutInst).create(projectLayoutValues.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.projectId = projectId
                        return others
                    }))
                    const newLayoutList = await transactionalEntityManager.save(saveCopyLayouts)
                    projectLayoutValues.forEach((item, index) => {
                        layoutIdMap[item.id] = newLayoutList[index]?.id || 0
                    })
                }

                const formIdMap = {}
                if (projectDataTables.length) {
                    // 开启数据源
                    await enablePerviewDb(projectId, projectId + projectCode)

                    project.isEnableDataSource = 1
                    await transactionalEntityManager.save(project)
                    // 新建数据源表结构
                    const copyDataTables = getRepository(DataTable).create(projectDataTables.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.projectId = projectId
                        return others
                    }))
                    const newDataTables = await transactionalEntityManager.save(copyDataTables)
                    const dataTableIdMap = {}
                    newDataTables.forEach((newDataTable, index) => {
                        dataTableIdMap[projectDataTables[index]?.id] = newDataTable.id
                    })

                    // 新建数据源表变更记录
                    const copyDataTableModifyRecords = await getRepository(DataTableModifyRecord)
                        .createQueryBuilder('dataTableModifyRecord')
                        .where('dataTableModifyRecord.projectId = :projectId', whereCopyForm)
                        .getMany()

                    const currentTime = +new Date()
                    const newDataTableModifyRecords = getRepository(DataTableModifyRecord).create(copyDataTableModifyRecords.map((item, index) => {
                        const { id, tableId, createTime, updateTime, ...others } = item
                        // 由于事务一次性提交，但是表实际上不是一次性创建好
                        const tableRecordTime = new Date(currentTime + index * 1000)
                        others.createTime = tableRecordTime
                        others.updateTime = tableRecordTime
                        others.projectId = projectId
                        others.tableId = dataTableIdMap[tableId]
                        return others
                    }))
                    await transactionalEntityManager.save(newDataTableModifyRecords)

                    // 执行表变更sql
                    const previewDbConfig = await getPreviewDbConfig(projectId)
                    const dbEngine = new DBEngineService(previewDbConfig)
                    let sql = ''
                    newDataTableModifyRecords.forEach((newDataTableModifyRecord) => {
                        sql += newDataTableModifyRecord.sql
                    })
                    await dbEngine.execMultSql(sql)

                    // 复制form表，并变更page表的formId
                    if (formValues.length) {
                        const formIdList = formValues.map(item => item.id)
                        const saveForm = getRepository(Form).create(formValues.map(item => {
                            const { id, createTime, updateTime, createUser, ...others } = item
                            others.projectId = projectId
                            // others.dataSourceId = dataTableIdMap[others.dataSourceId]
                            return others
                        }))
                        const newForm = await transactionalEntityManager.save(saveForm)
                        formIdList.forEach((id, index) => {
                            formIdMap[id] = newForm[index]?.id || 0
                        })
                    }
                }

                const pageIdMap = {}
                const flowPageIdList = []
                if (projectPageCopyValues.length) {
                    // 复制应用时不复制流程相关页面
                    const pageIdList = projectPageCopyValues.map(item => item.pageId)
                    let copyPages = await getRepository(Page)
                        .createQueryBuilder('page')
                        .where('page.id IN (:...ids)', { ids: pageIdList })
                        .getMany()
                    // 将deleteFlag置为-1，并记录在flowPageIds里面不能直接删除，否则路由生成源码时找不到pageCode相应记录会报错
                    copyPages = copyPages.map(item => {
                        let deleteFlag = item.deleteFlag
                        if (item.nocodeType === 'FLOW' || item.nocodeType === 'FLOW_MANAGE') {
                            flowPageIdList.push(item.id)
                            deleteFlag = 1
                        }
                        return {
                            ...item,
                            deleteFlag
                        }
                    })

                    const copyPageFuncs = await getRepository(PageFunc)
                        .createQueryBuilder('pageFuncs')
                        .where('pageFuncs.pageId IN (:...pageIds)', { pageIds: pageIdList })
                        .getMany()

                    // 先新建页面主体数据，再新建关联关系数据
                    const saveCopyPages = getRepository(Page).create(copyPages.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.formId = formIdMap[item.formId] || null
                        return others
                    }))
                    const newPageList = await transactionalEntityManager.save(saveCopyPages)
                    // r_project_page里面复制也过滤流程相关记录
                    const projectPageValues = getRepository(ProjectPage).create(projectPageCopyValues.map((item, index) => {
                        const { id, createTime, updateTime, ...others } = item
                        others.projectId = projectId
                        others.pageId = newPageList[index]?.id || 0
                        return others
                    }))
                    await transactionalEntityManager.save(projectPageValues)

                    // 建立新老页面id的映射
                    pageIdList.forEach((id, index) => {
                        pageIdMap[id] = newPageList[index]?.id || 0
                    })
                    // 新建页面函数关联记录
                    if (Object.keys(funcIdMap).length) {
                        const saveCopyPageFuncs = getRepository(PageFunc).create(copyPageFuncs.map(item => {
                            const { id, createTime, updateTime, ...others } = item
                            others.pageId = pageIdMap[others.pageId] || 0
                            others.funcId = funcIdMap[others.funcId] || 0
                            others.projectId = projectId
                            return others
                        }))
                        await transactionalEntityManager.save(saveCopyPageFuncs)
                    }

                    // 新建页面组件关联记录
                    const copyPageComps = await getRepository(PageComp)
                        .createQueryBuilder('pageComp')
                        .where('pageComp.pageId IN (:...pageIds)', { pageIds: pageIdList })
                        .getMany()
                    const saveCopyPageComps = getRepository(PageComp).create(copyPageComps.map((item, index) => {
                        const { id, createTime, updateTime, ...others } = item
                        others.pageId = pageIdMap[others.pageId] || 0
                        others.projectId = projectId
                        return others
                    }))
                    await transactionalEntityManager.save(saveCopyPageComps)
                }

                // 项目路由记录
                if (projectRouteCopyValues.length) {
                    const routeIdList = projectRouteCopyValues.map(item => item.routeId).filter(routeId => routeId !== -1)
                    const copyRoutes = await getRepository(Route)
                        .createQueryBuilder('route')
                        .where('route.id IN (:...ids)', { ids: routeIdList })
                        .getMany()

                    const saveCopyRoutes = getRepository(Route).create(copyRoutes.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        return others
                    }))
                    const newRouteList = await transactionalEntityManager.save(saveCopyRoutes)
                    const routeIdMap = {}
                    routeIdList.forEach((id, index) => {
                        routeIdMap[id] = newRouteList[index]?.id || 0
                    })

                    const saveCopyProjectRoutes = getRepository(PageRoute).create(projectRouteCopyValues.map((item, index) => {
                        const { id, createTime, updateTime, ...others } = item
                        // 流程页面的路由deleteFlag也设置为1
                        others.deleteFlag = flowPageIdList.includes(others.pageId) ? 1 : others.deleteFlag
                        // 未绑定路由或页面或删除的路由值为-1
                        others.routeId = others.routeId !== -1 ? routeIdMap[others.routeId] : -1
                        others.pageId = others.pageId !== -1 ? pageIdMap[others.pageId] : -1
                        others.redirect = others.redirect ? routeIdMap[others.redirect] : null
                        others.layoutId = layoutIdMap[others.layoutId]
                        others.projectId = projectId
                        return others
                    }))
                    await transactionalEntityManager.save(saveCopyProjectRoutes)
                }
                // 复制 api
                if (apiCategoryList.length) {
                    // 复制 api 分类
                    const saveCopyApiCategoryList = getRepository(ApiCategory).create(apiCategoryList.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.projectId = projectId
                        return others
                    }))
                    const newApiCategoryList = await transactionalEntityManager.save(saveCopyApiCategoryList)

                    // 复制出的分组id需要与新添加的组id对应
                    const apiCategoryIdList = apiCategoryList.map(category => category.id)
                    const apiCategoryIdMap = {}
                    apiCategoryIdList.forEach((id, index) => {
                        apiCategoryIdMap[id] = newApiCategoryList[index]?.id || 0
                    })

                    // 复制 api
                    const copyApiList = await getRepository(Api)
                        .createQueryBuilder('api')
                        .where('api.categoryId IN (:...categoryId)', { categoryId: apiCategoryIdList })
                        .getMany()
                    const saveCopyApiList = getRepository(Api).create(copyApiList.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.categoryId = apiCategoryIdMap[others.categoryId]
                        others.projectId = projectId
                        return others
                    }))
                    await transactionalEntityManager.save(saveCopyApiList)
                    // 新建函数和api关联关系
                    const copyFuncApiList = await getRepository(FuncApi)
                        .createQueryBuilder('funcApi')
                        .where('funcApi.projectId = :projectId', whereCopyForm)
                        .andWhere(whereVersion(defaultVersionId, 'funcApi'))
                        .getMany()
                    const newFuncApiList = getRepository(FuncApi).create(copyFuncApiList.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.projectId = projectId
                        return others
                    }))
                    await transactionalEntityManager.save(newFuncApiList)
                }

                if (variableList.length) {
                    const saveVariableList = getRepository(Variable).create(variableList.map(item => {
                        const { id, createTime, updateTime, ...others } = item
                        others.projectId = projectId
                        return others
                    }))
                    const newVariableList = await transactionalEntityManager.save(saveVariableList)
                    // 建立新老变量id的映射
                    const variableIdMap = {}
                    variableList.forEach(({ id }, index) => {
                        variableIdMap[id] = newVariableList[index]?.id || 0
                    })
                    const where = whereWithDefaultVersion
                    const [pageVariableList, funcVariableList, variableFuncList, variableVariableList] = await Promise.all([
                        getRepository(PageVariable).find({ where }),
                        getRepository(FuncVariable).find({ where }),
                        getRepository(VariableFunc).find({ where }),
                        getRepository(VariableVariable).find({ where })
                    ])
                    const savePageVariableList = getRepository(PageVariable).create(pageVariableList.map(item => {
                        const { id, createTime, updateTime, variableId, ...others } = item
                        others.projectId = projectId
                        others.variableId = variableIdMap[variableId] || 0
                        return others
                    }))
                    await transactionalEntityManager.save(savePageVariableList)
                    const saveFuncVariableList = getRepository(FuncVariable).create(funcVariableList.map(item => {
                        const { id, createTime, updateTime, variableId, ...others } = item
                        others.projectId = projectId
                        others.variableId = variableIdMap[variableId] || 0
                        return others
                    }))
                    await transactionalEntityManager.save(saveFuncVariableList)
                    const saveVariableFuncList = getRepository(VariableFunc).create(variableFuncList.map(item => {
                        const { id, createTime, updateTime, variableId, ...others } = item
                        others.projectId = projectId
                        others.variableId = variableIdMap[variableId] || 0
                        return others
                    }))
                    await transactionalEntityManager.save(saveVariableFuncList)
                    const saveVariableVariableList = getRepository(VariableVariable).create(variableVariableList.map(item => {
                        const { id, createTime, updateTime, variableId, parentVariableId, ...others } = item
                        others.projectId = projectId
                        others.variableId = variableIdMap[variableId] || 0
                        others.parentVariableId = variableIdMap[parentVariableId] || 0
                        return others
                    }))
                    await transactionalEntityManager.save(saveVariableVariableList)
                }
            } else {
                // 创建默认函数分组和函数
                const funcGroup = getRepository(FuncGroup).create({
                    groupName: global.i18n.t('默认分类'),
                    projectId
                })
                const { id: funcGroupId } = await transactionalEntityManager.save(funcGroup)
                const defaultFunc = getDefaultFunc(
                    {
                        projectId,
                        funcGroupId
                    }
                )
                const funcs = getRepository(Func).create(defaultFunc)
                await transactionalEntityManager.save(funcs)

                // 创建默认api分类
                const apiCategory = getRepository(ApiCategory).create({
                    name: global.i18n.t('默认分类'),
                    projectId
                })
                await transactionalEntityManager.save(apiCategory)

                // 创建默认模板分类
                const templateCategory = getRepository(TemplateCategory).create({
                    name: global.i18n.t('默认分类'),
                    belongProjectId: projectId,
                    order: -0
                })
                await transactionalEntityManager.save(templateCategory)

                // 添加布局模板到项目
                const saveLayoutInstList = getRepository(LayoutInst).create(layoutData.map((item, index) => {
                    return {
                        projectId,
                        layoutId: item.layoutId,
                        content: item.content,
                        routePath: item.routePath,
                        isDefault: item.isDefault ? 1 : 0,
                        showName: item.showName,
                        layoutCode: item.layoutCode,
                        layoutType: item.layoutType
                    }
                }))
                await transactionalEntityManager.save(saveLayoutInstList)
            }

            if (projectId && bkTicket) {
                // 当有配置v3配置文件时，同步创建v3项目
                const res = await createV3App({ projectCode: project.projectCode, projectName: project.projectName }, bkTicket)
                if (res?.application) {
                    project.appCode = project.projectCode
                    project.moduleCode = 'default'
                    await transactionalEntityManager.save(project)
                }
            }

            return { projectId }
        })
    },

    findOne (whereParams) {
        const params = Object.assign({}, { deleteFlag: 0 }, whereParams)
        return getRepository(Project).findOne(params)
    },

    findUserProjectById (userId, id) {
        return getRepository(Project).createQueryBuilder('project')
            .leftJoinAndSelect(UserProjectRole, 't', 't.projectId = project.id')
            .where('project.id = :id', { id })
            .andWhere('t.userId = :userId AND t.deleteFlag = 0', { userId })
            .getOne()
    },

    findProjectDetail (params) {
        const queryParams = Object.assign({}, params, { deleteFlag: 0 })
        return getRepository(Project).findOne(queryParams)
    },

    findProjects (params) {
        const queryParams = Object.assign({}, params, { deleteFlag: 0 })
        return getRepository(Project).find(queryParams)
    },

    async validProject ({ projectCode, projectName, fromOpenApi = false }) {
        let status = 0
        // 如果请求来源openapi，提示报错信息来源于lesscode
        let errMsg = fromOpenApi ? global.i18n.t('lesscode平台校验不通过：') : ''
        let code = ''
        const codeRegex = /^[a-z]{1,16}$/
        const openApiCodeRegex = /^[a-z]{1,32}$/
        const nameRegex = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$/
        const openApiNameRegex = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,36}$/
        if (invalidProjectIds.includes(projectCode)) {
            status = 400
            errMsg += global.i18n.t('应用ID不能为内置关键字')
            code = CODE.BIZ.PROJECT_ID_INVALID
        }

        if (fromOpenApi) {
            if (!openApiCodeRegex.test(projectCode)) {
                status = 400
                errMsg += global.i18n.t('应用ID由开发者中心的"应用ID+模块名称"组成，只能包含小写字母, 32个字符以内')
                code = CODE.BIZ.PROJECT_ID_INVALID
            }
            if (!openApiNameRegex.test(projectName)) {
                status = 400
                errMsg += global.i18n.t('应用名称由开发者中心的"应用名称+模块名称"组成,只能包含汉字，英文字母，数字，36个字符以内')
                code = CODE.BIZ.PROJECT_NAME_EXISTED
            }
        } else {
            if (!codeRegex.test(projectCode)) {
                status = 400
                errMsg += global.i18n.t('应用ID只能由小写字母组成, 16个字符以内')
                code = CODE.BIZ.PROJECT_ID_INVALID
            }
            if (!nameRegex.test(projectName)) {
                status = 400
                errMsg += global.i18n.t('应用名称由汉字，英文字母，数字组成，20个字符以内')
                code = CODE.BIZ.PROJECT_NAME_EXISTED
            }
        }

        // 检查名称和英文ID的唯一性
        const [foundNameProject, foundCodeProject] = await Promise.all([
            this.findProjectDetail({ projectName }),
            this.findProjectDetail({ projectCode })
        ])

        if (foundNameProject && foundNameProject.id) {
            status = 400
            errMsg += global.i18n.t('应用名称已经存在')
            code = CODE.BIZ.PROJECT_NAME_EXISTED
        }

        if (foundCodeProject && foundCodeProject.id) {
            status = 400
            errMsg += global.i18n.t('应用ID已经存在')
            code = CODE.BIZ.PROJECT_ID_EXISTED
        }
        return {
            status, errMsg, code
        }
    },

    queryAllProject ({ condition = '', params = {}, select }) {
        const currentUser = RequestContext.getCurrentUser() || {}
        const userId = currentUser.id
        return getRepository(Project)
            .createQueryBuilder('project')
            .innerJoinAndSelect('r_user_project_role', 'user_project_role', 'user_project_role.projectId = project.id')
            .select(select || projectSelectFields)
            .where('project.deleteFlag != 1 AND user_project_role.deleteFlag != 1 AND user_project_role.userId = :userId', { userId })
            .andWhere(condition, params)
            .orderBy('project.id', 'DESC')
            .getMany()
    },

    queryMyCreateProject ({ condition = '', params = {}, select }) {
        // const currentUser = RequestContext.getCurrentUser() || {}
        // const userId = currentUser.id
        // return getRepository(Project)
        //     .createQueryBuilder('project')
        //     .innerJoinAndSelect('r_user_project_role', 'user_project_role', 'user_project_role.projectId = project.id')
        //     .select(select || projectSelectFields)
        //     .where('project.deleteFlag != 1 AND user_project_role.deleteFlag != 1 AND user_project_role.userId = :userId', { userId })
        //     .andWhere(condition, params)
        //     .orderBy('project.id', 'DESC')
        //     .getMany()
        return getRepository(Project)
            .createQueryBuilder('project')
            .select(select || projectSelectFields)
            .where('project.deleteFlag != 1')
            .andWhere(condition, params)
            .orderBy('project.id', 'DESC')
            .getMany()
    },

    queryMyFavoriteProject ({ condition = '', params = {}, select }) {
        // const currentUser = RequestContext.getCurrentUser() || {}
        // const userId = currentUser.id
        // return getRepository(Project)
        //     .createQueryBuilder('project')
        //     .innerJoinAndSelect('r_user_project_role', 'user_project_role', 'user_project_role.projectId = project.id')
        //     .innerJoinAndSelect('r_favourite', 'favourite', 'favourite.projectId = project.id')
        //     .where('project.deleteFlag != 1 AND user_project_role.deleteFlag != 1 AND user_project_role.userId = :userId', { userId })
        //     .andWhere(condition, params)
        //     .select(select || projectSelectFields)
        //     .orderBy('project.id', 'DESC')
        //     .getMany()
        return getRepository(Project)
            .createQueryBuilder('project')
            .innerJoinAndSelect('r_favourite', 'favourite', 'favourite.projectId = project.id')
            .where('project.deleteFlag != 1')
            .andWhere(condition, params)
            .select(select || projectSelectFields)
            .orderBy('project.id', 'DESC')
            .getMany()
    },

    queryProjectPage ({ condition = '', params = {} }) {
        return getRepository(Page)
            .createQueryBuilder('page')
            .innerJoinAndSelect('r_project_page', 'project_page', 'project_page.pageId = page.id')
            .select(['page.pageName as pageName',
                'page.updateTime as updateTime',
                'page.updateUser as updateUser',
                'project_page.projectId as projectId'
            ])
            .where(condition, params)
            .andWhere('page.deleteFlag != 1')
            .orderBy('page.updateTime', 'DESC')
            .getRawMany()
    },

    findProjectPreviewImg (projectId) {
        return getRepository(Page)
            .createQueryBuilder('page')
            .leftJoin('r_project_page', 'project_page', 'project_page.pageId = page.id')
            .select('previewImg')
            .where('project_page.projectId = :projectId', { projectId })
            .andWhere('page.deleteFlag != 1')
            .orderBy('page.updateTime', 'DESC')
            .limit(1)
            .getRawOne()
    },

    updateProject (id, fields = {}) {
        return getRepository(Project).update(id, fields)
    },

    addFavorite (data) {
        const repository = getRepository(ProjectFavourite)
        const projectFavourite = repository.create(data)
        return repository.save(projectFavourite)
    },

    removeFavorite (data) {
        const repository = getRepository(ProjectFavourite)
        return repository.delete(data)
    }
}
