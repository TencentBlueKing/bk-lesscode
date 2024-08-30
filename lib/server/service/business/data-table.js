import { LCDataService, TABLE_FILE_NAME } from '../common/data-service'
import { enablePerviewDb, getPreviewDbConfig } from './preview-db-service'
import DBEngineService from '../common/db-engine-service'

export const importTask = async (ctx, next) => {
    const { projectId, projectCode } = ctx
    const { dataTable, dataTableModifyRecord, thirdPartDB } = ctx.importData

    if (!dataTable.length) {
        await next()
        return
    }
    
    // 开启数据源
    await enablePerviewDb(projectId, projectId + projectCode)

    const dataTableIdMap = {}
    const thirdPartDBIdMap = {}
    const tableThirdPartDBIdMap = {}
    await LCDataService.transaction(async (transactionalEntityHelper) => {
        // 第三方数据源
        const newThirdPartDB = await transactionalEntityHelper.add(
            TABLE_FILE_NAME.THIRD_PART_DB,
            thirdPartDB.map(item => {
                const { id, ...others } = item
                others.projectId = projectId
                return others
            })
        )
        thirdPartDB.map((item, index) => {
            thirdPartDBIdMap[item.id] = newThirdPartDB[index]?.id || 0
        })
        const newDataTable = await transactionalEntityHelper.add(
            TABLE_FILE_NAME.DATA_TABLE,
            dataTable.map(item => {
                const { id, ...others } = item
                others.projectId = projectId
                others.thirdPartDBId = thirdPartDBIdMap[others.thirdPartDBId] || 0
                return others
            })
        )
        dataTable.forEach((table, index) => {
            dataTableIdMap[table.id] = newDataTable[index]?.id || 0
        })
        newDataTable.forEach((table) => {
            tableThirdPartDBIdMap[table.id] = table.thirdPartDBId
        })
        // modifyRecord记录
        const currentTime = +new Date()
        const newDataTableModifyRecords = dataTableModifyRecord.map((item, index) => {
            const { id, ...others } = item
            // 由于事务一次性提交，但是表实际上不是一次性创建好
            const tableRecordTime = new Date(currentTime + index * 1000)
            others.createTime = tableRecordTime
            others.updateTime = tableRecordTime
            others.projectId = projectId
            others.tableId = dataTableIdMap[others.tableId] || 0
            return others
        })
        // 执行表变更sql
        const previewDbConfig = await getPreviewDbConfig(projectId)
        const dbEngine = new DBEngineService(previewDbConfig)
        let sql = ''
        newDataTableModifyRecords.forEach((newDataTableModifyRecord) => {
            if (tableThirdPartDBIdMap[newDataTableModifyRecord.tableId] <= 0) {
                sql += newDataTableModifyRecord.sql
            }
        })
        await dbEngine.execMultSql(sql)
    })

    ctx.idMap.dataTableIdMap = dataTableIdMap
    await next()
}
