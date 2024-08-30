import { getConnection, getRepository } from 'typeorm'
import PageTemplate from '../model/entities/page-template'
import * as TemplateCategoryModel from '../model/page-template-category'
import * as PageTemplateModel from '../model/page-template'
import Func from '../model/entities/func'
import Variable from '../model/entities/variable'
import { filterFuncAndVars, getRealVarAndFunc } from '../service/business/page-template'
import {
    getAllGroupAndFunction
} from '../service/business/function'
import VariableModel from '../model/variable'

export const listByCategory = async (ctx) => {
    try {
        const projectId = ctx.query.projectId
        const params = {}
        if (projectId) {
            params.belongProjectId = projectId
        }
        const categorys = await TemplateCategoryModel.all(params)

        const templates = await PageTemplateModel.all(params)

        const list = categorys.map(category => {
            const templateList = templates.filter(item => item.categoryId === category.id) || []
            return {
                categoryName: category.name,
                list: templateList
            }
        })

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

export const list = async (ctx) => {
    try {
        const { categoryId, type, framework, projectId } = ctx.query
        const params = {}
        if (projectId) {
            params.belongProjectId = projectId
        }
        if (categoryId) {
            params.categoryId = categoryId
        }
        if (type === 'OFFCIAL') {
            params.isOffcial = 1
        }
        const res = await PageTemplateModel.all(params)
        const filterList = res.filter((item) => {
            if (framework === 'all') {
                return true
            } else if (framework === 'vue3') {
                return item.framework === 'vue3'
            } else {
                return item.framework !== 'vue3'
            }
        })
        ctx.send({
            code: 0,
            message: 'success',
            data: filterList || []
        })
    } catch (err) {
        ctx.throwError({
            message: err.message
        })
    }
}

export const create = async (ctx) => {
    try {
        const { params } = ctx.request.body
        params.belongProjectId = ctx.request.headers['x-project-id']

        // 模板名称已存在
        const record = await PageTemplateModel.getOne({
            templateName: params.templateName,
            belongProjectId: params.belongProjectId,
            deleteFlag: 0
        })
        if (record) {
            ctx.throwError({
                message: global.i18n.t('模板名称已存在')
            })
        }
        const createTemplate = getRepository(PageTemplate).create(params)
        const res = await getRepository(PageTemplate).save(createTemplate)
        ctx.send({
            code: 0,
            message: 'success',
            data: res && res.id
        })
    } catch (err) {
        ctx.throw(err)
    }
}

export const detail = async (ctx) => {
    try {
        const { id } = ctx.request.query
        const template = await PageTemplateModel.findById(id) || {}
        ctx.send({
            code: 0,
            message: 'success',
            data: template
        })
    } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
    }
}

// check符合条件的pageTemplate是否已存在
export const checkIsExist = async (ctx) => {
    try {
        const params = ctx.request.body
        let isExist = false

        const record = await PageTemplateModel.getOne({
            ...params,
            deleteFlag: 0
        })
        if (record) {
            isExist = true
        }
        ctx.send({
            code: 0,
            message: 'success',
            data: isExist
        })
    } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
    }
}

// 应用模板
export const apply = async (ctx) => {
    try {
        const { id, fromProjectId, templateInfo, varList = [], funcList = [] } = ctx.request.body
        const preTemplate = await PageTemplateModel.findById(id) || {}

        const { content, previewImg, fromPageCode, templateName, templateType } = preTemplate

        await Promise.all(templateInfo.map(async fromTemplate => {
            const { categoryId, belongProjectId, versionId } = fromTemplate
            const newTemplate = {
                content,
                previewImg,
                isOffcial: 0,
                offcialType: '',
                categoryId,
                templateName: fromTemplate.templateName || templateName,
                templateType,
                parentId: id,
                belongProjectId,
                versionId,
                fromPageCode
            }

            const { varIds, funcIds, defaultFuncGroupId } = await getRealVarAndFunc({ projectId: belongProjectId, fromProjectId, versionId, valList: varList, funcList })
            console.log(belongProjectId, varIds, funcIds, defaultFuncGroupId, 'ids')
            await getConnection().transaction(async transactionalEntityManager => {
                const createTemplate = getRepository(PageTemplate).create(newTemplate)
                await transactionalEntityManager.save(createTemplate)
                const saveQueue = []
                if (varIds.length) {
                    await Promise.all(varIds.map(async valId => {
                        const val = await getRepository(Variable).findOne(valId)
                        const { id, createTime, createUser, updateTime, updateUser, ...other } = val
                        const newVal = Object.assign(other, {
                            projectId: belongProjectId,
                            versionId,
                            pageCode: '',
                            effectiveRange: 0
                        })
                        const createVal = getRepository(Variable).create(newVal)
                        saveQueue.push(transactionalEntityManager.save(createVal))
                    }))
                }
                if (funcIds.length) {
                    await Promise.all(funcIds.map(async funcId => {
                        const func = await getRepository(Func).findOne(funcId)
                        const { id, createTime, createUser, updateTime, updateUser, ...other } = func
                        const newFunc = Object.assign(other, {
                            versionId,
                            funcGroupId: defaultFuncGroupId,
                            projectId: belongProjectId
                        })
                        const createFunc = getRepository(Func).create(newFunc)
                        saveQueue.push(transactionalEntityManager.save(createFunc))
                    }))
                }
                saveQueue.length && await Promise.all(saveQueue)
            })
        }))

        ctx.send({
            code: 0,
            message: 'success',
            data: global.i18n.t('模板添加至应用成功')
        })
    } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
    }
}

