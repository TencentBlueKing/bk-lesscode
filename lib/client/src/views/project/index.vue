<template>
    <main :class="['project-layout', { 'no-breadcrumb': !hasBreadcrumb, 'aside-folded': asideFolded, 'aside-hover': asideHover }]">
        <!--  -->
        <aside class="aside" v-if="!hideSideNav">
            <div class="side-hd">
                <i class="back-icon bk-drag-icon bk-drag-arrow-back" :title="$t('返回应用列表')" @click="toProjects"></i>
                <bk-select ext-cls="select-project" ext-popover-cls="select-project-dropdown" v-model="projectId" :clearable="false" :searchable="true" @selected="changeProject" :allow-enter="filterProjectList.length > 0" :remote-method="remoteHandler">
                    <bk-option v-for="option in filterProjectList"
                        :key="option.id"
                        :id="option.id"
                        :name="option.projectName">
                    </bk-option>
                </bk-select>
            </div>
            <div class="side-bd" :class="{ 'no-click': pageLoading }"
                @mouseenter="asideHover = true"
                @mouseleave="asideHover = false">
                <!-- <nav class="nav-list">
                    <router-link tag="div" class="nav-item" v-for="item in navList" :key="item.title" :to="item.toPath">
                        <i :class="`bk-drag-icon bk-drag-${item.icon}`"></i>{{ item.title }} <i v-if="item.redPoint" class="red-point"></i>
                    </router-link>
                </nav> -->
                <bk-navigation-menu
                    ref="menu"
                    class="nav-list"
                    :unique-opened="defaultOpen"
                    :default-active="defaultActive"
                    :toggle-active="true"
                    v-bind="defaultThemeColorProps">
                    <bk-navigation-menu-item
                        v-for="(menuItem) in navList"
                        :key="`${menuItem.url}`"
                        :has-child="menuItem.children && !!menuItem.children.length"
                        :id="menuItem.url"
                        @click="handleSelect">
                        <i :class="`bk-drag-icon bk-drag-${menuItem.icon}`"></i>
                        <!-- <span class="item-title">{{menuItem.title}}</span> -->
                        <template v-if="menuItem.iamAction">
                            <!-- <auth-component
                                :permission="menuItem.iamAction === 'develop_app' ? curProject.canDevelop : curProject.canDeploy"
                                :auth="menuItem.iamAction"
                                :resource-id="$route.params.projectId"
                                @before-show-permission-dialog="beforeShowPermissionDialog">
                                <a href="javascript:;" slot="forbid" custom-forbid-container-cls="menu-forbid-container-cls">{{menuItem.title}}</a>
                                <span class="item-title" slot="allow">{{menuItem.title}}</span>
                            </auth-component> -->
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
                                <!-- <span>{{ childrenItem.title }}</span> -->
                                <template v-if="childrenItem.iamAction">
                                    <!-- <auth-component
                                        :permission="childrenItem.iamAction === 'develop_app' ? curProject.canDevelop : curProject.canDeploy"
                                        :auth="childrenItem.iamAction"
                                        :resource-id="$route.params.projectId"
                                        @before-show-permission-dialog="beforeShowPermissionDialog">
                                        <a href="javascript:;" slot="forbid" custom-forbid-container-cls="menu-child-forbid-container-cls">{{childrenItem.title}}</a>
                                        <span slot="allow">{{childrenItem.title}}</span>
                                    </auth-component> -->
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
            <div class="side-ft">
                <span class="nav-toggle" @click="asideFolded = !asideFolded">
                    <i class="bk-drag-icon bk-drag-nav-toggle"></i>
                </span>
            </div>
        </aside>
        <div class="breadcrumbs" v-if="hasBreadcrumb">
            <div class="page-top">
                <h3 class="current">{{ $t(currentPage) }}</h3>
                <div class="version-selector" v-if="isShowProjectVersionSelector">
                    {{ $t('应用当前版本：') }} <project-version-selector :bordered="false" :popover-width="200" v-model="projectVersionId" @change="handleChangeProjectVersion" />
                </div>
                <div class="instructions" v-if="helpDocument">
                    <a class="download-demo" :href="helpDocument" target="_blank">
                        <bk-icon class="bk-layout-component-kkgoknfg bkIcon1f258 bk-icon-help" type="question-circle"> </bk-icon>
                        {{ $t('使用指引') }} </a>
                </div>
            </div>
            <extra-links></extra-links>
        </div>
        <!-- 使用v-if因子组件依赖获取的应用信息 应用的页面列表-->
        <div class="main-container" v-bkloading="{ isLoading: pageLoading }">
            <router-view v-if="!pageLoading" :key="routeKey"></router-view>
        </div>
    </main>
</template>

