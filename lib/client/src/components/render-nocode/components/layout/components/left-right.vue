<template>
    <div ref="layout">
        <bk-navigation
            :header-title="navActive"
            :side-title="siteTitle"
            default-open
            navigation-type="left-right"
            need-menu
            v-bind="curTemplateData.renderProps || {}"
            @toggle="handleToggle"
            :theme-color="backgroundColor"
            :class="{
                'white-theme': isWhiteTheme,
                'other-theme': isOtherTheme
            }"
        >
            <template slot="side-header">
                <div
                    class="component-wrapper"
                    style="display: flex"
                    @mouseenter="componentWrapperMouseenterHandler"
                    @mouseleave="componentWrapperMouseleaveHandler"
                    @click.stop="handleSiteInfo">
                    <span class="title-icon">
                        <img style="width: 28px; height: 28px" :src="curTemplateData.logo" />
                    </span>
                    <span class="title-desc">{{ curTemplateData.siteName }}</span>
                </div>
            </template>
            <template slot="header">
                <bk-popover
                    theme="light lesscode-layout-message"
                    :arrow="false"
                    placement="bottom-start"
                    offset="-20, 10"
                    :tippy-options="{ 'hideOnClick': false }">
                    <div class="message-box" @click.stop>
                        <span>{{ user.username }}</span>
                        <i class="bk-icon icon-down-shape"></i>
                    </div>
                    <template slot="content">
                        <div class="message-item" @click="handleLogout">{{ $t('退出') }}</div>
                    </template>
                </bk-popover>
            </template>
            <template slot="menu">
                <div
                    class="side-menu-wraper"
                    :class="{
                        selected: isSideMenuSelected
                    }"
                    @click.stop="handleSideMenuSelect">
                    <bk-navigation-menu
                        ref="menu"
                        :unique-opened="false"
                        :default-active="navActive"
                        :toggle-active="true"
                        v-bind="themeColorProps">
                        <bk-navigation-menu-item
                            v-for="(menuItem) in curTemplateData.menuList"
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
    import { bus } from '@/common/bus'
    import LC from '@/element-materials/core'

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
            ...mapGetters(['user']),
            ...mapGetters('drag', [
                'curTemplateData'
            ]),
            ...mapGetters('page', ['pageDetail']),
            ...mapGetters('layout', ['pageLayout']),
            navActive () {
                return this.pageDetail.pageCode
            },
            // 左侧导航菜单主题色 选中项背景色
            activeTheme () {
                return this.curTemplateData.themeConfig?.sideMenuTheme || DEFAULT_ACTIVE_BACKGROUND_COLOR
            },
            // 左侧导航背景色
            backgroundColor () {
                return this.curTemplateData.themeConfig?.sideMenuBackground || DEFAULT_BACKGROUND_COLOR
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
            const activeCallback = () => {
                document.body.querySelectorAll('.component-wrapper').forEach($el => {
                    $el.classList.remove('selected')
                })
                this.isSideMenuSelected = false
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
            this.handleOpenMenu()
            const element = document.querySelector('.navigation-nav')
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
            /**
             * @desc 展开菜单
             */
            handleOpenMenu () {
                if (!this.$refs.item) {
                    return
                }
                this.refreshKey = Date.now()
                setTimeout(() => {
                    this.$refs.item.forEach(item => item.handleOpen())
                })
            },
            /**
             * @desc 选中站点Logo 块进行配置
             * @param { Object } event
             */
            handleSiteInfo (event) {
                unselectComponent()
                this.isSideMenuSelected = false
                event.target.classList.add('selected')
                this.setCurTemplateData({
                    ...this.curTemplateData,
                    panelActive: 'info'
                })
            },
            /**
             * @desc 选中左侧导航进行配置
             */
            handleSideMenuSelect () {
                unselectComponent()
                this.isSideMenuSelected = true
                this.setCurTemplateData({
                    ...this.curTemplateData,
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
                    themeConfig
                } = payload
                this.setCurTemplateData({
                    ...this.curTemplateData,
                    logo,
                    siteName,
                    menuList,
                    renderProps,
                    theme,
                    themeConfig
                })
                this.handleOpenMenu()
            },
            handleToggle (value) {
                this.isToggle = value
            },
            handleLogout () {
                this.messageWarn(this.$t('请部署后使用本功能'))
            },
            handleClickEvent () {
                const { panelActive } = this.curTemplateData
                if (panelActive) {
                    return
                }
                unselectComponent()
                this.setCurTemplateData({
                    ...this.curTemplateData,
                    panelActive: 'base'
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .navigation-editor-wrapper{
        position: relative;
    }
    .white-theme {
        .title-desc {
            color: #313238;
        }
    }
    .other-theme {
        .title-desc {
            color: #fff;
            opacity: 0.86;
        }
    }
</style>
