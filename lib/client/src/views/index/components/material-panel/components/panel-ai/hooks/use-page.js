import LC from '@/element-materials/core'
import store from '@/store'
import useBase from './use-base'
import { useRoute } from '@/router'

export default (cmdMessage) => {
    const {
        getNode
    } = useBase(cmdMessage)
    const route = useRoute()

    let templateList
    Promise.all([
        store.dispatch('pageTemplate/list', { type: 'OFFCIAL' }),
        store.dispatch('pageTemplate/list', { projectId: route.params.projectId })
    ]).then(([
        offcialList,
        projectTemplateList
    ]) => {
        templateList = [...offcialList, ...projectTemplateList]
    })

    const handleGetTemplates = () => {
        const templateFilter = (template) => {
            const isProjectVue3 = LC.getFramework() === 'vue3'
            const isProjectMobile = LC.platform === 'MOBILE'

            const isTemplateVue3 = template.framework === 'vue3'
            const isTemplateMobile = template.templateType === 'MOBILE'

            return (isProjectVue3 === isTemplateVue3) && (isProjectMobile === isTemplateMobile)
        }

        const templates = templateList.filter(templateFilter)

        if (templates?.length > 0) {
            cmdMessage.value += [
                '',
                '# cmd',
                'You can use these template:',
                ...templates.map(template => `- ${template.templateName} (id: ${template.id})`)
            ].join('\n')
        } else {
            cmdMessage.value += [
                '',
                '# cmd',
                'There is no template for the current project.You can create pages manually'
            ].join('\n')
        }
    }

    const handleUseTemplate = (id) => {
        const template = templateList.find(template => template.id === +id)
        if (template) {
            const templateNode = LC.parseTemplate(JSON.parse(template.content))
            const parentNode = getNode()
            parentNode.appendChild(templateNode)
            cmdMessage.value += [
                '# cmd',
                `Success with ${template.templateName} template`,
                'Have you finished the task? If so, call `done()`. Otherwise please continue.'
            ].join('\n')
        } else {
            cmdMessage.value += [
                '',
                '# cmd',
                `Use template fail. The template "${id}" does not exist. please rethink and issue commands`
            ].join('\n')
        }
    }

    return {
        handleUseTemplate,
        handleGetTemplates
    }
}
