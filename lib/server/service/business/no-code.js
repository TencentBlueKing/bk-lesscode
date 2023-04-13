import {
    DataParse,
    StructJsonParser,
    StructSqlParser,
    BASE_COLUMNS
} from '../../../shared/data-source'
import {
    LCDataService,
    TABLE_FILE_NAME,
    LessThan,
    LessThanOrEqual,
    MoreThan,
    MoreThanOrEqual
} from '../common/data-service'
import DBEngineService from '../common/db-engine-service'
import { getPreviewDbConfig } from './preview-db-service'
import PageModel from '../../model/page'
const getNocodeBaseColumn = () => {
    return [
        ...BASE_COLUMNS(),
        {
            name: 'operate_at',
            columnId: 'operate_at',
            type: 'datetime',
            nullable: true,
            comment: global.i18n.t('操作时间')
        },
        {
            name: 'operator',
            columnId: 'operator',
            type: 'varchar',
            length: 255,
            nullable: true,
            comment: global.i18n.t('操作人')
        }
    ]
}

/**
 * 预览环境 DB 执行 sql
 * @param {*} sql sql
 * @param {*} projectId 项目 id
 */
const execSqlInPreviewDb = async (sql, projectId) => {
    const previewDbConfig = await getPreviewDbConfig(projectId)
    const dbEngine = new DBEngineService(previewDbConfig)
    await dbEngine.execMultSql(sql)
}

/**
 * 生成 no code 表
 * @param { tableName: 表名, projectId: 项目id, columns: 字段 json, comment: 备注 } dataTable 表数据
 * @returns 新增数据
 */
export const createNCTable = async (dataTable) => {
    // 判断是否已经存着同名表
    const hasSameTable = await LCDataService.has(
        TABLE_FILE_NAME.DATA_TABLE,
        {
            tableName: dataTable.tableName,
            projectId: dataTable.projectId,
            deleteFlag: 0
        }
    )
    if (hasSameTable) {
        throw new Error(global.i18n.t('已存在表名为【{{0}}】的表', { n: dataTable.tableName }))
    }
    // 判断字段名称和系统内置字段是否有冲突
    dataTable.columns.forEach((column) => {
        if (!column.name) {
            throw new Error(global.i18n.t('字段名为空，请修改后再试'))
        }
        if (getNocodeBaseColumn().find(baseColumn => baseColumn.name === column.name)) {
            throw new Error(global.i18n.t('字段名【{{n}}】为系统内置字段，请修改后再试', { n: column.name }))
        }
    })
    // 入库
    return LCDataService.transaction(async (transactionalEntityManager) => {
        // 构造数据 table
        const newTable = {
            ...dataTable,
            source: 'nocode',
            columns: [
                ...getNocodeBaseColumn(),
                ...dataTable.columns
            ]
        }
        // 构造新增表 sql
        const dataParse = new DataParse()
        const structJsonParser = new StructJsonParser(newTable)
        const structSqlParser = new StructSqlParser()
        const sql = dataParse.import(structJsonParser).export(structSqlParser)
        // 执行入库 DATA_TABLE
        newTable.columns = JSON.stringify(newTable.columns)
        const data = await transactionalEntityManager.add(TABLE_FILE_NAME.DATA_TABLE, newTable)
        // 构造数据入库 DATA_TABLE_MODIFY_RECORD
        const tableModifyRecord = {
            sql,
            tableId: data.id,
            projectId: newTable.projectId
        }
        await transactionalEntityManager.add(TABLE_FILE_NAME.DATA_TABLE_MODIFY_RECORD, tableModifyRecord)
        // 对预览环境执行 sql
        await execSqlInPreviewDb(sql, newTable.projectId)
        return data
    })
}

/**
 * 更新 no code 表
 * @param { id: 要更新的表id, tableName: 表名, projectId: 项目id, columns: 字段 json, comment: 备注 } dataTable 表数据
 * @returns 更新数据
 */
