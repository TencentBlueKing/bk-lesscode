import mergeDataToNode from '../helper/merge-data-to-node'
import getRoot from './get-root'
import create, { createNode } from './create-node'
import {
    triggerEventListener
} from '../event'
import LC from '../index'

let isClone = false

let isHistory = false

/**
 * @desc 通过 JSON 创建 Node
 * @param { Object } data
 * @returns { Node }
 */
export const createNodeFromData = (data) => {
    try {
        const typeMap = {
            'img': 'bk-image',
            'bk-table': 'widget-bk-table'
        }
        const newNode = createNode(typeMap[data.type] || data.type)
        newNode.tabPanelActive = data.tabPanelActive || 'props'
        if (!isClone) {
        // fix: 老数据存在 componentId 为空的情况
            if (data.componentId) {
                newNode.componentId = data.componentId
            }
        }

        mergeDataToNode(data, newNode)

        newNode.name = data.name
        newNode._isMounted = true
        newNode.interactiveShow = false
        newNode.isComplexComponent = Boolean(data.complex)
        newNode.isInteractiveComponent = Boolean(data.interactive)
        newNode.isCustomComponent = Boolean(data.custom)

        if (isHistory) {
            newNode.renderKey = data.renderKey
        }

        return newNode
    } catch {
        return null
    }
}

/**
 * @desc 遍历 JSON
 * @param { Node } parentNode
 * @param { Array } childDataList
 * @param { String } slot
 */
export const traverse = (parentNode, childDataList, slot) => {
    // 如果没有conpomentId的item，直接忽略
    childDataList = childDataList.filter(item => item?.componentId)
    childDataList.forEach(childData => {
        const childNode = createNodeFromData(childData)

        // 页面中的组件物料被删除跳过组件处理
        if (!childNode) {
            return
        }

        if (childNode.layoutType) {
            // 布局类型的组件
            // slot 的值类型 Array
            traverse(childNode, childData.renderSlots.default, 'default')
        } else if (childNode.layoutSlot) {
            // slot 为布局类型组件
            // slot 的值类型为 Node
            Object.keys(childNode.layoutSlotType).forEach(slotName => {
                const slotData = childData.renderSlots[slotName]
                if (Object.prototype.toString.call(slotData) === '[object Object]') {
                    traverse(childNode, [slotData], slotName)
                } else if (Array.isArray(slotData)) {
                    // TODO. 这种情况应该不会出现
                    console.error('\n\n\n\n\n ========== go die ========== \n\n\n\n')
                    traverse(childNode, slotData, slotName)
                }
            })
        } else {
            childNode.renderSlots = childData.renderSlots || {}
        }
        if (parentNode.layoutType) {
            parentNode.appendChild(childNode, slot)
        } else if (parentNode.layoutSlotType[slot]) {
            parentNode.renderSlots[slot] = childNode
        }
    })
}

export default function (data) {
    const root = getRoot()
    root.setRenderSlots([])

    try {
        root.renderSlots.default = []
        traverse(root, data, 'default')
        LC._ready()
    } catch (error) {
        console.error(error)
        triggerEventListener('error')
    }
}

export const parseTemplate = data => {
    try {
        isClone = true
        const root = create('render-column')
        traverse(root, data, 'default')
        return root.children[0]
    } finally {
        isClone = false
    }
}

export const parseHistory = data => {
    const root = getRoot()
    root.setRenderSlots([])

    try {
        isHistory = true
        root.renderSlots.default = []
        traverse(root, data, 'default')
    } catch (error) {
        console.error(error)
        triggerEventListener('error')
    } finally {
        isHistory = false
    }
}
