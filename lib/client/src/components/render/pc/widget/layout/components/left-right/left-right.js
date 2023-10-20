import cssModule from './left-right.postcss?module'
import { h } from 'bk-lesscode-render'
import store from '@/store'
import { bus } from '@/common/bus'
import LC from '@/element-materials/core'
import Menu from '../../../../components/navigation/menu'
import MenuItem from '../../../../components/navigation/menu-item'
import { messageWarn } from '@/common/bkmagic'

import ResolveComponent from '../../../../resolve-component/resolve-component'
import helpMenu from '../head-help-menu'

const DEFAULT_BACKGROUND_COLOR = '#182132'
const DEFAULT_ACTIVE_BACKGROUND_COLOR = '#3c96ff'
const WHITE_BACKGROUND_COLOR = '#ffffff'
const WHITE_HOVER_COLOR = '#63656e'
const WHITE_HOVER_BG_COLOR = '#f5f7fa'
const WHITE_SUB_BG_COLOR = '#fafbfd'
const OTHER_HOVER_BG_COLOR = '#ffffff14'

const unselectComponent = () => {
    const activeNode = LC.getActiveNode()
    if (activeNode) {
        activeNode.activeClear()
    }
    if (LC.getActiveElement()) {
        LC.resetActiveElement()
    }
    document.body.querySelectorAll('.component-wrapper').forEach($el => {
        $el.classList.remove('selected')
    })
}

