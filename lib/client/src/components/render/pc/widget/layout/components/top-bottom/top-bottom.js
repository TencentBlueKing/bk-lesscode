import cssModule from './top-bottom.postcss?module'
import {
    h
} from 'bk-lesscode-render'
import { mapGetters, mapMutations } from 'vuex'
import LC from '@/element-materials/core'
import { bus } from '@/common/bus'

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
        ...mapGetters(['user']),
        ...mapGetters('drag', [
            'curTemplateData'
        ]),
        ...mapGetters('page', ['pageDetail']),
        ...mapGetters('layout', ['pageLayout']),
        navActive () {
            return this.pageDetail.pageCode
        },
        // 顶部导航背景色
        backgroundColor () {
            return this.curTemplateData.themeConfig?.topMenuBackground || DEFAULT_BACKGROUND_COLOR
        },
        // 顶部导航主题色 选中字体色
        activeTheme () {
            return this.curTemplateData.themeConfig?.topMenuTheme || DEFAULT_ACTIVE_COLOR
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
        LC.addEventListener('active', this.activeCallback)
        bus.$on('on-template-change', this.handleTemplateChange)
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
        ...mapMutations('drag', ['setCurTemplateData']),
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
                ...this.curTemplateData,
                panelActive: panel
            })
        },
        handleTopMenuClick (event) {
            event.stopPropagation()
            unselectComponent()
            this.isTopMenuSelected = true
            this.setCurTemplateData({
                ...this.curTemplateData,
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
                renderProps
            } = payload
            this.setCurTemplateData({
                ...this.curTemplateData,
                logo,
                siteName,
                theme,
                themeConfig,
                topMenuList,
                renderProps
            })
        },
        handleToggle (value) {
            this.isToggle = value
        },
        handleLogout () {
            this.messageWarn('请部署后使用本功能')
        },
        handleClickEvent () {
            unselectComponent()
            this.setCurTemplateData({
                ...this.curTemplateData,
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
                                    src: self.curTemplateData.logo
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
                            self.curTemplateData.siteName
                        ]
                    })
                ]
            })
        }

        const renderHeaderSlot = () => {
            return h({
                component: 'template',
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
                        children: self.curTemplateData.topMenuList.map(topMemu => h({
                            component: topMemu.children?.length > 0 ? 'bk-popover' : 'div',
                            key: topMemu.id,
                            props: {
                                theme: 'light navigation-dropdown',
                                arrow: false,
                                offset: '0, -5',
                                placement: 'bottom',
                                tippyOptions: {
                                    hideOnClick: false,
                                    flipBehavior: ['bottom']
                                }
                            },
                            slots: {
                                default () {
                                    return h({
                                        component: 'div',
                                        class: 'navigation-header-item',
                                        style: self.getActiveItemStyle(topMemu.pageCode),
                                        children: [
                                            topMemu.name
                                        ]
                                    })
                                },
                                content () {
                                    return h({
                                        component: 'template',
                                        slot: 'content',
                                        children: [
                                            h({
                                                component: 'div',
                                                class: 'navigation-dropdown-menu',
                                                children: topMemu.children.map((item) => h({
                                                    component: 'div',
                                                    class: 'menu-item',
                                                    key: item.id,
                                                    children: [
                                                        item.name
                                                    ]
                                                }))
                                            })
                                        ]
                                    })
                                }
                            }
                        }))
                    }),
                    h({
                        component: 'bk-popover',
                        class: cssModule['message-box'],
                        props: {
                            theme: 'light lesscode-layout-message',
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
                                                self.user.username
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
                                    component: 'template',
                                    slot: 'content',
                                    children: [
                                        h({
                                            component: 'div',
                                            class: 'message-item',
                                            on: {
                                                click: self.handleLogout
                                            },
                                            children: [
                                                '退出'
                                            ]
                                        })
                                    ]
                                })
                            }
                        }
                    })
                ]
            })
        }

        const renderDefaultSlot = () => {
            return self.$slots.default
        }

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
                    ...self.curTemplateData.renderProps
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
