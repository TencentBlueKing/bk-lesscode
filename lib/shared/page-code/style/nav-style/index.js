import getPcNavStyle from './pc-nav'
import getMobileNavStyle from './mobile-nav'

/**
 * @desc 返回导航布局样式
 * @param { String } platform  平台： PC/MOBILE
 * @param { String } layoutType 导航类型
 * @param { String } layoutContent 导航具体配置
 * @returns { String }
 */
export default function (platform, layoutType, layoutContent) {
    if (platform === 'MOBILE') {
        return getMobileNavStyle(layoutType, layoutContent)
    } else {
        return getPcNavStyle(layoutType, layoutContent)
    }
}
