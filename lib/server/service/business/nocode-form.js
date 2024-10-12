import {
    LCDataService,
    TABLE_FILE_NAME
} from '../common/data-service'
import { enablePerviewDb } from './preview-db-service'
import { createNCTable, updateNCTable } from './no-code'
import { transformNCJson2LCJson } from '../../../shared/no-code'
import { getRepository, IsNull } from 'typeorm'
import Form from '../../model/entities/form'

export const createNocodeForm = async (formData = {}) => {
    // 检验字段的key不能为内置字段
    const content = formData.content || []
    const keyWords = ['id', 'createUser', 'updateUser', 'createTime', 'updateTime']
    content.map(item => {
        if (keyWords.includes(item.key)) {
            throw new Error(global.i18n.t('{{0}}为数据表的内置字段，唯一标识不能命名为{{1}}', [item.key, item.key]))
        }
    })
    let resData = {}
    const project = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT, { id: formData.projectId, deleteFlag: 0 })
    const { tableName, pageId, ...formItem } = formData
    // 如果项目未开启db，则先开启
    if (project && project.isEnableDataSource !== 1) {
        await enablePerviewDb(project.id, project.id + project.projectCode)
        project.isEnableDataSource = 1
        await LCDataService.update(TABLE_FILE_NAME.PROJECT, project)
    }

    // 如果不存在同名的数据表，才走创建逻辑
    await LCDataService.transaction(async (transactionalEntityManager) => {
        // nocodeJson 转换成lesscode数据源所需json
        const dbJson = transformNCJson2LCJson(formData.content || [])

        // 生成相应数据表或update数据表
        let dbRes = {}
        const hasTable = LCDataService.findOne(TABLE_FILE_NAME.DATA_TABLE, { projectId: formData.projectId, tableName, deleteFlag: 0 })
        if (hasTable && hasTable.id) {
            await this.updateNocodeForm({ id: hasTable.id, tableName, projectId: formData.projectId, columns: dbJson })
            dbRes.id = hasTable.id
        } else {
            dbRes = await createNCTable({ tableName, projectId: formData.projectId, thirdPartDBId: 0, columns: dbJson })
        }
        
        if (dbRes && dbRes.id) {
            Object.assign(formItem, { content: JSON.stringify(formItem.content), tableName, pageId: formData.pageId || null, componentId: formData.componentId || null, versionId: formData.versionId || null })
            // 新增form表记录
            resData = await transactionalEntityManager.add(TABLE_FILE_NAME.FORM, formItem)
            // formId 回写到page表关联
            if (pageId) {
                await transactionalEntityManager.update(TABLE_FILE_NAME.PAGE, { id: pageId, formId: resData.id })
            }
        }
    })
    return resData
}

export const updateNocodeForm = async (formData = {}) => {
    const { id, tableName, projectId, content } = formData
    const dbJson = transformNCJson2LCJson(content || [])

    const table = await LCDataService.findOne(TABLE_FILE_NAME.DATA_TABLE, { tableName, projectId, deleteFlag: 0 })
    if (table?.id) {
        await updateNCTable({ id: table.id, tableName, projectId, columns: dbJson })
        const formItem = { id, content: JSON.stringify(content) }
        await LCDataService.update(TABLE_FILE_NAME.FORM, formItem)
        return formItem
    } else {
        throw new Error(global.i18n.t('找不到tableName为{{n}}的数据表', { n: tableName }))
    }
}

// export const getFormDetail = async (formId) => {
//     return getRepository(Form).createQueryBuilder('form')
//         .leftJoinAndSelect(DataTable, 'dataTable', 'form.dataSourceId = dataTable.id')
//         .select(['form.*', 'dataTable.tableName as tableName'])
//         .where(`form.id=${formId}`)
//         .getRawOne()
// }

// 获取项目下对应版本的form列表
export const getFormList = async (projectId, versionId) => getRepository(Form).find({
    where: { projectId, deleteFlag: 0, versionId: versionId || IsNull() }
})

const getNewFormEntities = (list, { projectId, newVersionId }) => getRepository(Form).create(list.map(item => {
    const { id, createTime, updateTime, ...others } = item
    others.projectId = projectId
    others.versionId = newVersionId
    return others
}))

export const versionTask = async (ctx, next) => {
    const { projectId, versionId, newVersionId } = ctx
    const formList = await getFormList(projectId, versionId)

    if (!formList.length) {
        await next()
        return
    }

    const newFormEntities = getNewFormEntities(formList, { projectId, newVersionId })

    const newFormList = await ctx.queryRunner.manager.save(newFormEntities)

    ctx.formIdMap = {}
    formList.forEach((item, index) => {
        ctx.formIdMap[item.id] = newFormList[index]?.id || 0
    })

    await next()
}

export const importTask = async (ctx, next) => {
    const { projectId } = ctx
    const { form = [] } = ctx.importData
    
    const newFormEntities = getNewFormEntities(form, { projectId, newVersionId: null })

    const newFormList = await ctx.queryRunner.manager.save(newFormEntities)

    const formIdMap = {}
    form.forEach((item, index) => {
        formIdMap[item.id] = newFormList[index]?.id || 0
    })
    ctx.idMap.formIdMap = formIdMap
    await next()
}
