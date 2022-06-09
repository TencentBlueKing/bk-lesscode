import {
    LCDataService,
    TABLE_FILE_NAME
} from './data-service'
import { enablePerviewDb } from './preview-db-service'
import { createNCTable, updateNCTable } from '../service/no-code'
import { transformNCJson2LCJson } from '../../shared/no-code'
import { getRepository } from 'typeorm'
import Form from '../model/entities/form'
import DataTable from '../model/entities/data-table'

export const createNocodeForm = async (formData = {}) => {
    let resData = {}
    const project = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT, { id: formData.projectId, deleteFlag: 0 })
    const { tableName, pageId, ...formItem } = formData
    // 如果项目未开启db，则先开启
    if (project && project.isEnableDataSource !== 1) {
        await enablePerviewDb(project.id, project.id + project.projectCode)
        project.isEnableDataSource = 1
        await LCDataService.update(TABLE_FILE_NAME.PROJECT, project)
    }

    await LCDataService.transaction(async (transactionalEntityManager) => {
        // nocodeJson 转换成lesscode数据源所需json
        const dbJson = transformNCJson2LCJson(formData.content || [])
        // 生成相应数据表
        const dbRes = await createNCTable({ tableName, projectId: formData.projectId, columns: dbJson })
        if (dbRes && dbRes.id) {
            Object.assign(formItem, { content: JSON.stringify(formItem.content), dataSourceId: dbRes.id, versionId: formData.versionId || null })
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
    const form = await LCDataService.findOne(TABLE_FILE_NAME.FORM, { id, deleteFlag: 0 })
    await updateNCTable({ id: form.dataSourceId, tableName, projectId, columns: dbJson })
    const formItem = { id, content: JSON.stringify(content) }
    await LCDataService.update(TABLE_FILE_NAME.FORM, formItem)
    return formItem
}

export const getFormDetail = async (formId) => {
    return getRepository(Form).createQueryBuilder('form')
        .leftJoinAndSelect(DataTable, 'dataTable', 'form.dataSourceId = dataTable.id')
        .select(['form.*', 'dataTable.tableName as tableName'])
        .where(`form.id=${formId}`)
        .getRawOne()
}
