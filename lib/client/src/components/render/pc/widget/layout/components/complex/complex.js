import cssModule from './complex.postcss?module'
import store from '@/store'
import _ from 'lodash'
import LC from '@/element-materials/core'
import { bus } from '@/common/bus'
import { h } from 'bk-lesscode-render'
import Menu from '../../../../components/navigation/menu'
import MenuItem from '../../../../components/navigation/menu-item'
import { messageWarn } from '@/common/bkmagic'

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
        pageDetail () {
            return store.getters['page/pageDetail']
        },
        pageLayout () {
            return store.getters['layout/pageLayout']
        },
        curTemplateData () {
            
        },
        navActive () {
            return this.pageDetail.pageCode
        },
        // 顶部导航背景色
        topBackgroundColor () {
            return this.getCurTemplateData().themeConfig?.topMenuBackground || TOP_DEFAULT_BACKGROUND_COLOR
        },
        // 顶部导航主题色 选中字体色
        topActiveTheme () {
            return this.getCurTemplateData().themeConfig?.topMenuTheme || TOP_DEFAULT_ACTIVE_COLOR
        },
        // 左侧导航背景色
        sideBackgroundColor () {
            return this.getCurTemplateData().themeConfig?.sideMenuBackground || TOP_DEFAULT_BACKGROUND_COLOR
        },
        // 左侧导航菜单主题色 选中项背景色
        sideActiveTheme () {
            return this.getCurTemplateData().themeConfig?.sideMenuTheme || SIDE_DEFAULT_ACTIVE_BACKGROUND_COLOR
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
        LC.addEventListener('active', this.activeCallback)
        bus.$on('on-template-change', this.handleTemplateChange)
        this.refreshKey = Date.now()
    },
    mounted () {
        const element = document.querySelector('.bk-navigation-header')
        element && element.addEventListener('click', this.handleClickEvent)
    },
    beforeDestroy () {
        LC.removeEventListener('active', this.activeCallback)
        bus.$off('on-template-change', this.handleTemplateChange)

        const element = document.querySelector('.bk-navigation-header')
        element && element.removeEventListener('click', this.handleClickEvent)
    },
    methods: {
        getCurTemplateData () {
            return store.getters['drag/curTemplateData']
        },
        setCurTemplateData (arg) {
            store.commit('drag/setCurTemplateData', arg)
        },
        activeCallback () {
            this.isTopMenuSelected = false
            this.isSideMenuSelected = false
            this.selectTopMenuId = ''
            this.activeTopMenuId = ''
            document.body.querySelectorAll('.component-wrapper').forEach($el => {
                $el.classList.remove('selected')
            })
        },
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
                this.$refs.item.forEach?.(item => item.handleOpen())
            })
        },
        handleSiteInfo (event) {
            event.stopPropagation()
            unselectComponent()
            event.target.classList.add('selected')
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
                panelActive: 'info'
            })
        },
        handleTopMenuClick (event) {
            event.stopPropagation()
            if (this.isTopMenuSelected) {
                return
            }
            unselectComponent()
            this.isTopMenuSelected = true
            this.selectTopMenuId = ''
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
                panelActive: 'complexTop'
            })
        },
        handleTopMenuSelect (topMenu) {
            window.event.stopPropagation()
            if (this.selectTopMenuId === topMenu.id) {
                return
            }
            unselectComponent()
            this.selectTopMenuId = topMenu.id
            this.activeTopMenuId = topMenu.id
            this.isTopMenuSelected = false
            this.isSideMenuSelected = false
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
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
                ...this.getCurTemplateData(),
                logo,
                siteName,
                theme,
                themeConfig,
                topMenuList,
                panelActive,
                renderProps
            })

            this.handleOpenMenu()
            this.$forceUpdate()
        },
        handleLogout (event) {
            event.stopPropagation()
            messageWarn('请部署后使用本功能')
        },
        handleClickEvent () {
            unselectComponent()
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
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
    },
    render (render) {
        h.init(render)

        const self = this

        const { topMenuList } = this.getCurTemplateData()
        const topMenuData = _.find(topMenuList, _ => _.id === this.activeTopMenuId)
        const currentSideMenuList = topMenuData?.children || []
        const isShowSideMenu = currentSideMenuList.length > 0

        const renderSideHeaderSlot = () => {
            return h({
                component: 'div',
                slot: 'side-header',
                class: cssModule['component-wrapper'],
                style: 'display: flex',
                on: {
                    mouseenter: self.componentWrapperMouseenterHandler,
                    mouseleave: self.componentWrapperMouseleaveHandler,
                    click: self.handleSiteInfo
                },
                children: [
                    h({
                        component: 'span',
                        class: 'title-icon',
                        children: [
                            h({
                                component: 'img',
                                style: 'width: 28px; height: 28px',
                                attrs: {
                                    src: self.getCurTemplateData().logo
                                }
                            })
                        ]
                    }),
                    h({
                        component: 'span',
                        class: {
                            'title-desc': true,
                            [cssModule['theme-desc']]: !self.isDefaultTopTheme
                        },
                        children: [
                            self.getCurTemplateData().siteName
                        ]
                    })
                ]
            })
        }

        const renderHeaderSlot = () => {
            return h({
                component: 'div',
                class: cssModule['header-slot-wrapper'],
                slot: 'header',
                children: [
                    h({
                        component: 'div',
                        class: {
                            'navigation-header': true,
                            'selected': self.isTopMenuSelected,
                            [cssModule['complex-top-menu-wraper']]: true
                        },
                        on: {
                            click: self.handleTopMenuClick
                        },
                        children: self.getCurTemplateData().topMenuList?.map?.((topMemu) => {
                            return h({
                                component: 'div',
                                class: {
                                    'navigation-header-item': true,
                                    'selected': self.selectTopMenuId === topMemu.id,
                                    'item-active': self.navActive === topMemu.pageCode,
                                    'theme-item': !self.isDefaultTopTheme
                                },
                                style: self.getActiveItemStyle(topMemu.pageCode),
                                on: {
                                    click: () => self.handleTopMenuSelect(topMemu)
                                },
                                children: [
                                    topMemu.name
                                ]
                            })
                        })
                    }),
                    h({
                        component: 'bk-popover',
                        props: {
                            theme: 'light lesscode-layout-message lesscode-layout-message-theme empty-padding',
                            arrow: false,
                            placement: 'bottom-start',
                            offset: '-20, 10',
                            tippyOptions: {
                                hideOnClick: false
                            }
                        },
                        slots: {
                            default () {
                                return h({
                                    component: 'div',
                                    class: {
                                        [cssModule['message-box']]: true,
                                        [cssModule['theme-header']]: !self.isDefaultTopTheme
                                    },
                                    on: {
                                        click (event) {
                                            event.stopPropagation()
                                        }
                                    },
                                    children: [
                                        h({
                                            component: 'span',
                                            class: 'user-name',
                                            children: [
                                                store.getters['user'].username
                                            ]
                                        }),
                                        h({
                                            component: 'i',
                                            class: 'bk-icon icon-down-shape'
                                        })
                                    ]
                                })
                            },
                            content () {
                                return h({
                                    component: 'div',
                                    slot: 'content',
                                    class: 'message-item',
                                    on: {
                                        click: self.handleLogout
                                    },
                                    children: [
                                        '退出'
                                    ]
                                })
                            }
                        }
                    })
                ]
            })
        }

        const renderMenuSlot = () => {
            if (!isShowSideMenu) return ''

            return h({
                component: 'div',
                slot: 'menu',
                class: {
                    'side-menu-wraper': true,
                    'selected': self.isSideMenuSelected
                },
                on: {
                    click: self.handleSideMenuClick
                },
                children: [
                    h({
                        component: Menu,
                        ref: 'menu',
                        props: {
                            defaultActive: self.navActive,
                            openedKeys: currentSideMenuList.map(menu => menu.pageCode),
                            themeColorProps: self.themeColorProps
                        },
                        children: currentSideMenuList.map((menuItem) => {
                            return h({
                                component: MenuItem,
                                ref: 'item',
                                refInFor: true,
                                key: `${menuItem.id}_${self.refreshKey}`,
                                props: {
                                    icon: `bk-icon ${menuItem.icon}`,
                                    id: menuItem.pageCode,
                                    title: menuItem.name,
                                    children: menuItem.children
                                }
                            })
                        })
                    })
                ]
            })
        }

        const renderDefaultSlot = self.$slots.default

        const renderNavigation = () => {
            return h({
                component: 'bk-navigation',
                class: {
                    [cssModule['white-theme']]: self.isWhiteTopTheme
                },
                props: {
                    navigationType: 'top-bottom',
                    defaultOpen: true,
                    needMenu: isShowSideMenu,
                    'head-theme-color': self.topBackgroundColor,
                    'theme-color': self.sideThemeColor,
                    ...self.getCurTemplateData().renderProps
                },
                slots: {
                    'side-header': renderSideHeaderSlot,
                    'header': renderHeaderSlot,
                    'menu': renderMenuSlot,
                    'default': renderDefaultSlot
                }
            })
        }

        return h({
            component: 'div',
            ref: 'layout',
            children: [
                renderNavigation()
            ]
        })
    }
}
