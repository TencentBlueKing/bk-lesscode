<template>
    <main :class="['project-layout', { 'no-breadcrumb': !hasBreadcrumb, 'aside-folded': asideFolded, 'aside-hover': asideHover }]">
        <aside class="aside" v-if="!hideSideNav" @mouseenter="asideHover = true" @mouseleave="asideHover = false">
            <div class="side-hd">
                <div class="open-select-menu-div" :class="{ 'show-select-project': !asideFolded || asideHover }">
                    <i class="back-icon bk-drag-icon bk-drag-arrow-back" :title="$t('返回应用列表')" @click="toProjects"></i>
                    <select-project :project-list="projectList" />
                </div>
                <div v-show="asideFolded && !asideHover" class="fold-logo">
                    {{(curProject.projectName || '').substr(0, 1)}}
                </div>
            </div>
            <div class="side-bd" :class="{ 'no-click': pageLoading }">
                <bk-navigation-menu
                    ref="menu"
                    class="nav-list"
                    :unique-opened="false"
                    :default-active="defaultActive"
                    :toggle-active="true"
                    :before-nav-change="beforeNavChange"
                    v-bind="defaultThemeColorProps">
                    <bk-navigation-menu-item
                        v-for="(menuItem) in navList"
                        :key="`${menuItem.url}`"
                        :has-child="menuItem.children && !!menuItem.children.length"
                        :id="menuItem.url"
                        @click="handleSelect">
                        <i :class="`bk-drag-icon bk-drag-${menuItem.icon}`"></i>
                        <template v-if="menuItem.iamAction">
                            <auth-component
                                :permission="menuItem.permission"
                                :auth="menuItem.iamAction"
                                :resource-id="$route.params.projectId"
                                @before-show-permission-dialog="beforeShowPermissionDialog">
                                <a href="javascript:;" slot="forbid" custom-forbid-container-cls="menu-forbid-container-cls">{{menuItem.title}}</a>
                                <span class="item-title" slot="allow">{{menuItem.title}}</span>
                            </auth-component>
                        </template>
                        <template v-else>
                            <span class="item-title">{{menuItem.title}}</span>
                        </template>
                        <div slot="child" class="menu-child">
                            <bk-navigation-menu-item
                                v-for="(childrenItem) in menuItem.children"
                                :key="childrenItem.url"
                                :id="childrenItem.url"
                                :url="childrenItem.url"
                                @click="handleSelect">
                                <template v-if="childrenItem.iamAction">
                                    <auth-component
                                        :permission="childrenItem.permission"
                                        :auth="childrenItem.iamAction"
                                        :resource-id="$route.params.projectId"
                                        @before-show-permission-dialog="beforeShowPermissionDialog">
                                        <a href="javascript:;" slot="forbid" custom-forbid-container-cls="menu-child-forbid-container-cls">{{childrenItem.title}}</a>
                                        <span slot="allow">{{childrenItem.title}}</span>
                                    </auth-component>
                                </template>
                                <template v-else>
                                    <span>{{ childrenItem.title }}</span>
                                </template>
                            </bk-navigation-menu-item>
                        </div>
                    </bk-navigation-menu-item>
                </bk-navigation-menu>
            </div>
            <div class="side-ft" v-if="showMenuFooter" @mouseenter.stop>
                <span class="nav-toggle" @click="toggleNav">
                    <i class="bk-icon icon-expand-line"></i>
                </span>
            </div>
        </aside>
        <section class="project-right-content">
            <div class="breadcrumbs" v-if="hasBreadcrumb">
                <div class="page-top">
                    <h3 class="current">{{ $t(currentPage) }}</h3>
                    <div class="version-selector" v-if="isShowProjectVersionSelector">
                        {{ $t('应用当前版本：') }}
                        <project-version-selector :bordered="false" :popover-width="200" v-model="projectVersionId" @change="handleChangeProjectVersion" />
                    </div>
                    <div class="instructions" v-if="helpDocument">
                        <a class="download-demo" :href="helpDocument" target="_blank">
                            <bk-icon class="bk-layout-component-kkgoknfg bkIcon1f258 bk-icon-help" type="question-circle"> </bk-icon>
                            {{ $t('使用指引') }}
                        </a>
                    </div>
                </div>
                <extra-links></extra-links>
            </div>
            <!-- 使用v-if因子组件依赖获取的应用信息 -->
            <div class="main-container" v-bkloading="{ isLoading: pageLoading }">
                <router-view v-if="!pageLoading" :key="routeKey"></router-view>
            </div>
        </section>
    </main>
