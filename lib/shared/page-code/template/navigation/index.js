import { getTopBottomLayout, getLeftRightLayout, getComplexLayout } from './web-navigation'
import { getMobileBottomLayout, getMobileSideLayout } from './mobile-navigation'

/**
 * @desc 生成导航布局相关template
 * @param { CodeModel } code
 * @param { Object } pageContent 页面主体内容
 * @returns { String }
 */
export default function (code, pageContent) {
    const { layoutContent } = code

    // 解析配置中的
    const hasTopMenu = layoutContent.topMenuList && layoutContent.topMenuList.length
    const hasLeftMenu = layoutContent.menuList && layoutContent.menuList.length
    if (!hasLeftMenu && !hasTopMenu) return pageContent

    code.dataTemplate('curNav', '{}')

    // 预览时，导航显示当前用户
    if (['preview', 'previewSingle'].includes(code.pageType)) {
        const user = JSON.stringify(code.user)
        code.dataTemplate('user', user)
    }

    // 解析导航上的props配置
    const renderProps = layoutContent.renderProps || {}
    const propArray = []
    for (const prop in renderProps) {
        const value = renderProps[prop]
        const isString = typeof value === 'string'
        const perStr = isString ? '' : ':'
        propArray.push(`${perStr}${prop}="${value}"`)
    }
    const componentProps = propArray.join(' ')
    // 根据导航类型、生成对应的导航template代码
    switch (code.layoutType) {
        case 'top-bottom':
            return getTopBottomLayout(code, pageContent, componentProps)
        case 'left-right':
            return getLeftRightLayout(code, pageContent, componentProps)
        case 'complex':
            return getComplexLayout(code, pageContent, componentProps)
        case 'mobile-bottom':
            return getMobileBottomLayout(code, pageContent, componentProps)
        case 'mobile-side':
            return getMobileSideLayout(code, pageContent, componentProps)
    }
}
