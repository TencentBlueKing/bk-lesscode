import generateLayout from '../page/layout'
import generateHelpMenu from '../page/layout/help-menu-layout'

/**
 * @desc pc端顶部导航布局
 * @param { CodeModel } code
 * @param { Object } pageContent 页面主体内容
 * @param { Object } componentProps 导航属性配置
 * @returns { String }
 */
export function getTopBottomLayout (code, pageContent, componentProps) {
    const topMenuKey = 'topMenuLesscode'
    const { layoutContent } = code
    const topMenuBackground = layoutContent.themeConfig?.topMenuBackground || '#182132'
    const isDefaultTheme = topMenuBackground === '#182132' // 默认主题
    const isWhiteTheme = topMenuBackground === '#ffffff' // 白色主题
    code.dataTemplate(topMenuKey, JSON.stringify(layoutContent.topMenuList))

    if (code.framework === 'vue3') {
        return `
            <bk-navigation ${componentProps} navigation-type="top-bottom" :need-menu="false" class="bk-layout-custom-component-wrapper">
                <template #side-header>
                    <span class="title-icon">
                        <img src="${layoutContent.logo}" style="width: 28px; height: 28px;">
                    </span>
                    <span class="title-desc">${layoutContent.siteName}</span>
                </template>
                <template v-slot:header>
                    <div class="navigation-header">
                        <ol class="header-nav">
                            <bk-popover v-for="item in  ${topMenuKey}" :disabled="!item.children || item.children.length <= 0" :key="item.id" theme="light navigation-message empty-padding" :arrow="false" offset="0, -5" placement="bottom" :tippy-options="{ flipBehavior: ['bottom'], appendTo: 'parent' }">
                                <li class="header-nav-item" :class="{ 'item-active': item.id === curNav.id }" @click="goToPage(item)">
                                    {{item.name}}
                                </li>
                                <template #content>
                                    <ul class="navigation-head-nav">
                                        <li class="nav-item" v-for="headerNavItem in item.children" :key="headerNavItem.id" @click="goToPage(headerNavItem)">
                                            {{headerNavItem.name}}
                                        </li>
                                    </ul>
                                </template>
                            </bk-popover>
                        </ol>
                        <div class="header-right-area">
                            <div class="custom-area">
                                ${generateLayout(code, layoutContent.customMenuCon || [])}
                            </div>
                            ${generateHelpMenu(code, isWhiteTheme, '#content')}
                            <bk-popover class="nav-head-right" theme="light navigation-message empty-padding" :arrow="false" offset="-10, 0" placement="bottom-start" :tippy-options="{ 'hideOnClick': false, appendTo: 'parent' }">
                                <div class="header-user">
                                    <span>{{ user.username }}</span>
                                    <i class="bk-icon icon-down-shape"></i>
                                </div>
                                <template #content>
                                    <span @click="signOut" class="nav-sign-out">退出登录</span>
                                </template>
                            </bk-popover>
                        </div>
                    </div>
                </template>
                ${pageContent}
            </bk-navigation>
        `
    }

    return `
        <bk-navigation head-theme-color=${topMenuBackground} ${componentProps} navigation-type="top-bottom" :need-menu="false" class="bk-layout-custom-component-wrapper" :class="{ 'white-navigation': ${isWhiteTheme} }">
            <template slot="side-header">
                <span class="title-icon">
                    <img src="${layoutContent.logo}" style="width: 28px; height: 28px;">
                </span>
                <span class="title-desc" :class="{ 'theme-style': ${!isDefaultTheme} }">${layoutContent.siteName}</span>
            </template>
            <div class="navigation-header" slot="header">
                <ol class="header-nav">
                    <bk-popover v-for="item in  ${topMenuKey}" :disabled="!item.children || item.children.length <= 0" :key="item.id" theme="light navigation-message" :arrow="false" offset="0, -5" placement="bottom" :tippy-options="{ flipBehavior: ['bottom'], appendTo: 'parent' }">
                        <li class="header-nav-item" :class="{ 'item-active': item.id === curNav.id, 'theme-item': ${!isDefaultTheme} }" @click="goToPage(item)">
                            {{item.name}}
                        </li>
                        <template slot="content">
                            <ul class="navigation-head-nav">
                                <li class="nav-item" v-for="headerNavItem in item.children" :key="headerNavItem.id" @click="goToPage(headerNavItem)">
                                    {{headerNavItem.name}}
                                </li>
                            </ul>
                        </template>
                    </bk-popover>
                </ol>
                <div class="header-right-area">
                    <div class="custom-area">
                        ${generateLayout(code, layoutContent.customMenuCon || [])}
                    </div>
                    ${generateHelpMenu(code, isWhiteTheme, 'slot="content"')}
                    <bk-popover class="nav-head-right" theme="light navigation-message" :arrow="false" offset="-10, 0" placement="bottom-start" :tippy-options="{ 'hideOnClick': false, appendTo: 'parent' }">
                        <div class="header-user" :class="{ 'theme-style': ${!isDefaultTheme} }">
                            <span>{{ user.username }}</span>
                            <i class="bk-icon icon-down-shape"></i>
                        </div>
                        <template slot="content">
                            <span @click="signOut" class="nav-sign-out">退出登录</span>
                        </template>
                    </bk-popover>
                </div>
            </div>
            ${pageContent}
        </bk-navigation>
    `
}

