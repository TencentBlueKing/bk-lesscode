import getCommonStyle, { getStaticCommonStyle } from './common-style'
import getPcStyle from './pc-style'
import getMobileStyle from './mobile-style'

/**
 * @desc 返回对应平台类型页面的内置样式
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    const { uniqueKey, platform = 'PC', isStaticCommonStyle, pageType = 'vueCode' } = code
    let defaultCss = getCommonStyle(uniqueKey)
    const staticCommonCss = getStaticCommonStyle(isStaticCommonStyle, pageType)
    defaultCss = (pageType === 'projectCode')
        ? defaultCss = staticCommonCss + defaultCss
        : defaultCss += staticCommonCss
    if (platform === 'MOBILE') {
        defaultCss += getMobileStyle()
    } else {
        defaultCss += getPcStyle()
    }
    return defaultCss
}
