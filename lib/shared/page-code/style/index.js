import getPageSetting from './page-setting-style'
import getDefaultStyle from './default-style'
import getNavStyle from './nav-style'

/**
 * @desc 获取页面样式， 页面样式由 导航布局样式 + 页面设置样式 + 页面拖拽组件的样式 + 页面默认内置样式
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    let head = ''
    let defaultStyle = ''
    let layoutStyle = ''
    let settingStyle = ''
    
    head = '<style lang="css" scoped>'

    // 根据页面类型，获取默认内置样式
    defaultStyle = getDefaultStyle(code.uniqueKey, code.platform)

    if (code.hasLayout) {
        // 获取导航布局样式
        layoutStyle = getNavStyle(code.platform, code.layoutType, code.layoutContent)
    }

    // 获取页面配置样式
    const pageStyle = getPageSetting(code.styleSetting, code.platform)
    settingStyle = `.container-${code.uniqueKey} {
        ${pageStyle}
    }`
    
    return head + layoutStyle + settingStyle + code.cssStr + defaultStyle + '</style>\n'
}
