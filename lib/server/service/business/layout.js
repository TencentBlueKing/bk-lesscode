import { getRepository, IsNull } from 'typeorm'
import LayoutInst from '../../model/entities/layout-inst'
import { LCDataService, TABLE_FILE_NAME } from '../common/data-service'

// 获取项目下对应版本的布局实例列表
const getProjectLayoutList = async (projectId, versionId) => getRepository(LayoutInst).find({
    where: { projectId, versionId: versionId || IsNull() }
})

const getNewLayoutInstEntities = (list, { projectId, newVersionId }) => getRepository(LayoutInst).create(list.map(item => {
    const { id, createTime, updateTime, ...others } = item
    others.projectId = projectId
    others.versionId = newVersionId
    return others
}))

export const versionTask = async (ctx, next) => {
    const { projectId, versionId, newVersionId } = ctx
    const layoutInstList = await getProjectLayoutList(projectId, versionId)

    if (!layoutInstList.length) {
        await next()
        return
    }

    const newLayoutInstEntities = getNewLayoutInstEntities(layoutInstList, { projectId, newVersionId })

    const newLayoutInstList = await ctx.queryRunner.manager.save(newLayoutInstEntities)

    ctx.layoutIdMap = {}
    layoutInstList.forEach((item, index) => {
        ctx.layoutIdMap[item.id] = newLayoutInstList[index].id
    })
    await next()
}

export const importTask = async (ctx, next) => {
    const { projectId } = ctx
    const { layoutInst } = ctx.importData

    const { list: layoutList } = await LCDataService.get({
        tableFileName: TABLE_FILE_NAME.LAYOUT
    })

    const getLayoutIdByType = (type) => {
        return layoutList.find(item => item.type === type)?.id || 0
    }

    // 跨环境导入的情景下，需要把layoutId替换成当前环境的layout表对应的id，并且把type字段去掉
    const newLayoutInstList = layoutInst.map(item => {
        const { id, type, ...others } = item
        others.layoutId = getLayoutIdByType(type)
        others.projectId = projectId
        return others
    })

    const newLayoutInstEntities = getRepository(LayoutInst).create(newLayoutInstList)
    const newLayoutInst = await ctx.queryRunner.manager.save(newLayoutInstEntities)

    // layoutId放到ctx中
    const layoutIdMap = {}
    layoutInst.forEach((item, index) => {
        layoutIdMap[item.id] = newLayoutInst[index].id
    })
    ctx.idMap.layoutIdMap = layoutIdMap

    await next()
}
