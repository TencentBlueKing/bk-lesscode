import { LCDataService, TABLE_FILE_NAME } from '../common/data-service'
import { enablePerviewDb, getPreviewDbConfig } from './preview-db-service'
import DBEngineService from '../common/db-engine-service'

export const importTask = async (ctx, next) => {
    const { projectId, projectCode } = ctx
    const { dataTable, dataTableModifyRecord } = ctx.importData

    if (!dataTable.length) {
        await next()
        return
    }
    
    // 开启数据源
    await enablePerviewDb(projectId, projectId + projectCode)

    const dataTableIdMap = {}
    await LCDataService.transaction(async (transactionalEntityHelper) => {
        // project表已开启db标志位
        const projectInfo = {
            id: projectId,
            isEnableDataSource: 1
        }
        await transactionalEntityHelper.update(TABLE_FILE_NAME.PROJECT, projectInfo)

        const newDataTable = await transactionalEntityHelper.add(
            TABLE_FILE_NAME.DATA_TABLE,
            dataTable.map(item => {
                const { id, ...others } = item
                others.projectId = projectId
                return others
            })
        )
        dataTable.forEach((table, index) => {
            dataTableIdMap[table.id] = newDataTable[index].id
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
            others.tableId = dataTableIdMap[others.tableId]
            return others
        })
        // 执行表变更sql
        const previewDbConfig = await getPreviewDbConfig(projectId)
        const dbEngine = new DBEngineService(previewDbConfig)
        let sql = ''
        newDataTableModifyRecords.forEach((newDataTableModifyRecord) => {
            sql += newDataTableModifyRecord.sql
        })
        await dbEngine.execMultSql(sql)
    })

    ctx.idMap.dataTableIdMap = dataTableIdMap
    await next()
}
