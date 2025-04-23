import useBase from './use-base'
import LC from '@/element-materials/core'
import vue2IconComponentList from '@/element-materials/materials/vue2/icon-list.js'
import vue3IconComponentList from '@/element-materials/materials/vue3/icon-list.js'

export default (cmdMessage) => {
    const {
        getNode
    } = useBase(cmdMessage)

    const handleInsertIcon = (iconFullName, componentId) => {
        const parentNode = getNode()
        const node = LC.createNode('i')
        node.componentId = componentId
        node.setProp('class', LC.utils.genPropFormatValue({
            format: 'value',
            code: iconFullName,
            renderValue: iconFullName
        }))
        parentNode.appendChild(node)
        cmdMessage.value += [
            '# cmd',
            `inserted ${componentId}`,
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }
    const handleGetIcons = () => {
        const iconComponentList = LC.getFramework() === 'vue3'
            ? vue3IconComponentList
            : vue2IconComponentList
        // 组成提示
        const iconTips = [
            'You can use these icon name:',
            ...iconComponentList.map(component => `- ${component.icon}`)
        ]
        cmdMessage.value += [
            '',
            '# cmd',
            ...iconTips
        ].join('\n')
    }

    return {
        handleInsertIcon,
        handleGetIcons
    }
}
