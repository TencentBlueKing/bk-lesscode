import { LCDataService, TABLE_FILE_NAME } from '../common/data-service'

export const importTask = async (ctx, next) => {
    const { projectId } = ctx
    const { apiCategory, api, funcApi } = ctx.importData
    await LCDataService.transaction(async (transactionalEntityHelper) => {
        // 新增api分类
        const newApiCategoryList = await transactionalEntityHelper.add(
            TABLE_FILE_NAME.API_CATEGORY,
            apiCategory.map(item => {
                const { id, ...others } = item
                others.projectId = projectId
                return others
            })
        )
        // 新旧分组的id map
        const categoryIdMap = {}
        apiCategory.forEach((category, index) => {
            categoryIdMap[category.id] = newApiCategoryList[index].id
        })
        // 新增template
        await transactionalEntityHelper.add(
            TABLE_FILE_NAME.API,
            api.map(item => {
                const { id, ...others } = item
                return {
                    ...others,
                    projectId,
                    categoryId: categoryIdMap[id]
                }
            })
        )

        // 替换apiFunc中的projectId
        await transactionalEntityHelper.add(
            TABLE_FILE_NAME.FUNC_API,
            funcApi.map(item => {
                const { id, ...others } = item
                return {
                    ...others,
                    projectId
                }
            })
        )
    })
    await next()
}
