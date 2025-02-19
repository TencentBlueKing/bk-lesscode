// import { getRepository } from 'typeorm'
import { LCDataService, TABLE_FILE_NAME } from '../../service/common/data-service'
// const jsonList = ['template-tabdemo', 'template-announcement.json']
const fs = require('fs')
const path = require('path')
const { handleImportTemplate } = require('../../controller/page-template')

export const initPageTemplate = async (projectId, templateData = {}) => {
    console.log('initPagetemplate')
    let categoryId = ''
    const { importList } = templateData
    if (importList.length) {
        const { list: categoryList = [] } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE_TEMPLATE_CATEGORY,
            query: {
                belongProjectId: projectId
            }
        })
        if (categoryList.length) {
            categoryId = categoryList[0].id
        } else {
            const { id } = await LCDataService.add(TABLE_FILE_NAME.PAGE_TEMPLATE_CATEGORY, {
                name: global.i18n.t('默认分类'),
                belongProjectId: projectId
            })
            categoryId = id
        }
        // 查询已有的公开模板，不重复添加
        const { list: offcialList = [] } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE_TEMPLATE,
            query: {
                isOffcial: 1,
                deleteFlag: 0
            }
        })
        const templateList = offcialList.map(item => {
            const { templateName, framework } = item
            return { templateName, framework: framework || 'vue2' }
        })
        await Promise.all(importList.map(frameworkTemplateItem => {
            const { framework, list } = frameworkTemplateItem
            return list.map(async item => {
                const templateStr = fs.readFileSync(path.resolve(__dirname, `./resources/${framework}/${item}.json`), 'utf8')
                const templateJson = JSON.parse(templateStr) || {}
                const { template, vars } = templateJson
                const isRepeatTemplate = templateList.find((item) => {
                    const { templateName, framework } = template
                    return item.templateName === templateName && item.framework === (framework || 'vue2')
                })
                if (!isRepeatTemplate) {
                    const imgPrefix = 'https://staticfile.qq.com/lesscode/p9508f3d3cfba4809b2e1a3cba58cdd20/template-imgs/latest/'
                    const previewImg = template.previewImg && template.previewImg.startsWith('http') ? template.previewImg : `${imgPrefix}${item}.png`
                    Object.assign(template, { categoryId, belongProjectId: projectId, versionId: null, fromPageCode: '', isOffcial: 1, parentId: 0, previewImg, createUser: 'admin', updateUser: 'admin' })
                    const newVars = (vars.length && vars.map(item => ({
                        ...item,
                        projectId: projectId,
                        pageCode: '',
                        effectiveRange: 0
                    }))) || []
                    
                    Object.assign(templateJson, { belongProjectId: projectId, versionId: null, template, vars: newVars })
                    await handleImportTemplate(templateJson)
                    console.log(templateJson.template.templateName)
                }
            })
        }).flat())
    }
}
