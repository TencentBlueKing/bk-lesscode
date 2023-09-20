import { paramCase } from 'change-case'
import { unitFilter } from '../../util'

import safeStringify from '../../../client/src/common/json-safe-stringify'

/**
 * @desc 判断输入值的类型
 * @param { String } val 需要判读的值
 * @returns { String } 类型
 */
export function getValueType (val) {
    const Fn = Function
    let type = 'undefined'
    // 用户输入的不符合规范的json，按照字符串处理
    try {
        type = new Fn(`return typeof ${val}`)()
    } catch (error) {
    }
    return type
}

/**
 * @desc 根据methodCode函数函数信息
 * @param { String } methodCode 函数code
 * @param { Array } funcGroups 项目用到的函数列表
 * @returns { Array } [函数配置、参数信息]
 */
export function getMethodByCode (methodCode, funcGroups = []) {
    let params = []

    if (typeof methodCode === 'object') {
        params = methodCode.params || []
        methodCode = methodCode.methodCode
    }
    const res = funcGroups.map(group => group.children).flat().find(func => func.funcCode === methodCode)
    return [res || {}, params]
}

/**
 * @desc 获取写在template的value
 * @param { String } val 需要处理的值
 * @returns { String } 处理后的value
 */
export function getValue (val) {
    let value = val
    const type = getValueType(val)
    switch (type) {
        case 'undefined':
            value = `'${val}'`
            if (val === 'undefined') value = 'undefined'
            break
    }
    if (/[^\.\=><]+[\.\=><\']+[^\.\=><\']+/.test(val)) value = val
    return value
}

/**
 * @desc 将不同类型的值转换为字符串
 * @param { Any } val 需要处理的值
 * @returns { String } 处理后的值
 */
export function transformToString (val) {
    const type = typeof val
    let res
    switch (type) {
        case 'object':
            res = safeStringify(val)
            break
        case 'string':
            res = `'${val}'`
            break
        default:
            res = val
            break
    }
    return res
}

/**
 * @desc 合并属性面板样式和自定义样式，并统一转成连字符
 * @param { Object } renderStyles 组件的样式配置
 * @returns { Object } 合并处理后的styles
 */
export function handleRenderStyles (renderStyles = {}) {
    const styles = {}
    if (renderStyles && typeof renderStyles === 'object' && Object.keys(renderStyles).length > 0) {
        if (renderStyles['customStyle']) {
            Object.assign(renderStyles, renderStyles['customStyle'])
            delete renderStyles['customStyle']
        }
        for (const key in renderStyles) {
            if (renderStyles[key]) {
                Object.assign(styles, { [paramCase(key)]: unitFilter(renderStyles[key]) })
            }
        }
    }
    return styles
}

/**
 * @desc 生成处理freeeLayoutItem的css，并处理内部component的styles
 * @param { Object } styles 组件的样式配置
 * @returns { Object } { css、 styles }
 */
export function getFreeLayoutItemStyle (styles = {}) {
    let css = 'position: absolute;'
    delete styles.position
    // 自由布局部分属性需要设置在外层div
    const containerStyles = ['top', 'left', 'margin-left', 'margin-bottom', 'margin-right', 'margin-top', 'margin', 'z-index']
    containerStyles.forEach(style => {
        if (styles[style]) {
            css += ` ${style}: ${styles[style]};`
            delete styles[style]
        }
    })
    if (styles.height && styles.height.endsWith('%')) {
        css += ` height: ${styles.height};`
        styles.height = '100%'
    }
    if (styles.width && styles.width.endsWith('%')) {
        css += ` width: ${styles.width};`
        styles.width = '100%'
    }
    return { css, styles }
}

/**
 * @desc 获取自动对齐相关的样式前缀
 * @param { Object } renderAlign 对齐相关的属性配置
 * @param { Boolean } inFreeLayout 是否在自由布局内
 * @returns { String } 样式前缀
 */
export function getAlignStr (renderAlign = {}, inFreeLayout = false) {
    let alignStr = ' '
    const prefix = inFreeLayout ? 'absolute-' : ''
    if (renderAlign.horizontal) {
        alignStr += `${prefix}${renderAlign.horizontal} `
    }
    if (renderAlign.vertical) {
        alignStr += `${prefix}${renderAlign.vertical} `
    }
    return alignStr
}