</template>

<script>
    import { bus } from '@/common/bus'
    import { FOLD_MENU_ROUTE_LIST } from '@/common/constant-en'
    import SelectProject from '@/components/project/select-project'
    import ExtraLinks from '@/components/ui/extra-links'

    import { getProjectNavList } from './project-data'
    
    export default {
        components: {
            SelectProject,
            ExtraLinks
        },
        data () {
            return {
                pageLoading: false,
                projectId: '',
                projectVersionId: '',
                curProject: {},
                defaultActive: '',
                navList: [],
                projectList: [],
                defaultThemeColorProps: {
                    'item-default-color': '#96A2B9',
                    'item-default-bg-color': '#0E1525',
                    'item-active-color': '#FFF',
                    'item-active-bg-color': '#3A84FF',
                    'item-hover-bg-color': '#262C3B',
                    'item-hover-color': '#FFF',

                    'sub-menu-open-bg-color': '#0C1221',
                    
                    'item-default-icon-color': '#96A2B9',
                    'item-active-icon-color': '#FFF',
                    'item-hover-icon-color': '#FFF',

                    'item-child-icon-default-color': '#96A2B9',
                    'item-child-icon-hover-color': '#FFF',
                    'item-child-icon-active-color': '#FFF'
                },
                asideFolded: false,
                asideHover: false,
                showMenuFooter: true
            }
        },
        computed: {
            routeKey () {
                const { id } = this.$store.getters['projectVersion/currentVersion']
                return `${this.$route.path}_${id}`
            },
            currentPage () {
                return this.$route.meta.title
            },
            isShowProjectVersionSelector () {
                const withSelectorRoutes = ['pageList', 'functionManage', 'variableManage', 'layout', 'routes']
                return withSelectorRoutes.includes(this.$route.name)
            },
            hasBreadcrumb () {
                return this.currentPage?.length > 0
            },
            // 流程详情编辑页需要隐藏左侧导航
            hideSideNav () {
                return this.$route.meta.hideSideNav
            },
            helpDocument () {
                return this.$route.meta?.helpDocument
            }
        },
        beforeRouteUpdate (to, from, next) {
            this.projectId = parseInt(to.params.projectId)
            this.setCurrentProject()
            next()
        },
        watch: {
            '$route' (to, from) {
                this.setDefaultActive()
            }
        },
        async created () {
            try {
                this.pageLoading = true
                this.updateCurrentVersion(this.getInitialVersion())
                bus.$on('update-project-version', this.updateCurrentVersion)
                bus.$on('update-project-info', this.updateProjectInfo)
                bus.$on('is-fold-aside', ({ isFold = false, showMenuFooter = true }) => {
                    this.asideFolded = isFold
                    this.showMenuFooter = showMenuFooter
                })

                if (FOLD_MENU_ROUTE_LIST.indexOf(this.$route.name) > -1) {
                    this.asideFolded = true
                    this.showMenuFooter = false
                }

                this.projectId = parseInt(this.$route.params.projectId)
                await this.updateProjectInfo()

                this.setNavList()
            } catch (e) {
                console.error(e)
            } finally {
                this.pageLoading = false
            }
        },
        async mounted () {
            this.setDefaultActive()
        },
        methods: {
            beforeNavChange () {
                return false
            },
            beforeShowPermissionDialog (e) {
                e.preventDefault()
                e.stopPropagation()
            },
            toggleNav () {
                this.asideFolded = !this.asideFolded
                if (this.asideFolded) {
                    this.asideHover = false
                }
            },
            async updateProjectInfo () {
                await this.getProjectList()
                await this.setCurrentProject()
            },
            setNavList () {
                this.navList = getProjectNavList()
                // 在 setCurrentProject 请求之后再赋值，因为 setCurrentProject 请求会给 curProject 设置 canXXXX 等操作的属性
                const dealPermission = (item) => {
                    if (item.iamAction === this.$IAM_ACTION.develop_app[0]) {
                        item.permission = this.curProject.canDevelop
                    }
                    if (item.iamAction === this.$IAM_ACTION.deploy_app[0]) {
                        item.permission = this.curProject.canDeploy
                    }
                    if (item.iamAction === this.$IAM_ACTION.manage_perms_in_app[0]) {
                        item.permission = this.curProject.canManagePerms
                    }
                    if (item.iamAction === this.$IAM_ACTION.manage_app[0]) {
                        item.permission = this.curProject.canManage
                    }
                }
                let navList = []
                navList.splice(0, 0, ...this.navList)

                // 如果未开启权限， 不展示权限管理
                if (!IAM_ENABLE) {
                    navList = navList.filter(item => item.url !== 'authManage')
                }
                if (this.curProject?.framework === 'vue3') {
                    navList = navList.filter(item => item.url !== 'flowList')
                }

                navList.forEach(item => {
                    dealPermission(item)
                    if (item.children) {
                        item.children.forEach(child => {
                            dealPermission(child)
                        })
                    }
                })
                this.navList.splice(0, this.navList.length, ...navList)
            },
            setDefaultActive () {
                let name = this.$route.name
                
                // 数据源管理子页面，左侧数据源管理依然高亮选中
                if ([
                    'tableList',
                    'createTable',
                    'editTable',
                    'showTable',
                    'updateTableRecord',
                    'dataManage'
                ].includes(name)) {
                    name = 'tableList'
                }

                // 页面列表、画布，左侧选中页面管理
                if (['pageList', 'new', 'editNocode'].includes(name)) {
                    name = 'pageList'
                }

                // 流程管理子页面、左侧选中流程管理
                if (name?.startsWith('flow')) {
                    name = 'flowList'
                }

                this.defaultActive = name
            },
            toProjects () {
                this.$router.push({
                    name: 'projects'
                })
            },
            async setCurrentProject () {
                const project = this.projectList.find(item => item.id === parseInt(this.projectId))
                this.$store.commit('project/setCurrentProject', project)
                this.curProject = Object.assign({}, project)
                this.setNavList()
            },
            updateCurrentVersion (version) {
                this.projectVersionId = version.id
                this.setCurrentVersion(version)
            },
            async getProjectList () {
                const url = IAM_ENABLE ? 'iam/myProject' : 'project/my'
                const projectList = await this.$store.dispatch(url, { config: {} })
                this.projectList = projectList
                this.filterProjectList = projectList
            },
            handleChangeProjectVersion (versionId, version) {
                this.setCurrentVersion(version)
            },
            getInitialVersion () {
                return this.$store.getters['projectVersion/initialVersion']()
            },
            setCurrentVersion (version) {
                this.$store.commit('projectVersion/setCurrentVersion', version)
            },
            handleSelect (routeName) {
                this.$router.push({
                    name: routeName
                })
            },
            remoteHandler (keyword) {
                this.filterProjectList = this.projectList.filter((project) => {
                    return (project.projectName || '').includes(keyword)
                })
            }
        }
    }
