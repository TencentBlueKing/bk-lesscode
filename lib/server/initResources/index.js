import { initInnerProject } from './inner-project'
import { initFunc } from './function'
import { initPageTemplate } from './page-template'

export const initResources = async (map = {}) => {
    // 需要生成一个默认的应用用来存放页面模板和自定义函数
    console.log('init')
    const projectId = await initInnerProject()
    await initFunc(map.func)
    await initPageTemplate(projectId, map.pageTemplate)
}
