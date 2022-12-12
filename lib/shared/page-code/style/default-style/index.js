import getCommonStyle from './common-style'
import getPcStyle from './pc-style'
import getMobileStyle from './mobile-style'

/**
 * @desc 返回对应平台类型页面的内置样式
 * @param { String } uniqueKey 页面唯一标识
 * @param { String } platform 平台： PC/MOBILE
 * @returns { String }
 */
export default function (uniqueKey, platform = 'PC') {
    let defaultCss = getCommonStyle(uniqueKey)
    if (platform === 'MOBILE') {
        defaultCss += getMobileStyle()
    } else {
        defaultCss += getPcStyle()
    }
    return defaultCss
}
