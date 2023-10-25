import parseData, { createNodeFromData } from './static/parse-data'
import parseTemplate from './static/parse-template'
import parseHistory from './static/parse-history'
import getRoot from './static/get-root'
import getMaterial, { registerMaterial, unregisterMaterial } from './static/get-material'
import getActiveNode from './static/get-active-node'
import getNodeById from './static/get-node-by-id'
import getNodesByType from './static/get-nodes-by-type'
import createNode from './static/create-node'
import editNode from './static/edit-node'
import reset from './static/reset'

import isNode from './static/is-node'
import isInteractiveType from './static/is-interactive-type'
import isLayoutType from './static/is-layout-type'
import utils from './static/utils'
import { getFramework, setFramework } from './static/framework'
import { getNavCustomCon, initNavCustomCon } from './static/nav-custom-con'

import { setActiveElement, getActiveElement, resetActiveElement } from './static/custom-container'

import cloneNode from './extends/clone-node'
import appendChild from './extends/append-child'
import removeChild from './extends/remove-child'

import {
    resetEventListener,
    addEventListener,
    removeEventListener,
    triggerEventListener
} from './event'

import {
    showMenu,
    clearMenu
} from './menu'

import { execCommand } from './helper/commands'

import {
    getPageStyle,
    setPageStyle
} from './page-style'

function core (id) {
    if (!id) {
        return getRoot()
    }

    const node = getNodeById(id)
    if (!node) {
        return undefined
    }

    return node
}

core.__isReady = false
core.__isUnloaded = false
core.__isMounted = false
// 数据解析 JSON -> NodeTree
core.parseData = parseData
core.createNodeFromData = createNodeFromData
core.parseTemplate = parseTemplate
core.parseHistory = parseHistory
// 扩展 material 注册
core.registerMaterial = registerMaterial
// NodeTree 操作 api
core.getRoot = getRoot
core.getMaterial = getMaterial
core.getActiveNode = getActiveNode
core.getNodeById = getNodeById
core.getNodesByType = getNodesByType
core.isNode = isNode
core.isInteractiveType = isInteractiveType
core.isLayoutType = isLayoutType
core.utils = utils
core.createNode = createNode
core.editNode = editNode
core.reset = reset
core.cloneNode = cloneNode
core.appendChild = appendChild
core.removeChild = removeChild

core.setActiveElement = setActiveElement
core.getActiveElement = getActiveElement
core.resetActiveElement = resetActiveElement

core.addEventListener = addEventListener
core.removeEventListener = removeEventListener
core.triggerEventListener = triggerEventListener

// 右键快捷面板
core.showMenu = showMenu
core.clearMenu = clearMenu

// 执行快捷命令
core.execCommand = execCommand

// platform: 'PC' | 'MOBILE'
core.platform = 'PC'

// 框架
core.getFramework = getFramework
core.setFramework = setFramework

// 导航自定义拖拽区域
core.getNavCustomCon = getNavCustomCon
core.initNavCustomCon = initNavCustomCon

core._ready = () => {
    core.__isUnloaded = false
    core.__isReady = true
    triggerEventListener('ready')
}

core._unload = () => {
    if (core.__isUnloaded) {
        return
    }
    core.__isReady = false
    core.__isMounted = false
    core.__isUnloaded = true

    // 清空画布
    const root = getRoot()
    root.children.forEach(children => {
        root.removeChild(children)
    })
    // 卸载时需要移除所有动态注册的 material
    unregisterMaterial()
    triggerEventListener('unload')
    // 卸载时需要移除所有事件监听
    resetEventListener()
}

core._mounted = () => {
    core.__isMounted = true
    triggerEventListener('mounted')
}

Object.defineProperty(core, 'pageStyle', {
    set (value) {
        setPageStyle(value)
    },
    get () {
        return getPageStyle()
    }
})

export default core
