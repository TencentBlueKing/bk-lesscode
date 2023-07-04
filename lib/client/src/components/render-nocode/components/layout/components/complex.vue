<template>
    <div ref="layout">
        <bk-navigation
            navigation-type="top-bottom"
            default-open
            :need-menu="isShowSideMenu"
            v-bind="curTemplateData.renderProps || {}"
            :head-theme-color="topBackgroundColor"
            :theme-color="sideThemeColor"
            :class="{ 'white-theme': isWhiteTopTheme }">
            <div
                slot="side-header"
                class="component-wrapper"
                style="display: flex"
                @mouseenter="componentWrapperMouseenterHandler"
                @mouseleave="componentWrapperMouseleaveHandler"
                @click.stop="handleSiteInfo">
                <span class="title-icon">
                    <img style="width: 28px; height: 28px" :src="curTemplateData.logo" />
                </span>
                <span :class="{ 'title-desc': true, 'theme-desc': !isDefaultTopTheme }">{{ curTemplateData.siteName }}</span>
            </div>
            <template slot="header">
                <div
                    class="navigation-header complex-top-menu-wraper"
                    :class="{
                        selected: isTopMenuSelected
                    }"
                    @click.stop="handleTopMenuClick">
                    <div
                        v-for="(topMemu) in curTemplateData.topMenuList"
                        :key="topMemu.id"
                        class="navigation-header-item"
                        :class="{
                            selected: selectTopMenuId === topMemu.id,
                            'theme-item': !isDefaultTopTheme,
                            'item-active': topMemu.pageCode === navActive
                        }"
                        :style="getActiveItemStyle(topMemu.pageCode)"
                        @click.stop="handleTopMenuSelect(topMemu)">
                        {{topMemu.name}}
                    </div>
                </div>
                <bk-popover
                    theme="light lesscode-layout-message"
                    :arrow="false"
                    placement="bottom-start"
                    offset="-20, 10"
                    :tippy-options="{ 'hideOnClick': false }">
                    <div class="message-box" :class="{ 'theme-header': !isDefaultTopTheme }" @click.stop>
                        <span class="user-name">{{ user.username }}</span>
                        <i class="bk-icon icon-down-shape"></i>
                    </div>
                    <template slot="content">
                        <div class="message-item" @click.stop="handleLogout">{{ $t('退出') }}</div>
                    </template>
                </bk-popover>
            </template>
            <template v-if="isShowSideMenu" slot="menu">
                <div
                    class="side-menu-wraper"
                    :class="{
                        selected: isSideMenuSelected
                    }"
                    @click="handleSideMenuClick">
                    <bk-navigation-menu
                        ref="menu"
                        :unique-opened="false"
                        :default-active="navActive"
                        :toggle-active="true"
                        v-bind="themeColorProps">
                        <bk-navigation-menu-item
                            v-for="(menuItem) in currentSideMenuList"
                            ref="item"
                            :key="`${menuItem.id}_${refreshKey}`"
                            :has-child="menuItem.children && !!menuItem.children.length"
                            :icon="menuItem.icon"
                            :id="menuItem.pageCode">
                            <span>{{menuItem.name}}</span>
                            <div slot="child">
                                <bk-navigation-menu-item
                                    v-for="(childrenItem) in menuItem.children"
                                    :key="`${childrenItem.id}`"
                                    :id="childrenItem.pageCode"
                                    default-active>
                                    <span>{{ childrenItem.name }}</span>
                                </bk-navigation-menu-item>
                            </div>
                        </bk-navigation-menu-item>
                    </bk-navigation-menu>
                </div>
            </template>
            <slot />
        </bk-navigation>
    </div>