/**
 * @desc pc端侧边导航布局
 * @param { CodeModel } code
 * @param { Object } pageContent 页面主体内容
 * @param { Object } componentProps 导航属性配置
 * @returns { String }
 */
export function getLeftRightLayout (code, pageContent, componentProps) {
    const leftMenuKey = 'leftMenuLesscode'
    const { layoutContent } = code
    const sideMenuBackground = layoutContent.themeConfig?.sideMenuBackground || '#182132'
    const sideMenuTheme = layoutContent.themeConfig?.sideMenuTheme || '#3c96ff'
    const isDefaultTheme = sideMenuBackground === '#182132' // 默认主题
    const isWhiteTheme = sideMenuBackground === '#ffffff' // 白色主题
    const isOtherTheme = !isDefaultTheme && !isWhiteTheme // 其他主题
    
    // 设置导航属性
    let themeColorProps = ''
    if (sideMenuBackground === '#ffffff') { // 白色主题需要设置以下属性
        themeColorProps += `
            \n item-active-color=${sideMenuTheme}
            \n item-active-icon-color=${sideMenuTheme}
            \n item-child-icon-active-color=${sideMenuTheme}
            \n item-default-bg-color=${sideMenuBackground}
            \n item-active-bg-color=${sideMenuTheme}1A
            \n item-hover-color='#63656e'
            \n item-hover-icon-color='#63656e'
            \n item-hover-bg-color='#f5f7fa'
            \n item-default-color='#63656e'
            \n item-default-icon-color='#63656e'
            \n item-child-icon-default-color='#63656e'
            \n sub-menu-open-bg-color='#fafbfd'
            `
    } else if (sideMenuBackground !== '#182132') { // 非默认背景色
        themeColorProps += `
            \n item-active-bg-color=${sideMenuTheme}
            \n item-default-bg-color=${sideMenuBackground}
            \n sub-menu-open-bg-color=${sideMenuBackground}
            \n item-hover-bg-color='#ffffff14'
            \n item-default-color='#ffffff'
            \n item-default-icon-color='#ffffff'
            \n item-child-icon-default-color='#ffffff'
            \n item-child-icon-active-color='#ffffff'
        `
    } else {
        themeColorProps += `
            \n item-default-bg-color=${sideMenuBackground}
            \n item-active-bg-color=${sideMenuTheme}
        `
    }

    code.dataTemplate(leftMenuKey, JSON.stringify(layoutContent.menuList))
    code.dataTemplate('toggleActive', 'false')
    if (code.framework === 'vue3') {
        return `
            <bk-navigation ${componentProps} navigation-type="left-right" need-menu class="bk-layout-custom-component-wrapper" @toggle="v => toggleActive=v" :class="{ 'white-theme': ${isWhiteTheme}, 'other-theme': ${isOtherTheme} }">
                <template #side-header>
                    <span class="title-icon">
                        <img src="${layoutContent.logo}" style="width: 28px; height: 28px;">
                    </span>
                    <span class="title-desc" :class="{ 'white-theme-title': ${isWhiteTheme} }">${layoutContent.siteName}</span>
                </template>
                <template #header>
                    <div class="navigation-header">
                        <div class="header-title">
                            {{curNav.name}}
                        </div>
                        <div class="header-right-area">
                            <div class="custom-area">
                                ${generateLayout(code, layoutContent.customMenuCon || [])}
                            </div>
                            ${generateHelpMenu(code, true, '#content')}
                            <bk-popover class="nav-head-right white-theme" theme="light navigation-message empty-padding" :arrow="false" offset="-10, 0" placement="bottom-start" :tippy-options="{ 'hideOnClick': false, appendTo: 'parent' }">
                                <div class="header-user">
                                    <span>{{ user.username }}</span>
                                    <i class="bk-icon icon-down-shape"></i>
                                </div>
                                <template #content>
                                    <span @click="signOut" class="nav-sign-out">退出登录</span>
                                </template>
                            </bk-popover>
                        </div>
                    </div>
                </template>
                <template #menu>
                    <bk-menu
                        :unique-open="false"
                        :active-key="curNav.id"
                        :opened-keys="${leftMenuKey}.map(child => child.id)"
                    >
                        <template v-for="child in ${leftMenuKey}">
                            <bk-submenu
                                @click="goToPage(child)"
                                v-if="child.children && child.children.length"
                                :key="child.id"
                                :title="child.name"
                            >
                                <template #icon v-if="child.icon">
                                    <i :class="\`bk-icon \${child.icon}\`"></i>
                                </template>
                                <bk-menu-item
                                    @click="goToPage(set)"
                                    v-for="set in child.children"
                                    :key="set.id"
                                >
                                    <span>{{set.name}}</span>
                                </bk-menu-item>
                            </bk-submenu>
                            <bk-menu-item
                                @click="goToPage(child)"
                                v-else
                                :key="child.id"
                            >
                                <template #icon>
                                    <i :class="\`bk-icon \${child.icon}\`" v-if="child.icon"></i>
                                </template>
                                <span>{{child.name}}</span>
                            </bk-menu-item>
                        </template>
                    </bk-menu>
                </template>
                ${pageContent}
            </bk-navigation>
        `
    }

    return `
        <bk-navigation ${componentProps} theme-color="${sideMenuBackground}" navigation-type="left-right" need-menu class="bk-layout-custom-component-wrapper" @toggle="v => toggleActive=v" :class="{ 'white-theme': ${isWhiteTheme}, 'other-theme': ${isOtherTheme} }">
            <template slot="side-header">
                <span class="title-icon">
                    <img src="${layoutContent.logo}" style="width: 28px; height: 28px;">
                </span>
                <span class="title-desc" :class="{ 'white-theme-title': ${isWhiteTheme} }">${layoutContent.siteName}</span>
            </template>
            <div class="navigation-header" slot="header">
                <div class="header-title">
                    {{curNav.name}}
                </div>
                <div class="header-right-area">
                    <div class="custom-area">
                        ${generateLayout(code, layoutContent.customMenuCon || [])}
                    </div>
                    ${generateHelpMenu(code, true, 'slot="content"')}
                    <bk-popover class="nav-head-right white-theme" theme="light navigation-message" :arrow="false" offset="-10, 0" placement="bottom-start" :tippy-options="{ 'hideOnClick': false, appendTo: 'parent' }">
                        <div class="header-user">
                            <span>{{ user.username }}</span>
                            <i class="bk-icon icon-down-shape"></i>
                        </div>
                        <template slot="content">
                            <span @click="signOut" class="nav-sign-out">退出登录</span>
                        </template>
                    </bk-popover>
                </div>
            </div>
            <bk-navigation-menu
                slot="menu"
                :default-active="curNav.id"
                :toggle-active="toggleActive"
                :class="{ 'white-theme-menu': ${isWhiteTheme}}"
                ${themeColorProps}>
                <bk-navigation-menu-item
                    @click="goToPage(child)"
                    :key="child.id"
                    v-for="child in ${leftMenuKey}"
                    :id="child.id"
                    :icon="child.icon"
                    :has-child="child.children && !!child.children.length">
                    <span>{{child.name}}</span>
                    <div slot="child">
                        <bk-navigation-menu-item
                            @click="goToPage(set)"
                            :key="set.id"
                            v-for="set in child.children"
                            :id="set.id"
                            :class="{ 'white-theme-menu-item': ${isWhiteTheme} && curNav.id !== set.id}">
                            <span>{{set.name}}</span>
                        </bk-navigation-menu-item>
                    </div>
                </bk-navigation-menu-item>
            </bk-navigation-menu>
            ${pageContent}
        </bk-navigation>
    `
}