export const getProjectFuncAndVar = async (ctx) => {
    const { projectId, versionId, pageCode } = ctx.query
    const variableList = await VariableModel.getAll({ projectId, versionId, effectiveRange: 0, pageCode })
    const funcGroups = await getAllGroupAndFunction(projectId, versionId)
    const data = {
        variableList,
        funcGroups
    }
    ctx.send({
        code: 0,
        message: 'success',
        data
    })
}

export const importTemplate = async (ctx) => {
    try {
        const params = ctx.request.body
        params.belongProjectId = ctx.request.headers['x-project-id']
        // 模板名称已存在
        const record = await PageTemplateModel.getOne({
            templateName: params?.template?.templateName,
            belongProjectId: params.belongProjectId,
            deleteFlag: 0
        })
        if (record) {
            ctx.throwError({
                message: global.i18n.t('模板名称已存在')
            })
        }

        await handleImportTemplate(params)
        ctx.send({
            code: 0,
            message: 'success',
            data: global.i18n.t('模板导入成功')
        })
    } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
    }
}

export const handleImportTemplate = async (data) => {
    const { belongProjectId, versionId, template = {}, vars = [], functions = [] } = data
    
    const { id, createTime, createUser, updateTime, updateUser, ...newTemplate } = template

    // 过滤掉该项目中已存在的variableCode或functionCode
    const { valList, funcList, defaultFuncGroupId } = await filterFuncAndVars({ projectId: belongProjectId, versionId, fromProjectId: 0, valList: vars, funcList: functions })
    
    await getConnection().transaction(async transactionalEntityManager => {
        const createTemplate = getRepository(PageTemplate).create(newTemplate)
        await transactionalEntityManager.save(createTemplate)
        const saveQueue = []
        if (valList.length) {
            await Promise.all(valList.map(async val => {
                const { id, createTime, createUser, updateTime, updateUser, userInfo, ...other } = val
                const newVal = Object.assign(other, {
                    projectId: belongProjectId,
                    versionId,
                    pageCode: '',
                    effectiveRange: 0,
                    defaultValue: JSON.stringify(other.defaultValue)
                })
                const createVal = getRepository(Variable).create(newVal)
                saveQueue.push(transactionalEntityManager.save(createVal))
            }))
        }
        if (funcList.length) {
            await Promise.all(funcList.map(async func => {
                const { id, createTime, createUser, updateTime, updateUser, funcGroupName, pages, ...other } = func
                const newFunc = Object.assign(other, {
                    versionId,
                    funcGroupId: defaultFuncGroupId,
                    projectId: belongProjectId,
                    remoteParams: (other.remoteParams || []).join(', '),
                    funcParams: (other.funcParams || []).join(', ')
                })
                const createFunc = getRepository(Func).create(newFunc)
                saveQueue.push(transactionalEntityManager.save(createFunc))
            }))
        }
        saveQueue.length && await Promise.all(saveQueue)
    })
}

// 编辑模板
export const update = async (ctx) => {
    try {
        const { id, params } = ctx.request.body
        params.belongProjectId = ctx.request.headers['x-project-id']

        // 模板名称已存在
        const record = await PageTemplateModel.getOne({
            templateName: params.templateName,
            belongProjectId: params.belongProjectId,
            deleteFlag: 0
        })
        if (record && record.id !== id) {
            ctx.throwError({
                message: global.i18n.t('模板名称重复')
            })
        }
        const res = await PageTemplateModel.updateById(id, params)
        ctx.send({
            code: 0,
            message: 'success',
            data: res
        })
    } catch (err) {
        ctx.throwError({
            message: err.message || err
        })
    }
}

export const deleteTemplate = async (ctx) => {
    try {
        const res = PageTemplateModel.remove(ctx.query.id)
        ctx.send({
            code: 0,
            message: 'success',
            data: res && res.id
        })
    } catch (err) {
        ctx.throw(err)
    }
}

// 分类组件数量
export const categoryCount = async (ctx) => {
    try {
        const belongProjectId = ctx.request.headers['x-project-id']
        if (!belongProjectId) {
            throw new Error(global.i18n.t('应用id不能为空'))
        }
        const res = await getRepository(PageTemplate)
            .createQueryBuilder()
            .select('categoryId')
            .addSelect('COUNT(id)', 'count')
            .where({
                deleteFlag: 0,
                belongProjectId
            })
            .groupBy('categoryId')
            .getRawMany()

        ctx.send({
            code: 0,
            message: 'success',
            data: res
        })
    } catch (error) {
        ctx.send({
            code: -1,
            message: error.message,
            data: null
        })
    }
}
