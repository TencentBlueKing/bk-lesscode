import useBase from './use-base'
import useComponent from './use-component'
import store from '@/store'

export default (cmdMessage) => {
    const {
        getNode,
        handleComponentNotExist
    } = useBase(cmdMessage)
    const {
        handleSelect
    } = useComponent(cmdMessage)

    const handleDataSourceTable = (componentId, tableName) => {
        const node = getNode(componentId)
        if (!node) {
            handleComponentNotExist(
                `Setting ${componentId} component to display data from the ${tableName} table failed`,
                componentId
            )
            return
        }
        const common = {
            format: 'value',
            code: [],
            renderValue: [],
            payload: {
                sourceData: {
                    tableName,
                    dataSourceType: 'preview',
                    showOperationColumn: true
                }
            }
        }
        if (node.type === 'widget-bk-table') {
            node.setRenderProps({
                ...node.renderProps,
                data: {
                    ...common,
                    valueType: 'table-data-source'
                }
            })
            // 选中并触发更新表头
            handleSelect(componentId)
            setTimeout(() => {
                const btn = document.querySelector('.prop-operation')
                btn.click()
            }, 10)
        } else if (node.type === 'bk-select') {
            node.setSlot('default', {
                ...node.renderSlots.default,
                ...common,
                valueType: 'select-data-source'
            })
        } else if (node.type === 'bk-transfer') {
            node.setProp({
                'source-list': {
                    ...node.renderProps['source-list'],
                    ...common,
                    valueType: 'data-source'
                }
            })
        }
        cmdMessage.value += [
            '',
            '# cmd',
            `Successfully set ${componentId} component to display data from the ${tableName} table`,
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }
    const handleDataSourceMethod = (componentId, functionCode) => {
        const item = store.getters['functions/functionList'].find(x => x.funcCode === functionCode)
        if (!item) {
            cmdMessage.value += [
                '',
                '# cmd',
                `Setting ${componentId} component to display data from the ${functionCode} function failed. The function "${functionCode}" does not exist. please rethink and issue commands`
            ].join('\n')
            return
        }
        const node = getNode(componentId)
        if (!node) {
            handleComponentNotExist(
                `Setting ${componentId} component to display data from the ${functionCode} function failed`,
                componentId
            )
            return
        }

        const material = node.material
        let propHasRemote = false
        Object.keys(material.props || {}).forEach((key) => {
            const prop = material.props[key]
            const valueType = prop.type?.find?.(item => item.includes('remote'))
            if (valueType) {
                propHasRemote = true
                node.setProp({
                    [key]: {
                        ...node.renderProps[key],
                        valueType,
                        payload: {
                            methodCode: functionCode,
                            params: []
                        }
                    }
                })
            }
        })
        if (node.type === 'widget-bk-table') {
        // 选中并触发更新表头
            handleSelect(componentId)
            setTimeout(() => {
                const btn = document.querySelector('.prop-operation')
                btn.click()
            }, 10)
        }
        if (!propHasRemote) {
            Object.keys(material.slots || {}).forEach((key) => {
                const slot = material.slots[key]
                const valueType = slot.type?.find?.(item => item.includes('remote'))
                if (valueType) {
                    node.setSlot(key, {
                        ...node.renderSlots[key],
                        valueType,
                        payload: {
                            methodData: {
                                methodCode: functionCode,
                                params: []
                            }
                        }
                    })
                }
            })
        }
        cmdMessage.value += [
            '',
            '# cmd',
            `Successfully set ${componentId} component to display data from the ${functionCode} function`,
            'Have you finished the task? If so, call `done()`. Otherwise please continue.'
        ].join('\n')
    }

    return {
        handleDataSourceTable,
        handleDataSourceMethod
    }
}