</script>

<style lang="postcss">
    @import "@/css/mixins/ellipsis";
    @import "@/css/mixins/scroller";

    .select-project-dropdown {
        border: 1px solid #2F3847;
        background: #0E1525;
        font-size: 12px;
        color: #C4C6CC;
        .bk-select-search-input {
            padding: 0 10px 0 30px;
            background: #0E1525;
            border-bottom: 1px solid #2F3847;
            &::placeholder {
                color: #747E94;
            }
        }
        .bk-options-wrapper {
            ::-webkit-scrollbar-thumb {
                background-color:#3F4B5E;
            }
            .bk-option {
                &.is-selected {
                    color: #7FAEF5;
                    background: #253B5F !important;
                }
                .bk-option-content:hover {
                    color: #f0f1f5;
                    background: #2d3542;
                }
            }
        }
            .bk-select-extension {
                border-top: 1px solid #2F3847;
                background: #28354D;
                padding: 0;
                .page-row {
                    padding: 0 16px;
                    font-size: 12px;
                    &:hover {
                        background: #324260;
                    }
                }
        }
    }

    .select-project-dropdown .project-name {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        span {
            max-width: calc(100% - 50px);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        /deep/ .app-com-version {
            color: #979BA5;
        }
        
    }

    .project-layout {
        --side-hd-height: 52px;
        --side-ft-height: 50px;
        --aside-width: 240px;
        --footer-height: 50px;
        --breadcrumb-height: 52px;
        --aside-folded-width: 60px;
        min-width: 1280px;
        height: calc(100vh - 52px);
        margin-top: 52px;

        .project-right-content {
            padding-left: 0px;
            height: 100%;
            width: 100%
        }

        &.aside-folded:not(.aside-hover) {
            .aside {
                width: var(--aside-folded-width);
                .side-hd {
                    justify-content: center;
                }
                .side-bd {
                    overflow: hidden;
                }
                .side-ft {
                    .nav-toggle {
                        transform: rotate(0);
                    }
                }
            }

            .nav-list {
                .navigation-menu-item-name {
                    text-overflow: clip;
                }
                .navigation-sbmenu-content {
                    height: 0 !important;
                    overflow: hidden !important;
                }
                .navigation-sbmenu-title-arrow {
                    display: none;
                }
                .navigation-sbmenu-title-content {
                    text-overflow: clip;
                }
            }
        }

        &.aside-folded {
            .aside {
                position: absolute;
                z-index: 999;
                height: calc(100% - 52px);
            }
            .project-right-content {
                padding-left: 60px;
            }
        }
        .aside {
            position: relative;
            width: var(--aside-width);
            height: 100%;
            background: #0E1525;
            float: left;
            z-index: 1;
            transition: width .2s cubic-bezier(0.4, 0, 0.2, 1);

            .side-hd-bd {
                height: 100%;
                position: relative;
            }

            .side-hd {
                height: var(--side-hd-height);
                line-height: var(--side-hd-height);
                display: flex;
                align-items: center;
                .back-icon {
                    color: #3a84ff;
                    padding: 10px;
                    cursor: pointer;
                }
                .open-select-menu-div {
                    transition: width 0.2s ease-out, opacity 0.2s ease-in;
                    visibility: hidden;
                    opacity: 0;
                    width: 0px;
                }
                .show-select-project {
                    display: flex;
                    align-items: center;
                    visibility: visible;
                    opacity: 1;
                    width: 200px;
                }
                .fold-logo {
                    width: 32px;
                    height: 32px;
                    background: rgb(45, 53, 66);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 2px;
                    color: #DCDEE5;
                }
                .select-project {
                    width: 188px;
                    background: #2B313F;
                    border: none;
                    margin-left: 2px;
                    .bk-select-name {
                        font-size: 14px;
                        color: #DCDEE5;
                    }
                    &.is-focus {
                        box-shadow: none;
                    }
                }
            }
            .side-bd {
                height: calc(100% - var(--side-hd-height) - var(--side-ft-height, 0px));
                overflow-y: auto;
                @mixin scroller;
            }
            .side-ft {
                position: absolute;
                bottom: 0;
                height: var(--side-ft-height);
                line-height: var(--side-ft-height);
                width: 100%;
                background: #0E1525;
                padding-left: 12px;

                .nav-toggle {
                    width: 32px;
                    height: 32px;
                    line-height: 32px;
                    cursor: pointer;
                    display: inline-block;
                    text-align: center;
                    transform: rotate(180deg);
                    transition: transform .2s cubic-bezier(0.4, 0, 0.2, 1);

                    i {
                        border-radius: 50%;
                        cursor: pointer;
                        padding: 8px;
                        &:hover {
                            background: linear-gradient(270deg,#253047,#263247);
                            color: #d3d9e4;
                        }
                    }
                }
            }
            .no-click {
                pointer-events: none;
            }
        }

        .breadcrumbs {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: var(--breadcrumb-height);
            background: #fff;
            box-shadow: 0px 2px 2px 0px rgba(0,0,0,0.1);
            padding-left: 24px;

            .page-top {
                display: flex;
                align-items: center;

                .version-selector {
                    margin-left: 25px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    font-size: 12px;

                    &::before {
                        content: '|';
                        position: absolute;
                        left: -13px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #C4C6CC;
                    }

                    .project-version-selector {
                        max-width: 320px;
                    }
                }

                    .download-demo {
                        font-size: 12px;
                        line-height: 18px;
                        color: #3A84FF;
                        position: absolute;
                        right: 24px;
                        top: 18px;
                        .bk-icon-help {
                            font-size: 14px !important;
                        }
                    }
                
            }

            .current {
                color: #000;
                font-size: 16px;
                font-weight: normal;
            }
        }

        .main-container {
            height: calc(100% - var(--breadcrumb-height));
            overflow: auto;
            @mixin scroller;

            .exception-page {
                height: 100%;
                display: flex;
                align-items: center;
            }
        }

        .nav-list {
            background: #0E1525 !important;
            .menu-forbid-container-cls {
                display: inline-block;
                height: 40px;
                line-height: 40px;
                width: 160px;
                padding-left: 30px;
                margin-left: -30px;
            }

            .menu-child-forbid-container-cls {
                height: 40px;
                line-height: 40px;
                width: 207px;
                padding-left: 30px;
                margin-left: -30px;
            }
            .bk-drag-icon {
                font-size: 16px;
                margin-right: 16px;
            }
            .menu-child{
                .navigation-menu-item{
                    &:hover {
                        background: #262C3B;
                    }
                }
            }
        }

        &.no-breadcrumb {
            .main-container {
                height: 100%;
                overflow: hidden;
            }
        }
    }
</style>
