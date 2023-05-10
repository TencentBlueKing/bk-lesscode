<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <section v-bkloading="{ isLoading: isLoading }" style="height: 100%">
        <main class="pages pages-content" v-show="!isLoading">
            <div class="pages-head">
                <bk-dropdown-menu :align="'left'" :ext-cls="'create-dropdown'" ref="createDropdown">
                    <div class="dropdown-trigger-btn" slot="dropdown-trigger">
                        <bk-button theme="primary" icon-right="icon-angle-down" class="overflowhidden-oh">{{ $t('新建') }}</bk-button>
                    </div>
                    <ul class="bk-dropdown-list select-page-type" slot="dropdown-content">
                        <li><a href="javascript:;" @click="handleCreate('PC', '')"><i class="bk-drag-icon bk-drag-pc"> </i>{{ $t('select_PC自定义页面') }}</a></li>
                        <li><a href="javascript:;" @click="handleCreate('PC', 'FORM')"><i class="bk-drag-icon bk-drag-pc"> </i>{{ $t('select_PC表单页面') }}</a></li>
                        <li><a href="javascript:;" @click="handleCreate('PC', 'MARKDOWN')"><i class="bk-drag-icon bk-drag-pc"> </i>{{ $t('select_Markdown文档') }}</a></li>
                        <li><a href="javascript:;" @click="handleCreate('MOBILE', '')"><i class="bk-drag-icon bk-drag-mobilephone"> </i>{{ $t('select_Mobile自定义页面') }}</a></li>
                    </ul>
                </bk-dropdown-menu>
                <template>
                    <bk-dropdown-menu v-if="hasMobilePage" :align="'center'" :ext-cls="'preview-dropdown'">
                        <div class="dropdown-trigger-btn" slot="dropdown-trigger">
                            <bk-button icon-right="icon-angle-down">{{ $t('预览应用') }}</bk-button>
                        </div>
                        <ul class="bk-dropdown-list" slot="dropdown-content">
                            <li><a href="javascript:;" @click="handlePreviewPcProject">{{ $t('预览PC页面') }}</a></li>
                            <li><a href="javascript:;" @click="handlePreviewMobileProject">{{ $t('预览移动端页面') }}</a></li>
                        </ul>
                    </bk-dropdown-menu>
                    <bk-button v-else @click="handlePreviewPcProject">{{ $t('预览应用') }}</bk-button>
                </template>
                <bk-button @click="handleDownLoadProject">{{ $t('源码下载') }} </bk-button>
                <bk-button @click="handleRelease">{{ $t('我要发布') }}</bk-button>
                <div class="extra">
                    <template>
                        <type-select v-if="hasMobilePage" @select-change="handleSelectChange"></type-select>
                        <span v-else class="total" v-show="renderList.length">{{ $t('共') }}<em class="count">{{renderList.length}}</em>{{ $t('个页面') }}</span>
                    </template>
                    <bk-input
                        style="width: 260px"
                        :placeholder="$t('请输入页面名称')"
                        :clearable="true"
                        :right-icon="'bk-icon icon-search'"
                        v-model="keyword"
                        @clear="handleSearch(true)"
                        @enter="handleSearch(false)">
                    </bk-input>
                    <icon-button-toggle
                        :icons="displayTypeIcons"
                        @toggle="handleToggleDisplayType"
                    />
                    <sort-select v-model="sort" @change="handleSortChange" />
                </div>
            </div>
            <!-- 应用页面列表 -->
            <div :class="['pages-body', { 'is-empty': !renderList.length }]">
                <component
                    :is="listComponent"
                    :page-list="renderList"
                    :route-map="routeMap"
                    :nocode-type-map="nocodeTypeMap"
                    :empty-type="emptyType"
                    @create="handleCreate"
                    @preview="handlePreview"
                    @edit="handleEditPage"
                    @copy="handleCopy"
                    @rename="handleRename"
                    @edit-route="handleEditRoute"
                    @delete="handleDelete"
                    @download="handleDownloadSource"
                    @create-form="handleCreateFormManage"
                    @clear-search="handlerClearSearch"
                />
            </div>
            <page-dialog ref="pageDialog" :action="action" :current-name="currentName" :refresh-list="getPageList"></page-dialog>
            <download-dialog ref="downloadDialog"></download-dialog>
            <edit-route-dialog ref="editRouteDialog" :route-group="editRouteGroup" :current-route="currentRoute" @success="getPageList" />
            <create-page-dialog ref="createPageDialog" :platform="createPlatform" :nocode-type="createNocodeType" :init-page-data="initPageData" />
        </main>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import pageDialog from '@/components/project/page-dialog'
    import downloadDialog from '@/views/system/components/download-dialog'
    import editRouteDialog from '@/components/project/edit-route-dialog'
    import createPageDialog from '@/components/project/create-page-dialog.vue'
    import iconButtonToggle from '@/components/ui/icon-button-toggle.vue'
    import { getRouteFullPath } from 'shared/route'
    import typeSelect from '@/components/project/type-select'
    import sortSelect from '@/components/project/sort-select'
    import listCard from './children/list-card.vue'
    import listTable from './children/list-table.vue'
    import { NOCODE_TYPE_MAP } from '@/common/constant'
    import dayjs from '@/common/dayjs'

    export default {
        components: {
            pageDialog,
            downloadDialog,
            editRouteDialog,
            createPageDialog,
            typeSelect,
            sortSelect,
            iconButtonToggle,
            [listCard.name]: listCard,
            [listTable.name]: listTable
        },
        data () {
            return {
                createPlatform: '',
                createNocodeType: '',
                initPageData: {},
                action: '',
                currentName: '',
                currentRoute: {},
                keyword: '',
                renderList: [],
                pageList: [],
                pageRouteList: [],
                routeGroup: [],
                isLoading: true,
                editRouteGroup: [],
                pageType: 'ALL',
                nocodeTypeMap: NOCODE_TYPE_MAP,
                displayTypeIcons: [
                    { name: 'card', icon: 'display-card', title: window.i18n.t('卡片') },
                    { name: 'list', icon: 'display-list', title: window.i18n.t('列表') }
                ],
                listComponent: listCard.name,
                sort: 'default',
                emptyType: 'noData'
            }
        },
        provide () {
            return {
                getRelativeTime: this.getRelativeTime,
                getFormManagePages: this.getFormManagePages
            }
        },
        computed: {
            ...mapGetters(['user']),
            ...mapGetters('layout', ['pageLayout']),
            ...mapGetters('project', ['currentProject']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId', currentVersion: 'currentVersion' }),
            projectId () {
                return this.$route.params.projectId
            },
            pageId () {
                return this.$route.params.pageId || ''
            },
            routeMap () {
                const routeMap = {}
                this.pageRouteList.forEach((route) => {
                    const { id, pageId, layoutId } = route
                    routeMap[pageId] = {
                        id,
                        pageId,
                        layoutId,
                        fullPath: id ? getRouteFullPath(route) : null
                    }
                })
                return routeMap
            },
            hasMobilePage () {
                return this.pageList.find(page => page.pageType === 'MOBILE')
            }
        },
        watch: {
            keyword (val) {
                if (!val) {
                    this.handleSearch(true)
                }
            }
        },
        created () {
            this.getPageList()
        },
        methods: {
            async getPageList () {
                this.isLoading = true
                try {
                    const where = { projectId: this.projectId, versionId: this.versionId || '' }
                    const [pageList, pageRouteList, routeGroup] = await Promise.all([
                        this.$store.dispatch('page/getList', where),
                        this.$store.dispatch('route/query', where),
                        this.$store.dispatch('route/getProjectRouteTree', where)
                    ])

                    this.pageList = pageList
                    this.pageRouteList = pageRouteList
                    this.routeGroup = routeGroup

                    if (this.keyword) {
                        this.renderList = this.pageList.filter(item => item.pageName.indexOf(this.keyword) !== -1)
                    } else {
                        this.renderList = this.pageList.slice()
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    this.isLoading = false
                }
            },
            handleCreate (platform, nocodeType, initPageData = {}) {
                this.createPlatform = platform
                this.createNocodeType = nocodeType
                this.initPageData = initPageData
                this.$refs.createDropdown.hide()
                this.$refs.createPageDialog.isShow = true
            },
            handleCreateFormManage (page) {
                const initData = {
                    formId: page.formId,
                    pageCode: page.pageCode + 'manage',
                    pageName: page.pageName + '_' + window.i18n.t('数据管理页')
                }
                this.handleCreate('PC', 'FORM_MANAGE', initData)
            },
            handlePreviewPcProject () {
                // 跳转到预览入口页面
                const versionPath = `${this.versionId ? `/version/${this.versionId}` : ''}`
                window.open(`/preview/project/${this.projectId}${versionPath}/`, '_blank')
            },
            handlePreviewMobileProject () {
                // 跳转到预览入口页面
                const versionQuery = `${this.versionId ? `?version=${this.versionId}` : ''}`
                window.open(`/preview-mobile/project/${this.projectId}${versionQuery}`, '_blank')
            },
            async handleCopy (page) {
                this.action = 'copy'
                const layoutId = this.routeMap[page.id].layoutId
                this.$refs.pageDialog.layoutId = layoutId
                this.$refs.pageDialog.dialog.formData.id = page.id
                this.$refs.pageDialog.dialog.formData.pageName = `${page.pageName}-copy`
                this.$refs.pageDialog.dialog.formData.pageCode = ''
                this.$refs.pageDialog.dialog.formData.pageRoute = ''
                this.$refs.pageDialog.dialog.visible = true
            },
            async handleDownloadSource (page) {
                if (!page.content) {
                    this.$bkMessage({
                        theme: 'error',
                        message: window.i18n.t('该页面为空页面，无源码生成')
                    })
                    return
                }
                this.$store.dispatch('vueCode/getPageCode', {
                    projectId: this.projectId,
                    versionId: this.versionId,
                    pageId: page.id,
                    styleSetting: page.styleSetting,
                    from: 'download_page'
                }).then((res) => {
                    const downlondEl = document.createElement('a')
                    const blob = new Blob([res])
                    downlondEl.download = `bklesscode-page-${page.pageCode}.vue`
                    downlondEl.href = URL.createObjectURL(blob)
                    downlondEl.style.display = 'none'
                    document.body.appendChild(downlondEl)
                    downlondEl.click()
                    document.body.removeChild(downlondEl)
                })
            },
            async handleRename (page) {
                this.action = 'rename'
                this.currentName = page.pageName
                this.$refs.pageDialog.layoutId = null
                this.$refs.pageDialog.dialog.formData.pageName = page.pageName
                this.$refs.pageDialog.dialog.formData.id = page.id

                this.$refs.pageDialog.dialog.visible = true
            },
            handleEditRoute (page) {
                this.$refs.editRouteDialog.dialog.visible = true
                this.$refs.editRouteDialog.dialog.pageId = page.id
                this.editRouteGroup = this.routeGroup.filter(item => item.layoutType === (page.pageType || 'PC'))
                this.currentRoute = this.routeMap[page.id]
            },
            handleDelete (page) {
                this.$bkInfo({
                    width: 422,
                    extCls: 'delete-page-dialog',
                    title: window.i18n.t('确认删除该') + (this.nocodeTypeMap.title[page.nocodeType] || window.i18n.t('页面')),
                    subHeader: this.getDeleteSubHeader(page.pageName, this.nocodeTypeMap.deleteTips[page.nocodeType] || ''),
                    theme: 'danger',
                    confirmFn: async () => {
                        await this.$store.dispatch('page/delete', {
                            pageId: page.id
                        })
                        // 更新流程表相关字段
                        if (page.flowId && ['FLOW', 'FLOW_MANAGE'].includes(page.nocodeType)) {
                            const params = {
                                id: page.flowId,
                                pageId: page.nocodeType === 'FLOW' ? '' : undefined,
                                managePageIds: page.nocodeType === 'FLOW_MANAGE' ? '' : undefined
                            }
                            await this.$store.dispatch('nocode/flow/editFlow', params)
                        }
                        this.getPageList()
                    }
                })
            },
            getDeleteSubHeader (pageName, deleteTips) {
                const h = this.$createElement
                return h('div', {
                    style: {
                        'text-align': 'center',
                        'margin-top': '-10px'
                    }
                }, [
                    h('span', {
                        style: {
                            'color': '#979BA5',
                            'font-size': '12px'
                        }
                    }, window.i18n.t('页面：{0}', [pageName])),
                    h('div', {
                        style: {
                            'color': '#63656E',
                            'margin-top': '10px',
                            'text-align': 'left',
                            'font-size': '14px'
                        }
                    }, deleteTips)
                ])
            },
            handleEditPage (page) {
                if (page.nocodeType) {
                    if (page.nocodeType === 'FLOW') {
                        this.$router.push({
                            name: 'createTicketPageEdit',
                            params: {
                                projectId: this.projectId,
                                flowId: page.flowId,
                                pageId: page.id
                            }
                        })
                    } else {
                        this.$router.push({
                            name: 'editNocode',
                            params: {
                                projectId: this.projectId,
                                pageId: page.id
                            }
                        })
                    }
                } else {
                    this.$router.push({
                        name: 'new',
                        params: {
                            projectId: this.projectId,
                            pageId: page.id
                        }
                    })
                }
            },
            handlePreview (page) {
                if (!page.nocodeType && !page.content) {
                    this.$bkMessage({
                        theme: 'error',
                        message: window.i18n.t('该页面为空页面，请先编辑页面'),
                        limit: 1
                    })
                    return
                }

                const route = this.routeMap[page.id]
                if (!route.id) {
                    this.$bkMessage({
                        theme: 'error',
                        message: window.i18n.t('页面未配置路由，请先配置'),
                        limit: 1
                    })
                    return
                }

                // 跳转到预览入口页面
                if (page.pageType === 'MOBILE') {
                    const versionQuery = `${this.versionId ? `&version=${this.versionId}` : ''}`
                    window.open(`/preview-mobile/project/${this.projectId}?pagePath=${route.fullPath}&pageCode=${page.pageCode}${versionQuery}`, '_blank')
                } else {
                    const versionPath = `${this.versionId ? `/version/${this.versionId}` : ''}`
                    const routerUrl = `/preview/project/${this.projectId}${versionPath}${route.fullPath}?pageCode=${page.pageCode}`
                    window.open(routerUrl, '_blank')
                }
            },
            handleDownLoadProject () {
                this.$refs.downloadDialog.isShow = true
                this.$refs.downloadDialog.projectId = this.projectId
                this.$refs.downloadDialog.version = this.versionId ? `${this.currentVersion.id}:${this.currentVersion.version}` : ''
                this.$refs.downloadDialog.projectCode = this.currentProject.projectCode
                this.$refs.downloadDialog.projectName = this.currentProject.projectName
            },
            handleSearch (clear = false) {
                if (clear) {
                    this.keyword = ''
                    this.renderList = this.pageList.slice()
                    this.emptyType = 'noData'
                } else {
                    this.renderList = this.pageList.filter(item => item.pageName.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1)
                    this.emptyType = 'search'
                }
                this.handleTypeChange()

                // 当前非默认排序才需要执行一次排序
                if (this.sort !== 'default') {
                    this.handleSortChange(this.sort)
                }
            },
            getRelativeTime (time) {
                return dayjs(time).fromNow() || ''
            },
            handleTypeChange () {
                if (this.pageType === 'PC') {
                    this.renderList = this.renderList.filter(item => item.pageType !== 'MOBILE')
                } else if (this.pageType === 'MOBILE') {
                    this.renderList = this.renderList.filter(item => item.pageType === 'MOBILE')
                }
            },
            handleSelectChange (type) {
                this.pageType = type
                this.handleSearch(false)
            },
            // 跳转到发布部署页面
            handleRelease () {
                this.$router.push({
                    name: 'release'
                })
            },
            getFormManagePages (formId) {
                return this.renderList.filter(page => page.formId === formId && page.nocodeType === 'FORM_MANAGE')
            },
            handleToggleDisplayType (type) {
                const typeMap = {
                    'card': listCard.name,
                    'list': listTable.name
                }
                this.listComponent = typeMap[type]
            },
            handleSortChange (sort) {
                this.sort = sort
                if (sort !== 'default') {
                    if (sort === 'createTime') {
                        this.sortByCreateTime()
                    }
                    if (sort === 'updateTime') {
                        this.sortByUpdateTime()
                    }
                } else {
                    // 默认排序相当于使用原始数据执行一次搜索（因为可能当前存在搜索条件）
                    this.handleSearch()
                }
            },
            sortByCreateTime () {
                this.renderList.sort((pageA, pageB) => new Date(pageB.createTime).getTime() - new Date(pageA.createTime).getTime())
            },
            sortByUpdateTime () {
                this.renderList.sort((pageA, pageB) => new Date(pageB.updateTime).getTime() - new Date(pageA.updateTime).getTime())
            },
            handlerClearSearch (searchName) {
                this.keyword = searchName
            }
        }
    }
</script>

<style lang="postcss">
    .delete-page-dialog .bk-info-box .bk-dialog-sub-header{
        padding: 5px 24px;
    }
</style>
<style lang="postcss" scoped>
    .create-dropdown {
        /deep/ .bk-dropdown-trigger .bk-button {
            font-size: 14px;
        }
        .select-page-type {
            font-size: 12px;
            color:#63656E;
            a:hover i {
                color: #3a84ff;
            }
            i {
                color: #979ba5;
                margin-right: 4px;
            }
        }
    }

    .preview-dropdown {
        margin-left: 10px;

        /deep/ .bk-dropdown-trigger .bk-button {
            font-size: 14px;
            width: 110px;
        }
    }

    .pages-content {
        padding: 16px 24px;
        display: flex;
        flex-direction: column;
        height: 100%;

        .pages-head {
            display: flex;
            margin-bottom: 8px;

            button {
                &:not(:first-child) {
                    margin-left: 10px;
                }
            }

            .extra {
                display: flex;
                align-items: center;
                flex: none;
                margin-left: auto;
            }

            .total {
                font-size: 12px;
                margin-right: 8px;
                .count {
                    font-style: normal;
                    margin: 0 .1em;
                }
            }
        }
        .pages-body {
            display: flex;
            flex: 1;
            height: calc(100% - 40px);

            &.is-empty {
                ::v-deep .list-card {
                    display: flex;
                }
            }
        }
    }
</style>
