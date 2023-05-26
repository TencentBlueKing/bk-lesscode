<template>
    <div ref="layout">
        <bk-navigation
            navigation-type="top-bottom"
            :need-menu="false"
            @toggle="handleToggle"
            v-bind="curTemplateData.renderProps || {}"
            :head-theme-color="backgroundColor"
            :class="{ 'white-theme': isWhiteTheme }">
            <div
                slot="side-header"
                class="component-wrapper"
                style="display: flex"
                @mouseenter="componentWrapperMouseenterHandler"
                @mouseleave="componentWrapperMouseleaveHandler"
                @click.stop="handleNavigationWraperClick('info', $event)">
                <span class="title-icon">
                    <img style="width: 28px; height: 28px" :src="curTemplateData.logo" />
                </span>
                <span :class="{ 'title-desc': true, 'theme-desc': !isDefaultTheme }">{{ curTemplateData.siteName }}</span>
            </div>
            <template slot="header">
                <div
                    class="navigation-header top-menu-wraper"
                    :class="{
                        selected: isTopMenuSelected
                    }"
                    @click.stop="handleTopMenuClick">
                    <template v-for="topMemu in curTemplateData.topMenuList">
                        <component
                            :is="topMemu.children && topMemu.children.length > 0 ? 'bk-popover' : 'div'"
                            :key="topMemu.id"
                            theme="light navigation-dropdown"
                            :arrow="false"
                            offset="0, -5"
                            placement="bottom"
                            :tippy-options="{ 'hideOnClick': false, flipBehavior: ['bottom'] }">
                            <div
                                class="navigation-header-item"
                                :style="getActiveItemStyle(topMemu.pageCode)">
                                {{topMemu.name}}
                            </div>
                            <template slot="content">
                                <div class="navigation-dropdown-menu">
                                    <div
                                        class="menu-item"
                                        v-for="item in topMemu.children"
                                        :key="item.id">
                                        {{item.name}}
                                    </div>
                                </div>
                            </template>
                        </component>
                    </template>
                </div>
                <bk-popover
                    class="message-box"
                    theme="light lesscode-layout-message"
                    :arrow="false"
                    placement="bottom-start"
                    offset="-20, 10"
                    :tippy-options="{ 'hideOnClick': false }">
                    <div :class="{ 'header-user': true, 'theme-header': !isDefaultTheme }" @click.stop>
                        <span class="user-name">{{ user.username }}</span>
                        <i class="bk-icon icon-down-shape"></i>
                    </div>
                    <template slot="content">
                        <div class="message-item" @click="handleLogout">{{ $t('退出') }}</div>
                    </template>
                </bk-popover>
            </template>
            <slot />
        </bk-navigation>
    </div>
</template>
<script>
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
            const activeCallback = () => {
                this.isTopMenuSelected = false
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
            handleNavigationWraperClick (panel, event) {
                unselectComponent()
                event.target.classList.add('selected')
                this.setCurTemplateData({
                    ...this.curTemplateData,
                    panelActive: panel
                })
            },
            handleTopMenuClick () {
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
                const defaultColor = this.isDefaultTheme
                    ? DEFAULT_COLOR : this.isWhiteTheme
                        ? WHITE_DEFAULT_COLOR : NORMAL_DEFAULT_COLOR
                return {
                    '--color': code === this.navActive ? this.activeTheme : defaultColor,
                    '--hover-color': code === this.navActive ? this.activeTheme : this.defaultHoverTheme,
                    opacity: 1
                }
            }
        }
    }
</script>
<style lang="postcss">
    .navigation-dropdown-menu {
        display: flex;
        flex-direction: column;
        width: 150px;
        padding: 6px 0;
        color: #63656E;
        background: #FFFFFF;
        box-shadow: 0px 3px 4px 0px rgba(64,112,203,0.06);
        .menu-item{
            flex: 0 0 32px;
            display: flex;
            align-items: center;
            padding: 0 20px;
            &:hover{
                color: #3A84FF;
                cursor: pointer;
                background-color: #F0F1F5;
            }
        }
    }
    .tippy-popper .tippy-tooltip.navigation-dropdown-theme {
        padding:0;
        border-radius:0;
        box-shadow:none;
    }
</style>
<style lang="postcss" scoped>
    .theme-style {
        color: #fff;
        opacity: 0.86;
        font-weight: normal;
    }
    .component-wrapper .theme-desc {
        @extend .theme-style;
    }
    .header-user.theme-header {
        &:hover {
            opacity: 1;
        }
        @extend .theme-style;
    }
    .top-menu-wraper{
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
        .navigation-header-item {
            white-space: nowrap;
            color: var(--color) !important;
            &:hover {
                color: var(--hover-color) !important;
            }
        }
        .message-box{
            flex: 0 0 70px;
        }
    }
    .white-theme {
        .theme-desc {
            color: #313238;
        }
        .header-user.theme-header {
            color: #63656E;
        }
    }
</style>
