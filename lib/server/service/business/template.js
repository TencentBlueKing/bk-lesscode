import { LCDataService, TABLE_FILE_NAME } from '../common/data-service'

export const importTask = async (ctx, next) => {
    const { projectId } = ctx
    const { pageTemplate, pageTemplateCategory } = ctx.importData
    await LCDataService.transaction(async (transactionalEntityHelper) => {
        // 新增模板分类
        const newCategoryList = await transactionalEntityHelper.add(
            TABLE_FILE_NAME.PAGE_TEMPLATE_CATEGORY,
            pageTemplateCategory.map(item => {
                const { id, ...others } = item
                others.belongProjectId = projectId
                return others
            })
        )
        // 新旧分组的id map
        const categoryIdMap = {}
        pageTemplateCategory.forEach((category, index) => {
            categoryIdMap[category.id] = newCategoryList[index]?.id || 0
        })
        // 新增template
        await transactionalEntityHelper.add(
            TABLE_FILE_NAME.PAGE_TEMPLATE,
            pageTemplate.map(item => {
                const { id, ...others } = item
                return {
                    ...others,
                    isOffcial: 0,
                    parentId: 0,
                    belongProjectId: projectId,
                    categoryId: categoryIdMap[others.categoryId] || 0
                }
            })
        )
    })
    await next()
}