/**
 * @desc pc端复合导航布局
 * @param { CodeModel } code
 * @param { Object } pageContent 页面主体内容
 * @param { Object } componentProps 导航属性配置
 * @returns { String }
 */
export function getComplexLayout (code, pageContent, componentProps) {
    const complexMenuKey = 'complexMenuLesscode'
    const curLeftMenuKey = 'leftMenuLesscode'
    const { layoutContent } = code
    const topMenuBackground = layoutContent.themeConfig?.topMenuBackground || '#182132'
    const isDefaultTopTheme = topMenuBackground === '#182132' // 默认主题
    const isWhiteTopTheme = topMenuBackground === '#ffffff' // 白色主题
    const sideMenuBackground = layoutContent.themeConfig?.sideMenuBackground || '#182132'
    const sideMenuTheme = layoutContent.themeConfig?.sideMenuTheme || '#3c96ff'
    const sideThemeColor = sideMenuBackground === '#182132' ? '#2C354D' : sideMenuBackground

    // 设置导航属性
    let themeColorProps = ''
    if (sideMenuBackground === '#ffffff') { // 白色主题需要设置以下属性
        themeColorProps += `
            \n item-active-color=${sideMenuTheme}
            \n item-active-icon-color=${sideMenuTheme}
            \n item-child-icon-active-color=${sideMenuTheme}
            \n item-default-bg-color=${sideMenuBackground}
            \n item-active-bg-color=${sideMenuTheme}1A
            \n item-hover-color='#63656e'
            \n item-hover-icon-color='#63656e'
            \n item-hover-bg-color='#f5f7fa'
            \n item-default-color='#63656e'
            \n item-default-icon-color='#63656e'
            \n item-child-icon-default-color='#63656e'
            \n sub-menu-open-bg-color='#fafbfd'
            `
    } else if (sideMenuBackground !== '#182132') { // 非默认背景色
        themeColorProps += `
            \n item-active-bg-color=${sideMenuTheme}
            \n item-default-bg-color=${sideMenuBackground}
            \n sub-menu-open-bg-color=${sideMenuBackground}
            \n item-hover-bg-color='#ffffff14'
            \n item-hover-color='#ffffff'
            \n item-child-icon-hover-color='#ffffff'
            \n item-hover-icon-color='#ffffff'
            \n item-default-color='#ffffff'
            \n item-default-icon-color='#ffffff'
            \n item-child-icon-default-color='#ffffff'
            \n item-child-icon-active-color='#ffffff'
        `
    } else {
        themeColorProps += `
            \n item-active-bg-color=${sideMenuTheme}
            \n item-default-bg-color='#2c354d'
            \n item-hover-bg-color='#3a4561'
            \n item-hover-color='#ffffff'
            \n item-active-color='#ffffff'
            \n item-default-color='#acb5c6'
            \n item-default-icon-color='#acb5c6'
            \n item-child-icon-default-color='#acb5c6;'
            \n item-child-icon-hover-color='#acb5c6;'
            \n item-active-icon-color='#ffffff'
            \n item-hover-icon-color='#ffffff'
            \n item-child-icon-active-color='#ffffff'
            \n sub-menu-open-bg-color='#272F45'
        `
    }

    code.dataTemplate('toggleActive', 'false')
    code.dataTemplate(complexMenuKey, JSON.stringify(layoutContent.topMenuList))
    code.dataTemplate(curLeftMenuKey, '[]')
    if (code.framework === 'vue3') {
        return `
            <bk-navigation ${componentProps} navigation-type="top-bottom" :need-menu="${curLeftMenuKey}.length > 0" class="bk-layout-custom-component-wrapper" @toggle="v => toggleActive=v">
                <template #side-header>
                    <span class="title-icon">
                        <img src="${layoutContent.logo}" style="width: 28px; height: 28px;">
                    </span>
                    <span class="title-desc" :class="{ 'theme-style': ${!isDefaultTopTheme} }">${layoutContent.siteName}</span>
                </template>
                <template #header>
                    <div class="navigation-header">
                        <ul class="header-nav">
                            <li v-for="(item) in ${complexMenuKey}" :class="{ 'is-complex-active': checkMenuActive(item), 'theme-item': ${!isDefaultTopTheme} }" :key="item.id" theme="light navigation-message" class="is-complex-item" @click="goToPage(item)">
                                {{item.name}}
                            </li>
                        </ul>
                        <div class="header-right-area">
                            <div class="custom-area">
                                ${generateLayout(code, layoutContent.customMenuCon || [])}
                            </div>
                            ${generateHelpMenu(code, isWhiteTopTheme, '#content')}
                            <bk-popover class="nav-head-right" theme="light navigation-message empty-padding" :arrow="false" offset="-10, 0" placement="bottom-start" :tippy-options="{ 'hideOnClick': false, appendTo: 'parent' }">
                                <div class="header-user" :class="{ 'theme-style': ${!isDefaultTopTheme} }">
                                    <span>{{ user.username }}</span>
                                    <i class="bk-icon icon-down-shape"></i>
                                </div>
                                <template #content>
                                    <span @click="signOut" class="nav-sign-out">退出登录</span>
                                </template>
                            </bk-popover>
                        </div>
                    </div>
                </template>
                <template #menu>
                    <bk-menu
                        :unique-open="false"
                        :active-key="curNav.id"
                        :opened-keys="${curLeftMenuKey}.map(child => child.id)"
                        :toggle-active="toggleActive"
                    >
                        <template v-for="child in ${curLeftMenuKey}">
                            <bk-submenu
                                @click="goToPage(child)"
                                v-if="child.children && child.children.length"
                                :key="child.id"
                                :title="child.name"
                            >
                                <template #icon v-if="child.icon">
                                    <i :class="\`bk-icon \${child.icon}\`"></i>
                                </template>
                                <bk-menu-item
                                    @click="goToPage(set)"
                                    v-for="set in child.children"
                                    :key="set.id"
                                >
                                    <span>{{set.name}}</span>
                                </bk-menu-item>
                            </bk-submenu>
                            <bk-menu-item
                                @click="goToPage(child)"
                                v-else
                                :key="child.id"
                            >
                                <template #icon>
                                    <i :class="\`bk-icon \${child.icon}\`" v-if="child.icon"></i>
                                </template>
                                <span>{{child.name}}</span>
                            </bk-menu-item>
                        </template>
                    </bk-menu>
                </template>
                ${pageContent}
            </bk-navigation>
        `
    }

    return `
        <bk-navigation ${componentProps} head-theme-color=${topMenuBackground} navigation-type="top-bottom" :need-menu="${curLeftMenuKey}.length > 0" class="bk-layout-custom-component-wrapper" @toggle="v => toggleActive=v" theme-color="${sideThemeColor}" :class="{ 'white-navigation': ${isWhiteTopTheme} }">
            <template slot="side-header">
                <span class="title-icon">
                    <img src="${layoutContent.logo}" style="width: 28px; height: 28px;">
                </span>
                <span class="title-desc" :class="{ 'theme-style': ${!isDefaultTopTheme} }">${layoutContent.siteName}</span>
            </template>
            <div class="navigation-header" slot="header">
                <ul class="header-nav">
                    <li v-for="(item) in ${complexMenuKey}" :class="{ 'is-complex-active': checkMenuActive(item), 'theme-item': ${!isDefaultTopTheme} }" :key="item.id" theme="light navigation-message" class="is-complex-item" @click="goToPage(item)">
                        {{item.name}}
                    </li>
                </ul>
                <div class="header-right-area">
                    <div class="custom-area">
                        ${generateLayout(code, layoutContent.customMenuCon || [])}
                    </div>
                    ${generateHelpMenu(code, isWhiteTopTheme, 'slot="content"')}
                    <bk-popover class="nav-head-right" theme="light navigation-message" :arrow="false" offset="-10, 0" placement="bottom-start" :tippy-options="{ 'hideOnClick': false, appendTo: 'parent' }">
                        <div class="header-user" :class="{ 'theme-style': ${!isDefaultTopTheme} }">
                            <span>{{ user.username }}</span>
                            <i class="bk-icon icon-down-shape"></i>
                        </div>
                        <template slot="content">
                            <span @click="signOut" class="nav-sign-out">退出登录</span>
                        </template>
                    </bk-popover>
                </div>
            </div>
            <bk-navigation-menu slot="menu" :default-active="curNav.id" :toggle-active="toggleActive" ${themeColorProps} :class="{ 'white-theme-menu': ${isWhiteTopTheme}}">
                <bk-navigation-menu-item
                    @click="goToPage(child)"
                    :key="child.id"
                    v-for="child in ${curLeftMenuKey}"
                    :id="child.id"
                    :icon="child.icon"
                    :has-child="child.children && !!child.children.length">
                    <span>{{child.name}}</span>
                    <div slot="child">
                        <bk-navigation-menu-item
                            @click="goToPage(set)"
                            :key="set.id"
                            v-for="set in child.children"
                            :id="set.id"
                            :class="{ 'white-theme-menu-item': ${isWhiteTopTheme} && curNav.id !== set.id}">
                            <span>{{set.name}}</span>
                        </bk-navigation-menu-item>
                    </div>
                </bk-navigation-menu-item>
            </bk-navigation-menu>
            ${pageContent}
        </bk-navigation>
    `
}
