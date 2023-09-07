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

/**
 * 生成移动端侧边布局
 * @param {Object} code - 代码对象
 * @param {string} pageContent - 页面内容
 * @param {string} componentProps - 组件属性
 * @returns {string} - 生成的移动端侧边布局
 */
export function getMobileSideLayout (code, pageContent, componentProps) {
    const menuKey = 'mobileSideMenuLesscode'
    const activeKey = 'activeSideMenu'
    const { layoutContent, pageId } = code

    // 匹配当前路由，设置导航激活状态
    let activeIndex = 0
    layoutContent.menuList.find((menu, index) => {
        if (+menu.pageId === +pageId) {
            activeIndex = index
        }
    })

    code.dataTemplate(menuKey, JSON.stringify(layoutContent.menuList)) // 生成menuList变量
    code.dataTemplate(activeKey, activeIndex) // 生成activeSideMenu变量
    return `
        <div class="mobile-layout-wrapper sidebar-layout-wrapper">
            <van-sidebar route ${componentProps} v-model="activeSideMenu">
                <van-sidebar-item replace v-for="menu in ${menuKey}"
                    :key="menu.id"
                    :title="menu.name"
                    :to="menu.fullPath"
                    :dot="menu.dot"
                    :badge="menu.badge"
                    :disabled="menu.disabled">
                    {{menu.name}}
                </van-sidebar-item>
            </van-sidebar>
            ${pageContent}
        </div>
    `
}