export const updateNCTable = async (dataTable) => {
    return LCDataService.transaction(async (transactionalEntityManager) => {
        // 判断字段名称和系统内置字段是否有冲突
        dataTable.columns.forEach((column) => {
            if (!column.name) {
                throw new Error(global.i18n.t('字段名为空，请修改后再试'))
            }
            if (getNocodeBaseColumn().find(baseColumn => baseColumn.name === column.name && baseColumn.columnId !== column.columnId)) {
                throw new Error(global.i18n.t('字段名【{{n}}】为系统内置字段，请修改后再试', { n: column.name }))
            }
        })
        // 获取原始 table
        const originData = await LCDataService.findOne(
            TABLE_FILE_NAME.DATA_TABLE,
            {
                id: dataTable.id
            }
        )
        // 构造数据 DATA_TABLE
        const updateTable = {
            ...dataTable,
            source: 'nocode',
            columns: JSON.parse(originData.columns)
        }
        // nocode 字段只增不减，添加新增或者修改的字段
        dataTable.columns.forEach((column) => {
            const getColumnString = ({ columnId, ...rest }) => {
                return JSON.stringify(rest)
            }
            const hasSameColumn = updateTable.columns.find((updateColumn) => (getColumnString(column) === getColumnString(updateColumn)))
            if (!hasSameColumn) {
                updateTable.columns.push(column)
            }
        })
        // 构造数据入库 sql
        const originTable = {
            ...originData,
            columns: JSON.parse(originData.columns)
        }
        const dataParse = new DataParse(originTable)
        const structJsonParser = new StructJsonParser(updateTable)
        const structSqlParser = new StructSqlParser()
        const sql = dataParse.import(structJsonParser).export(structSqlParser)
        // 入库 DATA_TABLE
        updateTable.columns = JSON.stringify(updateTable.columns)
        const data = await transactionalEntityManager.update(TABLE_FILE_NAME.DATA_TABLE, updateTable)
        // 入库 DATA_TABLE_MODIFY_RECORD
        if (sql) {
            const tableModifyRecord = {
                sql,
                tableId: data.id,
                projectId: updateTable.projectId
            }
            await transactionalEntityManager.add(TABLE_FILE_NAME.DATA_TABLE_MODIFY_RECORD, tableModifyRecord)
            // 对预览环境执行 sql
            await execSqlInPreviewDb(sql, updateTable.projectId)
        }
        return data
    })
}

// 获取flowList， 并返回相应的流程提单页和流程数据管理页
export const getFlowList = async ({ page, pageSize, query, projectId }) => {
    const [{ list, count }, pageList] = await Promise.all([
        LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FLOW,
            page,
            pageSize,
            query
        }),
        PageModel.getProjectPages(projectId, null)
    ])
    const pageIdName = {}
    pageList.forEach(page => {
        pageIdName[page.id] = {
            pageName: page.pageName,
            pageCode: page.pageCode
        }
    })
    const finalList = list.map(item => {
        let managePageNames = ''
        let managePageCodes = ''
        if (item.managePageIds) {
            const pageIds = item.managePageIds.split(',')
            pageIds.forEach(id => {
                if (pageIdName[id]?.pageName) {
                    managePageNames += pageIdName[id].pageName + ' '
                    managePageCodes += pageIdName[id].pageCode + ' '
                }
            })
        }
        return {
            ...item,
            pageName: pageIdName[item.pageId]?.pageName || '--',
            pageCode: pageIdName[item.pageId]?.pageCode || null,
            managePageNames: managePageNames || '--',
            managePageCodes: managePageCodes || null
        }
    })
    return { list: finalList, count }
}

// 获取项目下flowList
export const getProjectFlowList = async (projectId) => {
    const { list } = await LCDataService.get({
        tableFileName: TABLE_FILE_NAME.FLOW,
        query: {
            deleteFlag: 0,
            projectId
        }
    })
    return list || []
}

// 基于 conditions 获取查询数据
export const parseConditions = (conditions) => {
    const {
        connector,
        expressions
    } = conditions
    const where = connector === 'or' ? [] : {}
    const getExpression = ({
        key,
        type,
        condition,
        value
    }) => {
        const whereCondition = {
            [key]: value
        }
        if (type === 'system' && value === '{{date}}') {
            whereCondition[key] = new Date()
        }
        switch (condition) {
            case '>':
                whereCondition[key] = MoreThan(whereCondition[key])
                break
            case '>=':
                whereCondition[key] = MoreThanOrEqual(whereCondition[key])
                break
            case '<':
                whereCondition[key] = LessThan(whereCondition[key])
                break
            case '<=':
                whereCondition[key] = LessThanOrEqual(whereCondition[key])
                break
        }
        return whereCondition
    }
    expressions.forEach((expression) => {
        if (connector === 'or') {
            where.push(getExpression(expression))
        } else {
            Object.assign(
                where,
                getExpression(expression)
            )
        }
    })
    return where
}