</template>
<script>
    import { mapGetters, mapMutations } from 'vuex'
    import _ from 'lodash'
    import LC from '@/element-materials/core'
    import { bus } from '@/common/bus'

    const TOP_DEFAULT_BACKGROUND_COLOR = '#182132'
    const TOP_DEFAULT_ACTIVE_COLOR = '#ffffff'
    const TOP_DEFAULT_COLOR = '#96a2b9'
    const TOP_WHITE_ACTIVE_COLOR = '#d3d9e4'
    const TOP_NORMAL_ACTIVE_COLOR = '#ffffffe6'
    const SIDE_DEFAULT_BACKGROUND_COLOR = '#2c354d'
    const SIDE_DEFAULT_ACTIVE_BACKGROUND_COLOR = '#3c96ff'
    const SIDE_HOVER_ACTIVE_BG_COLOR = '#f5f7fa'
    const SIDE_DEFAULT_NORMAL_COLOR = '#63656e'
    const SIDE_WHITE_SUB_BG_COLOR = '#fafbfd'
    const SIDE_NORMAL_HOVER_BG_COLOR = '#ffffff14'
    const SIDE_DEFAULT_COLOR = '#acb5c6'
    const SIDE_DEFAULT_SUB_BG_COLOR = '#272F45'
    const SIDE_DEFAULT_BG_COLOR = '#3a4561'
    const SIDE_NORMAL_DEFAULT_COLOR = '#ffffffad'

    const unselectComponent = () => {
        const activeNode = LC.getActiveNode()
        if (activeNode) {
            activeNode.activeClear()
        }
        document.body.querySelectorAll('.component-wrapper').forEach($el => {
            $el.classList.remove('selected')
        })
    }

    export default {
        name: 'lesscode-layout',
        data () {
            return {
                selectTopMenuId: '',
                activeTopMenuId: '',
                isTopMenuSelected: false,
                isSideMenuSelected: false
            }
        },
        computed: {
            ...mapGetters(['user']),
            ...mapGetters('drag', [
                'curTemplateData'
            ]),
            ...mapGetters('page', ['pageDetail']),
            ...mapGetters('layout', ['pageLayout']),
            navActive () {
                return this.pageDetail.pageCode
            },
            isShowSideMenu () {
                return this.currentSideMenuList.length > 0
            },
            currentSideMenuList () {
                const { topMenuList } = this.curTemplateData
                const topMenu = _.find(topMenuList, _ => _.id === this.activeTopMenuId)
                if (!topMenu || !topMenu.children || topMenu.children.length < 1) {
                    return []
                }
                return topMenu.children
            },
            // 顶部导航背景色
            topBackgroundColor () {
                return this.curTemplateData.themeConfig?.topMenuBackground || TOP_DEFAULT_BACKGROUND_COLOR
            },
            // 顶部导航主题色 选中字体色
            topActiveTheme () {
                return this.curTemplateData.themeConfig?.topMenuTheme || TOP_DEFAULT_ACTIVE_COLOR
            },
            // 左侧导航背景色
            sideBackgroundColor () {
                return this.curTemplateData.themeConfig?.sideMenuBackground || TOP_DEFAULT_BACKGROUND_COLOR
            },
            // 左侧导航菜单主题色 选中项背景色
            sideActiveTheme () {
                return this.curTemplateData.themeConfig?.sideMenuTheme || SIDE_DEFAULT_ACTIVE_BACKGROUND_COLOR
            },
            // 顶部默认背景主题
            isDefaultTopTheme () {
                return this.topBackgroundColor === TOP_DEFAULT_BACKGROUND_COLOR
            },
            // 顶部白色背景主题
            isWhiteTopTheme () {
                return this.topBackgroundColor === TOP_DEFAULT_ACTIVE_COLOR
            },
            // 顶部导航菜单字体hover颜色
            defaultHoverTheme () {
                const activeColor = this.isDefaultTopTheme ? TOP_WHITE_ACTIVE_COLOR : TOP_NORMAL_ACTIVE_COLOR
                return this.topActiveTheme === TOP_DEFAULT_ACTIVE_COLOR ? activeColor : `${this.topActiveTheme}ad`
            },
            // 侧边导航背景色
            sideThemeColor () {
                return this.sideBackgroundColor === TOP_DEFAULT_BACKGROUND_COLOR ? SIDE_DEFAULT_BACKGROUND_COLOR : this.sideBackgroundColor
            },
            themeColorProps () {
                const props = {}
                if (this.sideBackgroundColor === TOP_DEFAULT_ACTIVE_COLOR) { // 白色主题需要设置以下属性
                    props['item-active-color'] = this.sideActiveTheme
                    props['item-active-icon-color'] = this.sideActiveTheme
                    props['item-child-icon-active-color'] = this.sideActiveTheme
                    props['item-default-bg-color'] = this.sideBackgroundColor
                    props['item-active-bg-color'] = `${this.sideActiveTheme}1a` // 1a 代表十六进制色值的0.1透明度
                    props['item-hover-bg-color'] = SIDE_HOVER_ACTIVE_BG_COLOR
                    props['item-hover-color'] = SIDE_DEFAULT_NORMAL_COLOR
                    props['item-hover-icon-color'] = SIDE_DEFAULT_NORMAL_COLOR
                    props['item-default-color'] = SIDE_DEFAULT_NORMAL_COLOR
                    props['item-default-icon-color'] = SIDE_DEFAULT_NORMAL_COLOR
                    props['item-child-icon-default-color'] = SIDE_DEFAULT_NORMAL_COLOR
                    props['sub-menu-open-bg-color'] = SIDE_WHITE_SUB_BG_COLOR
                } else if (this.sideBackgroundColor !== TOP_DEFAULT_BACKGROUND_COLOR) { // 非默认背景色
                    props['item-active-bg-color'] = this.sideActiveTheme
                    props['item-default-bg-color'] = this.sideBackgroundColor
                    props['sub-menu-open-bg-color'] = this.sideBackgroundColor
                    props['item-hover-bg-color'] = SIDE_NORMAL_HOVER_BG_COLOR
                    props['item-default-color'] = TOP_DEFAULT_ACTIVE_COLOR
                    props['item-default-icon-color'] = TOP_DEFAULT_ACTIVE_COLOR
                    props['item-child-icon-default-color'] = TOP_DEFAULT_ACTIVE_COLOR
                    props['item-child-icon-active-color'] = TOP_DEFAULT_ACTIVE_COLOR
                } else {
                    props['item-active-bg-color'] = this.sideActiveTheme
                    props['item-default-bg-color'] = SIDE_DEFAULT_BACKGROUND_COLOR
                    props['item-hover-bg-color'] = SIDE_DEFAULT_BG_COLOR
                    props['item-hover-color'] = TOP_DEFAULT_ACTIVE_COLOR
                    props['item-active-color'] = TOP_DEFAULT_ACTIVE_COLOR
                    props['item-default-color'] = SIDE_DEFAULT_COLOR
                    props['item-default-icon-color'] = SIDE_DEFAULT_COLOR
                    props['item-child-icon-default-color'] = SIDE_DEFAULT_COLOR
                    props['item-child-icon-hover-color'] = SIDE_DEFAULT_COLOR
                    props['item-active-icon-color'] = TOP_DEFAULT_ACTIVE_COLOR
                    props['item-hover-icon-color'] = TOP_DEFAULT_ACTIVE_COLOR
                    props['item-child-icon-active-color'] = TOP_DEFAULT_ACTIVE_COLOR
                    props['sub-menu-open-bg-color'] = SIDE_DEFAULT_SUB_BG_COLOR
                }
                
                return props
            }
        },
        watch: {
            currentSideMenuList () {
                this.handleOpenMenu()
            }
        },
        created () {
            const activeCallback = () => {
                this.isTopMenuSelected = false
                this.isSideMenuSelected = false
                this.selectTopMenuId = ''
                this.activeTopMenuId = ''
                document.body.querySelectorAll('.component-wrapper').forEach($el => {
                    $el.classList.remove('selected')
                })
            }
            LC.addEventListener('active', activeCallback)
            bus.$on('on-template-change', this.handleTemplateChange)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('active', activeCallback)
                bus.$off('on-template-change', this.handleTemplateChange)
            })
            this.refreshKey = Date.now()
        },
        mounted () {
            const element = document.querySelector('.bk-navigation-header')
            element && element.addEventListener('click', this.handleClickEvent)
            this.$once('hook:beforeDestroy', () => {
                element.removeEventListener('click', this.handleClickEvent)
            })
        },
        methods: {
            ...mapMutations('drag', ['setCurTemplateData']),
            componentWrapperMouseenterHandler (event) {
                event.target.classList.add('component-wrapper-hover')
            },
            componentWrapperMouseleaveHandler (event) {
                event.target.classList.remove('component-wrapper-hover')
            },
            handleOpenMenu () {
                if (!this.$refs.item) {
                    return
                }
                this.refreshKey = Date.now()
                setTimeout(() => {
                    this.$refs.item.forEach(item => item.handleOpen())
                })
            },
            handleSiteInfo (event) {
                unselectComponent()
                event.target.classList.add('selected')
                this.setCurTemplateData({
                    ...this.curTemplateData,
                    panelActive: 'info'
                })
            },
            handleTopMenuClick () {
                if (this.isTopMenuSelected) {
                    return
                }
                unselectComponent()
                this.isTopMenuSelected = true
                this.selectTopMenuId = ''
                this.setCurTemplateData({
                    ...this.curTemplateData,
                    panelActive: 'complexTop'
                })
            },
            handleTopMenuSelect (topMenu) {
                if (this.selectTopMenuId === topMenu.id) {
                    return
                }
                unselectComponent()
                this.selectTopMenuId = topMenu.id
                this.activeTopMenuId = topMenu.id
                this.isTopMenuSelected = false
                this.isSideMenuSelected = false
                this.setCurTemplateData({
                    ...this.curTemplateData,
                    panelActive: 'complexSide',
                    menuActive: this.selectTopMenuId
                })
            },
            handleSideMenuClick () {
                if (this.isSideMenuSelected) {
                    return
                }
                unselectComponent()
                this.isTopMenuSelected = false
                this.isSideMenuSelected = true
                this.activeTopMenuId = this.selectTopMenuId
                this.selectTopMenuId = ''
            },
            handleTemplateChange (templateData) {
                const {
                    logo,
                    siteName,
                    theme,
                    themeConfig,
                    topMenuList,
                    renderProps
                } = templateData

                let panelActive = templateData.panelActive

                // 选中的顶部导航被删除，清空导航选中状态
                if (this.selectTopMenuId) {
                    if (!_.find(topMenuList, _ => _.id === this.selectTopMenuId)) {
                        this.selectTopMenuId = ''
                        this.activeTopMenuId = ''
                        panelActive = ''
                    }
                }

                this.setCurTemplateData({
                    ...this.curTemplateData,
                    logo,
                    siteName,
                    theme,
                    themeConfig,
                    topMenuList,
                    panelActive,
                    renderProps
                })

                this.handleOpenMenu()
            },
            handleLogout () {
                this.messageWarn(this.$t('请部署后使用本功能'))
            },
            handleClickEvent () {
                unselectComponent()
                this.setCurTemplateData({
                    ...this.curTemplateData,
                    panelActive: 'base'
                })
            },
            getActiveItemStyle (code) {
                const defaultColor = this.isDefaultTopTheme
                    ? TOP_DEFAULT_COLOR : this.isWhiteTopTheme
                        ? SIDE_DEFAULT_NORMAL_COLOR : SIDE_NORMAL_DEFAULT_COLOR
                return {
                    '--color': code === this.navActive ? this.topActiveTheme : defaultColor,
                    '--hover-color': code === this.navActive ? this.topActiveTheme : this.defaultHoverTheme,
                    opacity: 1
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .theme-style {
        color: #fff;
        opacity: 0.86;
        font-weight: normal;
    }
    .component-wrapper .theme-desc {
        @extend .theme-style;
    }
    .message-box.theme-header {
        &:hover {
            opacity: 1;
        }
        @extend .theme-style;
    }
    .complex-top-menu-wraper{
        border: 1px  solid transparent;
        &:hover{
            border: 1px dashed #3a84ff;
        }
        &.selected {
            border: 1px solid #3a84ff;
        }
        .theme-desc {
            color: #fff;
        }
        .navigation-header-item{
            white-space: nowrap;
            color: var(--color) !important;
            &:hover {
                color: var(--hover-color) !important;
            }
        }
    }
    .white-theme {
        .theme-desc {
            color: #313238;
        }
        .message-box.theme-header {
            color: #63656E;
        }
    }
</style>
