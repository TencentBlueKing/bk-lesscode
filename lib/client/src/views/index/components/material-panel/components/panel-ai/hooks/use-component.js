import useBase from './use-base'
import LC from '@/element-materials/core'
import * as createHacker from '../../common/group-box/hacker.js'
import vue2Materials from '@/element-materials/materials/vue2'
import vue3Materials from '@/element-materials/materials/vue3'
import store from '@/store'

export default (cmdMessage) => {
    const {
        getNode,
        handleComponentNotExist
    } = useBase(cmdMessage)

    const handleSetProp = (componentId, prop, value) => {
        const node = getNode(componentId)
        if (!node) {
            handleComponentNotExist(
                `Updating the ${prop} prop of the component failed`,
                componentId
            )
            return
        }
        if (!node.material?.props?.[prop]) {
            cmdMessage.value += [
                '',
                '# cmd',
                `Updating the ${prop} prop of the component failed. The component "${componentId}" does not have ${prop} attribute. please rethink and issue commands`,
                'Note: you can use `component.getInfo("<componentId>")` to get the configuration information of a component.'
            ].join('\n')
            return
        }
        if (!value.code) {
            value.code = value.renderValue
        }
        if (!value.renderValue) {
            value.renderValue = value.code
        }
        node.setProp({
            [prop]: {
                payload: {},
                valueType: Array.isArray(node.material.props[prop].type) ? node.material.props[prop].type[0] : node.material.props[prop].type,
                ...node.renderProps[prop],
                format: 'value',
                ...value
            }
        })
        cmdMessage.value += [
            '',
            '# cmd',
            'The prop has been successfully set.',
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }
    const handleSetStyle = (componentId, style, value) => {
        const node = getNode(componentId)
        if (!node) {
            handleComponentNotExist(
                `Updating the ${style} style of the component failed`,
                componentId
            )
            return
        }
        node.setRenderStyles({
            ...node.renderStyles,
            [style]: value
        })
        cmdMessage.value += [
            '',
            '# cmd',
            'The style has been successfully set.',
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }
    const handleSetEvent = (componentId, event, functionCode) => {
        const item = store.getters['functions/functionList'].find(x => x.funcCode === functionCode)
        if (!item) {
            cmdMessage.value += [
                '',
                '# cmd',
                `Updating the ${event} event of the component failed. The function "${functionCode}" does not exist. please rethink and issue commands`
            ].join('\n')
            return
        }
        // 修改event
        const node = getNode(componentId)
        if (!node) {
            handleComponentNotExist(
                `Updating the ${event} event of the component failed`,
                componentId
            )
            return
        }
        node.setRenderEvents({
            ...node.renderEvents,
            [event]: {
                enable: true,
                methodCode: functionCode,
                params: []
            }
        })
        cmdMessage.value += [
            '',
            '# cmd',
            'The event has been successfully set.',
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }
    const handleSetAlign = (componentId, key, value) => {
        const node = getNode(componentId)
        if (!node) {
            handleComponentNotExist(
                `Updating the ${key} align of the component failed`,
                componentId
            )
            return
        }
        node.setRenderAlign({
            ...node.renderAlign,
            [key]: value
        })
        cmdMessage.value += [
            '',
            '# cmd',
            'The align has been successfully set.',
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }
    const handleSetSlot = (componentId, slot, value) => {
        const node = getNode(componentId)
        if (!node) {
            handleComponentNotExist(
                `Updating the ${slot} slot of the component failed`,
                componentId
            )
            return
        }
        if (!value.code) {
            value.code = value.renderValue
        }
        if (!value.renderValue) {
            value.renderValue = value.code
        }
        const renderSlot = JSON.parse(JSON.stringify(node.renderSlots[slot]))
        const slotValue = Array.isArray(renderSlot)
            ? [...renderSlot, ...value]
            : { ...renderSlot, ...value }
        node.setRenderSlots(slotValue, slot)
        cmdMessage.value += [
            '',
            '# cmd',
            'The slot has been successfully set.',
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }
    const handleDelete = (componentId) => {
        const node = getNode(componentId)
        if (!node) {
            handleComponentNotExist(
                `Delete the ${componentId} component failed`,
                componentId
            )
            return
        }
        node.parentNode.removeChild(node)
        cmdMessage.value += [
            '',
            '# cmd',
            `deleted ${componentId}`,
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }
    const handleInsert = (type, componentId) => {
        const isExist = getNode(componentId)
        if (isExist) {
            cmdMessage.value += [
                '# cmd',
                `insert failed! the componentId ${componentId} already exists! Please generate a new componentId and reissue the command.`
            ].join('\n')
        } else {
            const parentNode = getNode()
            const node = LC.createNode(type)
            node.componentId = componentId
            Object.values(createHacker).forEach(task => task(node, node.material))
            parentNode.appendChild(node)
            cmdMessage.value += [
                '# cmd',
                `inserted ${componentId}`,
                'Have you finished the task? If so, call `done()`. Otherwise please continue.'
            ].join('\n')
        }
    }
    const handleSelect = (componentId) => {
        setTimeout(() => {
            const node = getNode(componentId)
            if (!node) {
                handleComponentNotExist(
                    `Select the ${componentId} component failed`,
                    componentId
                )
                return
            }
            node.active()
            cmdMessage.value += [
                '',
                '# cmd',
                `selected ${componentId}`,
                'Have you finished the task? If so, call `done()`. Otherwise please continue.'
            ].join('\n')
        }, 10)
    }
    const handleGetAll = () => {
        const framework = LC.getFramework()
        const components = framework === 'vue3'
            ? LC.platform === 'MOBILE' ? vue3Materials.vant : vue3Materials.bk
            : LC.platform === 'MOBILE' ? vue2Materials.vant : vue2Materials.bk
        cmdMessage.value += [
            '',
            '# cmd',
            'You can use these component type:',
            ...components.map(component => `- ${component.type} (${component.displayName})`)
        ].join('\n')
    }
    const getComponentConfig = (component) => {
        const getPropType = (prop) => {
            if (prop.options) {
                return prop.options.join('|')
            }
            if (Array.isArray(prop.type)) {
                return prop.type.join('|')
            }
            return prop.type
        }
        const propString = Object.keys(component.props).map(prop => `${prop}: ${getPropType(component.props[prop])}, //${component.props[prop].tips || ''}`).join('\n')
        const eventString = component.events.map(event => `${event.name}, //${event.tips || ''}`).join('\n')
        return [
            `type: \'${component.type}\'`,
            `props: { ${propString} }`,
            `event: { ${eventString} }`
        ].join('\n')
    }
    const handleGet = (componentType) => {
        const framework = LC.getFramework()
        const components = framework === 'vue3'
            ? LC.platform === 'MOBILE' ? vue3Materials.vant : vue3Materials.bk
            : LC.platform === 'MOBILE' ? vue2Materials.vant : vue2Materials.bk
        const component = components.find(component => component.type === componentType)
        cmdMessage.value += [
            '',
            '# cmd',
            `The complete configuration of the ${componentType} component is as follows:`,
            getComponentConfig(component)
        ].join('\n')
    }
    const handleGetInfo = (componentId) => {
        const node = getNode(componentId)
        if (!node) {
            handleComponentNotExist(
                `Get configuration of ${componentId} component failed`,
                componentId
            )
            return
        }
        // 减少重复无意义 token
        const nodeJson = node.toJSON()
        Object.keys(nodeJson.renderProps).forEach((key) => {
            const renderProp = nodeJson.renderProps[key]
            if (Array.isArray(renderProp.code)) {
                renderProp.code = renderProp.code.slice(0, 1)
            }
            if (Array.isArray(renderProp.renderValue)) {
                renderProp.renderValue = renderProp.renderValue.slice(0, 1)
            }
        })
        cmdMessage.value += [
            '',
            '# cmd',
            `The complete configuration of the ${componentId} component is as follows:`,
            JSON.stringify(nodeJson)
        ].join('\n')
    }
    const handleInsertComponentIntoComponent = (componentId, childComponentType, childComponentId) => {
        // 父节点是否存在
        const parentNode = getNode(componentId)
        if (!parentNode) {
            cmdMessage.value += [
                '# cmd',
                `appendChild failed! the componentId ${componentId} does not exist! Please rethink and reissue the command.`
            ].join('\n')
            return
        }
        // 子节点是否存在
        const isChildExist = getNode(childComponentId)
        if (isChildExist) {
            cmdMessage.value += [
                '# cmd',
                `appendChild failed! the componentId ${childComponentId} already exists! Please generate a new componentId and reissue the command.`
            ].join('\n')
            return
        }
        const node = LC.createNode(childComponentType)
        Object.values(createHacker).forEach(task => task(node, node.material))
        node.componentId = childComponentId
        parentNode.appendChild(node)
        cmdMessage.value += [
            '# cmd',
            `success append ${childComponentId} to ${componentId}`,
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }

    return {
        handleSetProp,
        handleSetStyle,
        handleSetAlign,
        handleSetEvent,
        handleSetSlot,
        handleDelete,
        handleInsert,
        handleSelect,
        handleGetAll,
        handleGet,
        handleGetInfo,
        handleInsertComponentIntoComponent
    }
}