export default {
    name: 'lesscode-layout',
    data () {
        return {
            siteTitle: 'lesscode',
            isToggle: false,
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
        navActive () {
            return this.pageDetail.pageCode
        },
        // 左侧导航菜单主题色 选中项背景色
        activeTheme () {
            return this.getCurTemplateData().themeConfig?.sideMenuTheme || DEFAULT_ACTIVE_BACKGROUND_COLOR
        },
        // 左侧导航背景色
        backgroundColor () {
            return this.getCurTemplateData().themeConfig?.sideMenuBackground || DEFAULT_BACKGROUND_COLOR
        },
        // 默认背景主题
        isDefaultTheme () {
            return this.backgroundColor === DEFAULT_BACKGROUND_COLOR
        },
        // 白色背景主题
        isWhiteTheme () {
            return this.backgroundColor === WHITE_BACKGROUND_COLOR
        },
        // 其他主题
        isOtherTheme () {
            return !this.isDefaultTheme && !this.isWhiteTheme
        },
        themeColorProps () {
            const props = {}
            if (this.backgroundColor === WHITE_BACKGROUND_COLOR) { // 白色主题需要设置以下属性
                props['item-active-color'] = this.activeTheme
                props['item-active-icon-color'] = this.activeTheme
                props['item-child-icon-active-color'] = this.activeTheme
                props['item-default-bg-color'] = this.backgroundColor
                props['item-active-bg-color'] = `${this.activeTheme}1a` // 1a 代表十六进制色值的0.1透明度
                props['item-hover-bg-color'] = WHITE_HOVER_BG_COLOR
                props['item-hover-color'] = WHITE_HOVER_COLOR
                props['item-hover-icon-color'] = WHITE_HOVER_COLOR
                props['item-default-color'] = WHITE_HOVER_COLOR
                props['item-default-icon-color'] = WHITE_HOVER_COLOR
                props['item-child-icon-default-color'] = WHITE_HOVER_COLOR
                props['sub-menu-open-bg-color'] = WHITE_SUB_BG_COLOR
            } else if (this.backgroundColor !== DEFAULT_BACKGROUND_COLOR) { // 非默认背景色
                props['item-active-bg-color'] = this.activeTheme
                props['item-default-bg-color'] = this.backgroundColor
                props['sub-menu-open-bg-color'] = this.backgroundColor
                props['item-hover-bg-color'] = OTHER_HOVER_BG_COLOR
                props['item-default-color'] = WHITE_BACKGROUND_COLOR
                props['item-default-icon-color'] = WHITE_BACKGROUND_COLOR
                props['item-child-icon-default-color'] = WHITE_BACKGROUND_COLOR
                props['item-child-icon-active-color'] = WHITE_BACKGROUND_COLOR
            } else {
                props['item-default-bg-color'] = this.backgroundColor
                props['item-active-bg-color'] = this.activeTheme
            }

            return props
        }
    },
    created () {
        const customMenuCon = this.getCurTemplateData().customMenuCon || []
        LC.initNavCustomCon(customMenuCon)
        LC.addEventListener('active', this.activeCallback)
        LC.addEventListener('activeElementUpdate', this.activeCallback)
        bus.$on('on-template-change', this.handleTemplateChange)
        this.refreshKey = Date.now()
    },
    mounted () {
        this.handleOpenMenu()
        const element = document.querySelector('.navigation-nav')
        element && element.addEventListener('click', this.handleClickEvent)
        setTimeout(() => {
            LC.triggerEventListener('updateCanvas', false)
        })
    },
    beforeDestroy () {
        LC.removeEventListener('active', this.activeCallback)
        LC.removeEventListener('activeElementUpdate', this.activeCallback)
        bus.$off('on-template-change', this.handleTemplateChange)

        const element = document.querySelector('.navigation-nav')
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
            document.body.querySelectorAll('.component-wrapper').forEach($el => {
                $el.classList.remove('selected')
            })
            this.isSideMenuSelected = false
        },
        componentWrapperMouseenterHandler (event) {
            event.target.classList.add('component-wrapper-hover')
        },
        componentWrapperMouseleaveHandler (event) {
            event.target.classList.remove('component-wrapper-hover')
        },
        /**
         * @desc 展开菜单
         */
        handleOpenMenu () {
            if (!this.$refs.item) {
                return
            }
            this.refreshKey = Date.now()
            setTimeout(() => {
                this.$refs.item?.forEach?.(item => item.handleOpen())
            })
        },
        /**
         * @desc 选中站点Logo 块进行配置
         * @param { Object } event
         */
        handleSiteInfo (event) {
            event.stopPropagation()
            unselectComponent()
            this.isSideMenuSelected = false
            event.target.classList.add('selected')
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
                panelActive: 'info'
            })
        },
        /**
         * @desc 选中左侧导航进行配置
         */
        handleSideMenuSelect (event) {
            event.stopPropagation()
            unselectComponent()
            this.isSideMenuSelected = true
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
                panelActive: 'menu'
            })
        },
        /**
         * @desc 更新模板配置
         * @param { Object } payload
         */
        handleTemplateChange (payload) {
            const {
                logo,
                siteName,
                menuList,
                renderProps,
                theme,
                themeConfig,
                panelActive,
                helpMenuList
            } = payload
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
                logo,
                siteName,
                menuList,
                renderProps,
                theme,
                themeConfig,
                panelActive,
                helpMenuList
            })
            this.handleOpenMenu()
            this.$forceUpdate()
        },
        handleToggle (value) {
            this.isToggle = value
        },
        handleLogout () {
            messageWarn('请部署后使用本功能')
        },
        handleClickEvent () {
            const { panelActive } = this.getCurTemplateData()
            if (panelActive) {
                return
            }
            unselectComponent()
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
                panelActive: 'base'
            })
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderSideHeaderSlot = () => {
            return h({
                component: 'div',
                slot: 'side-header',
                class: 'component-wrapper',
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
                            'title-desc': true
                        },
                        children: [
                            self.getCurTemplateData().siteName
                        ]
                    })
                ]
            })
        }

        const renderUserName = () => {
            return h({
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
                            class: 'message-box',
                            on: {
                                click (event) {
                                    event.stopPropagation()
                                }
                            },
                            children: [
                                h({
                                    component: 'span',
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
                                '退出登录'
                            ]
                        })
                    }
                }
            })
        }

        const renderDragArea = () => {
            return h({
                component: ResolveComponent,
                ref: 'component',
                key: LC.getNavCustomCon()?.renderKey,
                class: {
                    'nav-custom-area': true
                },
                props: {
                    componentData: LC.getNavCustomCon()
                }
            })
        }

        const renderHelpMenu = () => {
            return h({
                component: helpMenu,
                props: {
                    isWhiteTopTheme: true
                }
            })
        }

        const renderHeaderSlot = () => {
            return h({
                component: 'div',
                slot: 'header',
                style: 'display: flex; align-items: center',
                class: {

                },
                children: [
                    renderDragArea(),
                    renderHelpMenu(),
                    renderUserName()
                ]
            })
        }

        const renderMenuSlot = () => {
            return h({
                component: 'div',
                slot: 'menu',
                class: {
                    'side-menu-wraper': true,
                    'selected': self.isSideMenuSelected
                },
                on: {
                    click: self.handleSideMenuSelect
                },
                children: [
                    h({
                        component: Menu,
                        ref: 'menu',
                        props: {
                            defaultActive: self.navActive,
                            openedKeys: self.getCurTemplateData().menuList.map(menu => menu.pageCode),
                            themeColorProps: self.themeColorProps
                        },
                        children: self.getCurTemplateData().menuList?.map?.((menuItem) => {
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
                    [cssModule['white-theme']]: self.isWhiteTheme,
                    [cssModule['other-theme']]: self.isOtherTheme
                },
                props: {
                    headerTitle: self.navActive,
                    sideTitle: self.siteTitle,
                    defaultOpen: true,
                    navigationType: 'left-right',
                    needMenu: true,
                    themeColor: self.backgroundColor,
                    ...self.getCurTemplateData().renderProps
                },
                on: {
                    toggle: self.handleToggle
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
