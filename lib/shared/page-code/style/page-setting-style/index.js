import { paramCase } from 'change-case'
import { handleRenderStyles } from '../../common/utils'

/**
 * @desc 返回页面设置样式
 * @param { String } pageStyle 页面样式配置
 * @param { String } platform  平台： PC/MOBILE
 * @returns { String }
 */
export default function (pageStyle = '', platform = 'PC') {
    let settingStyle = ''
    const styleSetting = typeof pageStyle === 'string' ? JSON.parse(pageStyle) : pageStyle

    // 页面内置padding
    const defaultPadding = platform === 'PC'
        ? { 'padding-left': '24px', 'padding-right': '24px', 'padding-top': '20px', 'padding-bottom': '0px' }
        : { 'padding': '0' }

    const pageSetting = Object.assign({}, defaultPadding, styleSetting)
    
    const styleSettings = handleRenderStyles(pageSetting)
    for (const i in styleSettings) {
        if (styleSettings[i] !== '') {
            settingStyle += `${paramCase(i)}: ${styleSettings[i]};\n`
        }
    }
    !styleSettings['height'] && (settingStyle += 'height: 100%')

    return settingStyle
}
