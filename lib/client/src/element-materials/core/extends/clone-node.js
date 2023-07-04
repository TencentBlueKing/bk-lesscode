import _ from 'lodash'
import isNode from '../static/is-node'
import { createNode } from '../static/create-node'
import { updateFormItemVMode } from '../static/parse-template'
import { camelCase, camelCaseTransformMerge } from 'change-case'

const mergeData = (newNode, oldNode, deep) => {
    newNode.renderStyles = _.cloneDeep(oldNode.renderStyles)
    newNode.renderProps = _.cloneDeep(oldNode.renderProps)
    newNode.renderDirectives = _.cloneDeep(oldNode.renderDirectives)
    newNode.renderEvents = _.cloneDeep(oldNode.renderEvents)
    newNode.renderAlign = _.cloneDeep(oldNode.renderAlign)
    newNode.isInteractiveComponent = oldNode.isInteractiveComponent
    newNode.isComplexComponent = oldNode.isComplexComponent
    newNode.isCustomComponent = oldNode.isCustomComponent

    // 深度克隆，处理层级
    if (deep) {
        if (oldNode.layoutType) {
            // 本身是布局类型组件
            newNode.renderSlots = {
                default: oldNode.renderSlots.default.map(childNode => {
                    const dupNode = createNode(childNode.type, childNode.name)
                    mergeData(dupNode, childNode, deep)
                    return dupNode
                })
            }
        } else if (oldNode.layoutSlot) {
            // 组件的 slot 是布局类型组件
            newNode.renderSlots = Object.keys(oldNode.renderSlots).reduce((renderSlots, slotName) => {
                const curSlot = oldNode.renderSlots[slotName]
                if (isNode(curSlot)) {
                    const dupNode = createNode(curSlot.type, curSlot.name)
                    mergeData(dupNode, curSlot, deep)
                    renderSlots[slotName] = dupNode
                } else {
                    renderSlots[slotName] = _.cloneDeep(curSlot)
                }
                return renderSlots
            }, {})
        } else {
            newNode.renderSlots = _.cloneDeep(oldNode.renderSlots)
        }
    }
}

const hasUsedVFor = (node) => {
    const renderDirectives = node.renderDirectives || []
    const vForDirective = renderDirectives.find(renderDirective => renderDirective.type === 'v-for')
    return vForDirective && vForDirective.code
}

// 更新 v-for 使用的 v-for item
const syncVForVModel = (targetNode, originNode, replaceFunction) => {
    // 记录更新方法
    let replaceFun = replaceFunction
    if (hasUsedVFor(targetNode)) {
        replaceFun = (str) => str.replace(
            `${camelCase(originNode.componentId, { transform: camelCaseTransformMerge })}Item`,
            `${camelCase(targetNode.componentId, { transform: camelCaseTransformMerge })}Item`
        )
    }
    // 更新
    const renderProps = targetNode.renderProps || {}
    Object
        .keys(renderProps)
        .forEach((renderPropKey) => {
            const renderProp = renderProps[renderPropKey]
            if (renderProp.format === 'expression') {
                renderProp.code = replaceFun(renderProp.code)
            }
        })
    const renderSlots = targetNode.renderSlots || {}
    Object
        .keys(renderSlots)
        .forEach((renderSlotKey) => {
            const renderSlot = renderSlots[renderSlotKey]
            if (renderSlot.format === 'expression') {
                renderSlot.code = replaceFun(renderSlot.code)
            }
        })
    
    // 表单容器componentId需要单独处理
    if (targetNode.type === 'widget-form') {
        updateFormItemVMode(targetNode)
    }

    // 更新子元素
    targetNode.children.forEach((childNode, index) => {
        syncVForVModel(childNode, originNode.children[index], replaceFun)
    })
}

/**
 * @desc 克隆节点
 * @param { Node } node
 * @param { Boolean } deep 是否采用深度克隆,如果为true,则该节点的所有后代节点也都会被克隆,如果为false,则只克隆该节点本身
 * @returns { Node }
 */
export default function (node, deep = true) {
    if (!isNode(node)) {
        throw new Error(window.i18n.t('node 不是 Node 类型'))
    }
    const dupNode = createNode(node.type, node.name)
    mergeData(dupNode, node, deep)
    // 克隆节点的时候需要更新 v-for 的使用
    syncVForVModel(dupNode, node)
    return dupNode
}
