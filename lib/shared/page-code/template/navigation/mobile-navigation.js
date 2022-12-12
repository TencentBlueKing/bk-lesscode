/**
 * @desc 移动端底部导航布局
 * @param { CodeModel } code
 * @param { Object } pageContent 页面主体内容
 * @param { Object } componentProps 导航属性配置
 * @returns { String }
 */
export function getMobileBottomLayout (code, pageContent, componentProps) {
    const menuKey = 'mobileBottomMenuLesscode'
    const { layoutContent } = code
    code.dataTemplate(menuKey, JSON.stringify(layoutContent.menuList))
    return `
        <div class="mobile-layout-wrapper">
            ${pageContent}
            <van-tabbar route ${componentProps}>
                <van-tabbar-item replace v-for="menu in ${menuKey}"
                    :key="menu.id"
                    :to="menu.fullPath"
                    :icon="menu.icon">
                    {{menu.name}}
                </van-tabbar-item>
            </van-tabbar>
        </div>
    `
}
