import { initInnerProject } from './inner-project'
import { initFunc } from './function'
import { initPageTemplate } from './page-template'
import { initCustomComp } from './custom-comp'

export const initResources = async (map = {}) => {
    // 需要生成一个默认的应用用来存放页面模板和自定义函数
    console.log('init')
    let compRes = []
    const { projectId, projectCode } = await initInnerProject()
    map.func && await initFunc(map.func)
    map.pageTemplate && await initPageTemplate(projectId, map.pageTemplate)
    compRes = map.comp && await initCustomComp(projectId, projectCode, map.comp)
    return compRes
}
