import createNode from './create-node'
import { traverse } from './parse-data'
export let navCustomCon = {}

// 设置导航拖拽区域
export const setNavCustomCon = (data) => {
    if (data && data.type === 'render-block') {
        navCustomCon = data
    }
}

// 获取导航拖拽区域
export const getNavCustomCon = () => {
    if (navCustomCon?.type !== 'render-block') {
        initNavCustomCon()
    }
    return navCustomCon
}

// 初始化导航拖拽区域
export const initNavCustomCon = (data = []) => {
    const blockNode = createNode('render-block')
    if (data && data.length) {
        traverse(blockNode, data, 'default')
    } else {
        traverse(blockNode, [], 'default')
    }
    navCustomCon = blockNode
}