<script>
    import { bus } from '@/common/bus'
    import ExtraLinks from '@/components/ui/extra-links'
    export default {
        components: {
            ExtraLinks
        },
        data () {
            return {
                pageLoading: false,
                projectId: '',
                projectVersionId: '',
                curProject: {},
                defaultActive: '',
                // navList: [],
                navList: [
                    {
                        title: window.i18n.t('页面管理'),
                        icon: 'page',
                        url: 'pageList',
                        iamAction: 'develop_app',
                        permission: false,
                        toPath: {
                            name: 'pageList'
                        }
                    },
                    {
                        title: window.i18n.t('路由管理'),
                        icon: 'router',
                        url: 'routes',
                        iamAction: 'develop_app',
                        permission: false,
                        toPath: {
                            name: 'routes'
                        }
                    },
                    {
                        title: window.i18n.t('流程管理'),
                        icon: 'flow',
                        url: 'flowList',
                        iamAction: 'develop_app',
                        permission: false,
                        toPath: {
                            name: 'flowList'
                        }
                    },
                    {
                        title: window.i18n.t('数据源管理'),
                        icon: 'data-source-manage',
                        url: 'tableList',
                        toPath: {
                            name: 'tableList'
                        },
                        children: [
                            {
                                title: window.i18n.t('数据表管理'),
                                url: 'tableList',
                                iamAction: 'develop_app',
                                permission: false,
                                toPath: {
                                    name: 'tableList'
                                }
                            },
                            {
                                title: window.i18n.t('数据操作'),
                                url: 'dataOperation',
                                iamAction: 'develop_app',
                                permission: false,
                                toPath: {
                                    name: 'dataOperation'
                                }
                            }
                        ]
                    },
                    {
                        title: window.i18n.t('资源管理'),
                        icon: 'source',
                        url: 'componentManage',
                        children: [
                            {
                                title: window.i18n.t('导航布局管理'),
                                url: 'layout',
                                iamAction: 'develop_app',
                                permission: false,
                                toPath: {
                                    name: 'layout'
                                }
                            },
                            {
                                title: window.i18n.t('函数管理'),
                                url: 'functionManage',
                                iamAction: 'develop_app',
                                permission: false,
                                toPath: {
                                    name: 'functionManage'
                                }
                            },
                            {
                                title: window.i18n.t('API 管理'),
                                url: 'apiManage',
                                iamAction: 'develop_app',
                                permission: false,
                                toPath: {
                                    name: 'apiManage'
                                }
                            },
                            {
                                title: window.i18n.t('变量管理'),
                                url: 'variableManage',
                                iamAction: 'develop_app',
                                permission: false,
                                toPath: {
                                    name: 'variableManage'
                                }
                            },
                            {
                                title: window.i18n.t('文件管理'),
                                url: 'fileManage',
                                iamAction: 'develop_app',
                                permission: false,
                                toPath: {
                                    name: 'fileManage'
                                }
                            },
                            {
                                title: window.i18n.t('自定义组件管理'),
                                url: 'componentManage',
                                iamAction: 'develop_app',
                                permission: false,
                                toPath: {
                                    name: 'componentManage'
                                }
                            },
                            {
                                title: window.i18n.t('页面模板管理'),
                                url: 'templateManage',
                                iamAction: 'develop_app',
                                permission: false,
                                toPath: {
                                    name: 'templateManage'
                                },
                                redPoint: true
                            }
                        ]
                    },
                    {
                        title: window.i18n.t('发布管理'),
                        icon: '1_deploy-fill',
                        url: 'release',
                        children: [
                            {
                                title: window.i18n.t('发布部署'),
                                icon: 'list-fill',
                                url: 'release',
                                iamAction: 'deploy_app',
                                permission: false,
                                toPath: {
                                    name: 'release'
                                }
                            },
                            {
                                title: window.i18n.t('版本管理'),
                                icon: 'version',
                                url: 'versions',
                                iamAction: 'deploy_app',
                                permission: false,
                                toPath: {
                                    name: 'versions'
                                }
                            }
                        ]
                    },
                    {
                        title: window.i18n.t('权限管理'),
                        icon: 'auth-set',
                        url: 'authManage',
                        children: [
                            {
                                title: window.i18n.t('应用管理权限'),
                                icon: 'user-group',
                                url: 'authManage',
                                iamAction: 'manage_app',
                                permission: false,
                                toPath: {
                                    name: 'authManage'
                                }
                            },
                            {
                                title: window.i18n.t('应用权限模型'),
                                icon: 'info-fill',
                                url: 'appPermModel',
                                iamAction: 'manage_app',
                                permission: false,
                                toPath: {
                                    name: 'appPermModel'
                                }
                            }
                        ]
                    },
                    {
                        title: window.i18n.t('基本信息'),
                        icon: 'set-fill',
                        url: 'basicInfo',
                        iamAction: 'develop_app',
                        permission: false,
                        toPath: {
                            name: 'basicInfo'
                        }
                    },
                    {
                        title: window.i18n.t('操作审计'),
                        icon: 'audit',
                        url: 'logs',
                        iamAction: 'develop_app',
                        permission: false,
                        toPath: {
                            name: 'logs'
                        }
                    }
                ],
                projectList: [],
                filterProjectList: [],
                countdown: 3,
                timer: null,
                defaultThemeColorProps: {
                    'item-default-bg-color': '#fff',
                    'sub-menu-open-bg-color': '#fff',
                    'item-hover-bg-color': '#f0f1f5',
                    'item-hover-color': '#63656e',
                    'item-active-bg-color': '#e1ecff',

                    // 这里写 3a84ff 会命中组件 bk-navigation-menu defItemActiveColor 里三元表达式的后面的结果
                    'item-active-color': '#3a84fe',
                    'item-default-color': '#63656e',
                    'item-default-icon-color': '#63656e',
                    'item-active-icon-color': '#63656e',
                    'item-hover-icon-color': '#63656e',
                    'item-child-icon-default-color': '#63656e',
                    'item-child-icon-hover-color': '#63656e',
                    'item-child-icon-active-color': '#3a84ff'
                },
                defaultOpen: true,
                asideFolded: false,
                asideHover: false
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
                bus.$on('update-project-list', this.getProjectList)

                this.projectId = parseInt(this.$route.params.projectId)
                await this.getProjectList()
                await this.setCurrentProject()

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
                const navList = []
                navList.splice(0, 0, ...this.navList)

                if (!IAM_ENABLE) {
                    navList.splice(6, 1)
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
            } catch (e) {
                console.error(e)
            } finally {
                this.pageLoading = false
            }
        },
        async mounted () {
            this.defaultOpen = false
            this.filterProjectList = this.projectList
            this.setDefaultActive()
        },
        methods: {
            beforeShowPermissionDialog (e) {
                e.preventDefault()
                e.stopPropagation()
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
                this.defaultActive = name
            },
            toProjects () {
                this.$router.push({
                    name: 'projects'
                })
            },
            async setCurrentProject () {
                const project = this.projectList.find(item => item.id === this.projectId)
                this.$store.commit('project/setCurrentProject', project)
                this.curProject = Object.assign({}, project)
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
            changeProject (id) {
                this.$router.replace({
                    params: {
                        projectId: id
                    }
                })
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

    .select-project-dropdown .bk-select-search-input {
        padding: 0 10px 0 30px;
    }

    .project-layout {
        --side-hd-height: 52px;
        --side-ft-height: 50px;
        --aside-width: 258px;
        --footer-height: 50px;
        --breadcrumb-height: 52px;
        --aside-folded-width: 60px;
        min-width: 1280px;
        height: calc(100vh - 52px);
        margin-top: 52px;

        &.aside-folded:not(.aside-hover) {
            .aside {
                width: var(--aside-folded-width);
                .side-hd {
                    justify-content: center;

                    .seperate-line,
                    .template-logo,
                    .select-project {
                        display: none;
                    }
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

        .aside {
            position: relative;
            width: var(--aside-width);
            height: 100%;
            border-right: 1px solid #DCDEE5;
            background: #FFF;
            float: left;
            z-index: 1;
            transition: width .2s cubic-bezier(0.4, 0, 0.2, 1);

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
                .template-logo {
                    margin: 0 10px;
                    cursor: pointer;
                    svg {
                        vertical-align: middle;
                    }
                }
                .seperate-line {
                    width: 1px;
                    color: #d8d8d8;
                    margin-left: -2px;
                }
                .select-project {
                    width: 216px;
                    border: none;
                    margin-left: 2px;
                    .bk-select-name {
                        font-size: 14px;
                        color: #313238;
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
                background: #fff;
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

                    &:hover {
                        opacity: .8;
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
            background: #fff !important;
            .menu-forbid-container-cls {
                display: inline-block;
                height: 40px;
                line-height: 40px;
                width: 187px;
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
                        background: #f0f1f5;
                    }
                }
            }
            .nav-item {
                display: flex;
                align-items: center;
                font-size: 14px;
                height: 42px;
                line-height: 42px;
                padding: 0 12px 0 22px;
                margin: 0;
                white-space: nowrap;
                cursor: pointer;
                .item-title{
                    font-size: 16px;
                    margin-right: 16px;
                    color: #63656E !important;
                }

                .bk-drag-icon {
                    font-size: 16px;
                    margin-right: 16px !important;
                    color: #63656E !important;
                }
                &:hover {
                    background: #F6F6F9;
                }
                &.router-link-active {
                    background: #E1ECFF;
                    color: #3A84FF;
                }
            }
        }

        &.no-breadcrumb {
            .main-container {
                height: 100%;
            }
        }
    }
</style>
