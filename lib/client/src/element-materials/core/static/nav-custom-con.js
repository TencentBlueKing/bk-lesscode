import createNode from './create-node'
import { traverse, createNodeFromData } from './parse-data'
export let navCustomCon = {}

const complexSideCustomConMap = {}

// 设置顶部导航拖拽区域
export const setNavCustomCon = (data) => {
    if (data && data.type === 'render-block') {
        navCustomCon = data
    }
}

// 获取顶部导航拖拽区域
export const getNavCustomCon = () => {
    if (navCustomCon?.type !== 'render-block') {
        initNavCustomCon()
    }
    return navCustomCon
}

// 初始化顶部导航拖拽区域
export const initNavCustomCon = (data = []) => {
    navCustomCon = initNodeByCon(data)
}

const initNodeByCon = (data = []) => {
    const blockNode = createNode('render-block')
    if (data && data.length) {
        traverse(blockNode, data, 'default')
    } else {
        traverse(blockNode, [], 'default')
    }
    return blockNode
}

// 侧边导航的con为object类型、可以自由设置block的属性
export const getSideNavCustomConById = (id = '', con = {}) => {
    if (!id) return
    let currentNode = complexSideCustomConMap[id]
    if (currentNode?.type !== 'render-block') {
        if (con?.type === 'render-block') {
            currentNode = createNodeFromData(con)
            traverse(currentNode, con?.renderSlots?.default || [], 'default')
        } else {
            currentNode = initNodeByCon([])
            currentNode.setStyle('padding-bottom', '10px')
            currentNode.setStyle('padding-left', '12px')
            currentNode.setStyle('padding-right', '12px')
        }
        Object.assign(complexSideCustomConMap, { [id]: currentNode })
    }
    return currentNode
}

export const getSideNavCustomConsMap = () => {
    return complexSideCustomConMap || {}
}
