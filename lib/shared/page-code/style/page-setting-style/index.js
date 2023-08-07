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

    if (platform === 'PC') {
        // 页面内置padding
        if (!styleSetting['paddingLeft']) {
            styleSetting['paddingLeft'] = '24px'
        }
        if (!styleSetting['paddingRight']) {
            styleSetting['paddingRight'] = '24px'
        }
        if (!styleSetting['paddingTop']) {
            styleSetting['paddingTop'] = '20px'
        }
        if (!styleSetting['overflow']) {
            styleSetting['overflow'] = 'overlay'
        }
    }
    
    const styleSettings = handleRenderStyles(styleSetting)
    for (const i in styleSettings) {
        if (styleSettings[i] !== '') {
            settingStyle += `${paramCase(i)}: ${styleSettings[i]};\n`
        }
    }
    !styleSettings['height'] && (settingStyle += 'height: 100%')

    return settingStyle
}
