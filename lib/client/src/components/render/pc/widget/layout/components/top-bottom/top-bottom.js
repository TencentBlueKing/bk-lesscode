import cssModule from './top-bottom.postcss?module'
import {
    h
} from 'bk-lesscode-render'
import store from '@/store'
import LC from '@/element-materials/core'
import { bus } from '@/common/bus'
import { messageWarn } from '@/common/bkmagic'

import ResolveComponent from '../../../../resolve-component/resolve-component'

const DEFAULT_COLOR = '#96a2b9'
const DEFAULT_BACKGROUND_COLOR = '#182132'
const DEFAULT_ACTIVE_COLOR = '#ffffff'
const WHITE_ACTIVE_COLOR = '#d3d9e4'
const WHITE_DEFAULT_COLOR = '#63656E'
const NORMAL_DEFAULT_COLOR = '#ffffffad'
const NORMAL_ACTIVE_COLOR = '#ffffffe6'

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
            isTopMenuSelected: false
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
        // 顶部导航背景色
        backgroundColor () {
            return this.getCurTemplateData().themeConfig?.topMenuBackground || DEFAULT_BACKGROUND_COLOR
        },
        // 顶部导航主题色 选中字体色
        activeTheme () {
            return this.getCurTemplateData().themeConfig?.topMenuTheme || DEFAULT_ACTIVE_COLOR
        },
        // 菜单字体hover颜色
        defaultHoverTheme () {
            const activeColor = this.isDefaultTheme ? WHITE_ACTIVE_COLOR : NORMAL_ACTIVE_COLOR
            return this.activeTheme === DEFAULT_ACTIVE_COLOR ? activeColor : `${this.activeTheme}ad`
        },
        // 默认背景主题
        isDefaultTheme () {
            return this.backgroundColor === DEFAULT_BACKGROUND_COLOR
        },
        // 白色背景主题
        isWhiteTheme () {
            return this.backgroundColor === DEFAULT_ACTIVE_COLOR
        }
    },
    created () {
        const customMenuCon = this.getCurTemplateData().customMenuCon || []
        LC.initNavCustomCon(customMenuCon)
        LC.addEventListener('active', this.activeCallback)
        bus.$on('on-template-change', this.handleTemplateChange)
    },
    mounted () {
        const element = document.querySelector('.bk-navigation-header')
        element && element.addEventListener('click', this.handleClickEvent)
        setTimeout(() => {
            LC.triggerEventListener('updateCanvas', false)
        })
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
        handleNavigationWraperClick (panel, event) {
            event.stopPropagation()
            unselectComponent()
            event.target.classList.add('selected')
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
                panelActive: panel
            })
        },
        handleTopMenuClick (event) {
            event.stopPropagation()
            unselectComponent()
            this.isTopMenuSelected = true
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
                panelActive: 'topMenu'
            })
        },
        handleTemplateChange (payload) {
            const {
                logo,
                siteName,
                theme,
                themeConfig,
                topMenuList,
                renderProps,
                panelActive
            } = payload
            this.setCurTemplateData({
                ...this.getCurTemplateData(),
                logo,
                siteName,
                theme,
                themeConfig,
                topMenuList,
                renderProps,
                panelActive
            })
            this.$forceUpdate()
        },
        handleToggle (value) {
            this.isToggle = value
        },
        handleLogout () {
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
            const defaultColor = this.isDefaultTheme
                ? DEFAULT_COLOR : this.isWhiteTheme
                    ? WHITE_DEFAULT_COLOR : NORMAL_DEFAULT_COLOR
            return {
                '--color': code === this.navActive ? this.activeTheme : defaultColor,
                '--hover-color': code === this.navActive ? this.activeTheme : this.defaultHoverTheme,
                opacity: 1
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderSideHeaderSlot = () => {
            return h({
                component: 'div',
                slot: 'side-header',
                class: cssModule['component-wrapper'],
                style: 'display: flex',
                on: {
                    mouseenter: self.componentWrapperMouseenterHandler,
                    mouseleave: self.componentWrapperMouseleaveHandler,
                    click: (event) => self.handleNavigationWraperClick('info', event)
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
                            [cssModule['theme-desc']]: !self.isDefaultTheme
                        },
                        children: [
                            self.getCurTemplateData().siteName
                        ]
                    })
                ]
            })
        }

        const renderHeaderSlot = () => {
            const getTopMenu = (topMemu) => {
                const hasChild = topMemu.children?.length > 0
    
                const defaultSlot = h({
                    component: 'div',
                    slot: 'default',
                    class: 'navigation-header-item',
                    style: self.getActiveItemStyle(topMemu.pageCode),
                    children: [
                        topMemu.name
                    ]
                })

                const contentSlot = h({
                    component: 'div',
                    slot: 'content',
                    class: 'navigation-dropdown-menu',
                    children: topMemu?.children?.map((item) => h({
                        component: 'div',
                        class: 'menu-item',
                        key: item.id,
                        children: [
                            item.name
                        ]
                    }))
                })

                const getChildrenOrSlots = () => {
                    if (hasChild) {
                        return {
                            slots: {
                                default: () => defaultSlot,
                                content: () => contentSlot
                            }
                        }
                    }
                    return {
                        children: [
                            defaultSlot
                        ]
                    }
                }

                return h({
                    component: topMemu.children?.length > 0 ? 'bk-popover' : 'div',
                    key: topMemu.id,
                    props: {
                        theme: 'light navigation-dropdown empty-padding',
                        arrow: false,
                        offset: '0, -5',
                        placement: 'bottom',
                        tippyOptions: {
                            hideOnClick: false,
                            flipBehavior: ['bottom']
                        }
                    },
                    ...getChildrenOrSlots()
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

            return h({
                component: 'div',
                class: cssModule['header-slot-wrapper'],
                slot: 'header',
                children: [
                    h({
                        component: 'div',
                        class: {
                            'navigation-header': true,
                            [cssModule['top-menu-wraper']]: true,
                            [cssModule['selected']]: self.isTopMenuSelected
                        },
                        on: {
                            click: self.handleTopMenuClick
                        },
                        children: self.getCurTemplateData().topMenuList.map(topMemu => getTopMenu(topMemu))
                    }),
                    renderDragArea(),
                    h({
                        component: 'bk-popover',
                        class: cssModule['message-box'],
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
                                        [cssModule['header-user']]: true,
                                        [cssModule['theme-header']]: !self.isDefaultTheme
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
                                    class: 'message-item',
                                    slot: 'content',
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
                ]
            })
        }

        const renderDefaultSlot = self.$slots.default

        const renderNavigation = () => {
            return h({
                component: 'bk-navigation',
                class: {
                    'white-theme': self.isWhiteTheme
                },
                props: {
                    navigationType: 'top-bottom',
                    needMenu: false,
                    'head-theme-color': self.backgroundColor,
                    ...self.getCurTemplateData().renderProps
                },
                on: {
                    toggle: self.handleToggle
                },
                slots: {
                    'side-header': renderSideHeaderSlot,
                    'header': renderHeaderSlot,
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
