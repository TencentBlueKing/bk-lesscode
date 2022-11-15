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
    <main class="projects page-content">
        <div class="page-head">
            <!-- <auth-button
                theme="primary"
                auth="create_app"
                @click="handleCreate"
                style="margin-right: 20px;"
                class="w120">
                新建
            </auth-button> -->
            <!-- <auth-button
                theme="primary"
                auth="script/create"
                @click="test"
                style="margin-right: 20px;"
                permission="sdsd"
                class="w120">
                新建11
            </auth-button> -->
            <bk-dropdown-menu trigger="click" :align="'center'" :ext-cls="'create-dropdown'">
                <div class="dropdown-trigger-btn" slot="dropdown-trigger">
                    <bk-button theme="primary" icon-right="icon-angle-down">新建</bk-button>
                </div>
                <ul class="bk-dropdown-list" slot="dropdown-content">
                    <!-- <li><a href="javascript:;" @click="handleCreate">空白应用</a></li>
                    <li><a href="javascript:;" @click="handleTempCreate">从模板新建</a></li> -->
                    <!-- <li>
                        <a href="javascript:;">
                            <auth-component auth="script/create">
                                <span slot="forbid">空白应用</span>
                                <span @click="handleCreate">空白应用</span>
                            </auth-component>
                        </a>
                    </li>
                    <li>
                        <a href="javascript:;">
                            <auth-component auth="script/create">
                                <span slot="forbid">从模板新建</span>
                                <span @click="handleTempCreate">从模板新建</span>
                            </auth-component>
                        </a>
                    </li> -->
                    <template v-if="iamEnable">
                        <li>
                            <auth-component auth="create_app">
                                <a href="javascript:;" slot="forbid">空白应用</a>
                                <a href="javascript:;" slot="allow" @click="handleCreate">空白应用</a>
                            </auth-component>
                        </li>
                        <li>
                            <auth-component auth="create_app">
                                <a href="javascript:;" slot="forbid">从模板新建</a>
                                <a href="javascript:;" slot="allow" @click="handleTempCreate">从模板新建</a>
                            </auth-component>
                        </li>
                    </template>
                    <template v-else>
                        <li><a href="javascript:;" @click="handleCreate">空白应用</a></li>
                        <li><a href="javascript:;" @click="handleTempCreate">从模板新建</a></li>
                    </template>
                </ul>
            </bk-dropdown-menu>
            <ul class="filter-links">
                <li
                    v-for="(link, index) in filterLinks"
                    :key="index"
                    :class="['link-item', { 'active': filter === link.value }]"
                    @click="handleClickFilter(link.value)">
                    {{link.name}}
                </li>
            </ul>
            <div class="extra">
                <span class="total" v-show="projectList.length">共<em class="count">{{projectList.length}}</em>个应用</span>
                <bk-input
                    style="width: 260px"
                    placeholder="请输入应用名称或描述"
                    :clearable="true"
                    :right-icon="'bk-icon icon-search'"
                    v-model="keyword"
                    @clear="handleSearchClear"
                    @enter="handleSearchEnter">
                </bk-input>
                <icon-button-toggle
                    :icons="displayTypeIcons"
                    @toggle="handleToggleDisplayType"
                />
                <sort-select v-model="sort" :has-default="false" @change="handleSortChange" />
            </div>
        </div>
        <div :class="['page-body', { 'is-empty': !projectList.length }]" v-bkloading="{ isLoading: pageLoading, opacity: 1 }">
            <div class="page-body-inner" v-show="!pageLoading">
                <component
                    :is="listComponent"
                    :project-list="projectList"
                    :page-map="pageMap"
                    :is-search="isSearch"
                    :filter="filter"
                    @create="handleCreate"
                    @preview="handlePreview"
                    @to-page="handleGotoPage"
                    @copy="handleCopy"
                    @rename="handleRename"
                    @download="handleDownloadSource"
                    @set-template="handleSetTemplate"
                    @collect="handleCollect"
                    @release="handleRelease"
                />
            </div>
        </div>

        <bk-dialog v-model="dialog.create.visible"
            render-directive="if"
            theme="primary"
            width="750"
            :position="{ top: 100 }"
            :mask-close="false"
            :auto-close="false"
            header-position="left"
            ext-cls="project-create-dialog"
            @value-change="handleCreateDialogToggle">
            <span slot="header">
                {{ isCopy ? '复制应用' : '创建应用' }}
                <i class="bk-icon icon-info-circle" style="font-size: 14px;" v-bk-tooltips.top="{ content: '创建lesscode应用时，会同步在蓝鲸开发者中心创建应用的default模块' }"></i>
            </span>
            <bk-form ref="createForm" :label-width="86" :rules="dialog.create.formRules" :model="dialog.create.formData">
                <bk-form-item label="应用名称" required property="projectName" error-display-type="normal">
                    <bk-input maxlength="60" v-model.trim="dialog.create.formData.projectName"
                        placeholder="由汉字，英文字母，数字组成，20个字符以内">
                    </bk-input>
                </bk-form-item>
                <bk-form-item label="应用ID" required property="projectCode" error-display-type="normal">
                    <bk-input maxlength="60" v-model.trim="dialog.create.formData.projectCode"
                        placeholder="由小写字母组成，长度小于16个字符，该ID将作为自定义组件前缀，创建后不可更改">
                    </bk-input>
                </bk-form-item>
                <bk-form-item label="应用简介" required property="projectDesc" error-display-type="normal">
                    <bk-input
                        v-model.trim="dialog.create.formData.projectDesc"
                        :type="'textarea'"
                        :rows="3"
                        :maxlength="100">
                    </bk-input>
                </bk-form-item>
                <bk-form-item label="导航布局" style="margin-top: 10px" v-if="!isCopy" error-display-type="normal">
                    <span class="layout-desc">可多选，作为创建应用页面时可供选择的导航布局，便于在应用中统一配置导航</span>
                    <layout-thumb-list :list="defaultLayoutList" @change-checked="handleLayoutChecked" @set-default="handleLayoutDefault" />
                </bk-form-item>
            </bk-form>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :loading="dialog.create.loading"
                    @click="handleCreateConfirm">确定</bk-button>
                <bk-button @click="handleCreateCancel" :disabled="dialog.create.loading">取消</bk-button>
            </div>
        </bk-dialog>

        <bk-dialog v-model="dialog.rename.visible"
            theme="primary"
            title="重命名"
            width="600"
            :mask-close="false"
            :auto-close="false"
            header-position="left"
            @after-leave="handleRenameDialogAfterLeave">
            <bk-form ref="renameForm" class="rename-form" :label-width="90" :rules="dialog.rename.formRules" :model="dialog.rename.formData">
                <bk-form-item label="应用名称" required property="projectName" error-display-type="normal">
                    <bk-input ref="projectRenameInput"
                        maxlength="60"
                        v-model="dialog.rename.formData.projectName"
                        placeholder="由汉字，英文字母，数字组成，20个字符以内">
                    </bk-input>
                </bk-form-item>
            </bk-form>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :disabled="activatedProject.projectName === dialog.rename.formData.projectName"
                    :loading="dialog.rename.loading"
                    @click="handleRenameConfirm">确定</bk-button>
                <bk-button @click="handleRenameCancel" :disabled="dialog.rename.loading">取消</bk-button>
            </div>
        </bk-dialog>

        <bk-dialog v-model="dialog.delete.visible"
            render-directive="if"
            theme="primary"
            ext-cls="delete-dialog-wrapper"
            title="确认删除该应用？"
            width="500"
            footer-position="center"
            :mask-close="false"
            :auto-close="false"
            @value-change="handleDeleteDialogToggle">
            <bk-form ref="deleteForm" class="delete-form" :label-width="0" :rules="dialog.delete.formRules" :model="dialog.delete.formData">
                <p class="confirm-name">请输入<em title="复制名称">“{{activatedProject.projectName}}”</em>确认</p>
                <bk-form-item property="projectName" error-display-type="normal">
                    <bk-input
                        maxlength="60"
                        v-model="dialog.delete.formData.projectName"
                        placeholder="请输入应用名称">
                    </bk-input>
                </bk-form-item>
            </bk-form>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="danger"
                    :loading="dialog.delete.loading"
                    @click="handleDeleteConfirm">删除</bk-button>
                <bk-button @click="handleDeleteCancel" :disabled="dialog.delete.loading">取消</bk-button>
            </div>
        </bk-dialog>

        <template-dialog ref="templateDialog" @preview="handlePreview" @to-page="handleGotoPage"></template-dialog>

        <download-dialog ref="downloadDialog"></download-dialog>

        <set-template-dialog ref="setTemplateDialog" :refresh-list="getProjectList"></set-template-dialog>
    </main>
</template>

<script>
    import { mapGetters } from 'vuex'
    import dayjs from 'dayjs'
    import LayoutThumbList from '@/components/project/layout-thumb-list'
    import PagePreviewThumb from '@/components/project/page-preview-thumb.vue'
    import DownloadDialog from '../components/download-dialog'
    import TemplateDialog from '../components/template-dialog'
    import IconButtonToggle from '@/components/ui/icon-button-toggle.vue'
    import SortSelect from '@/components/project/sort-select'
    import ListCard from './children/list-card.vue'
    import ListTable from './children/list-table.vue'
    import SetTemplateDialog from '../components/set-template-dialog.vue'
    import relativeTime from 'dayjs/plugin/relativeTime'
    import 'dayjs/locale/zh-cn'

    dayjs.extend(relativeTime)
    dayjs.locale('zh-cn')

    const defaultCreateFormData = {
        projectName: '',
        projectCode: '',
        projectDesc: '',
        copyFrom: null
    }

    export default {
        components: {
            LayoutThumbList,
            PagePreviewThumb,
            DownloadDialog,
            TemplateDialog,
            SetTemplateDialog,
            IconButtonToggle,
            SortSelect,
            [ListCard.name]: ListCard,
            [ListTable.name]: ListTable
        },
        data () {
            return {
                keyword: this.$route.query.q || '',
                projectList: [],
                pageMap: {},
                filterLinks: [
                    { name: '全部应用', value: '' },
                    { name: '我创建的', value: 'my' },
                    { name: '我收藏的', value: 'favorite' }
                ],
                dialog: {
                    create: {
                        visible: false,
                        loading: false,
                        formData: { ...defaultCreateFormData },
                        formRules: {
                            projectName: [
                                {
                                    regex: /^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$/,
                                    message: '由汉字，英文字母，数字组成，20个字符以内',
                                    trigger: 'blur'
                                }
                            ],
                            projectCode: [
                                {
                                    regex: /^[a-z]{1,16}$/,
                                    message: '只能由小写字母组成, 16个字符以内',
                                    trigger: 'blur'
                                }
                            ],
                            projectDesc: [
                                {
                                    required: true,
                                    message: '必填项',
                                    trigger: 'blur'
                                }
                            ]
                        }
                    },
                    rename: {
                        visible: false,
                        loading: false,
                        formData: {
                            projectName: ''
                        },
                        formRules: {
                            projectName: [
                                {
                                    required: true,
                                    message: '必填项',
                                    trigger: 'blur'
                                },
                                {
                                    regex: /^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$/,
                                    message: '由汉字，英文字母，数字组成，20个字符以内',
                                    trigger: 'blur'
                                }
                            ]
                        }
                    },
                    delete: {
                        visible: false,
                        loading: false,
                        formData: {
                            projectName: ''
                        },
                        formRules: {
                            projectName: [
                                {
                                    required: true,
                                    message: '必填项',
                                    trigger: 'blur'
                                },
                                {
                                    validator: (val) => {
                                        return this.activatedProject.projectName === val
                                    },
                                    message: '名称不一致，请重试',
                                    trigger: 'blur'
                                }
                            ]
                        }
                    }
                },
                activatedProject: {},
                pageLoading: true,
                projectCodeOldValue: '',
                defaultLayoutList: [],
                layoutFullList: [],
                displayTypeIcons: [
                    { name: 'card', icon: 'display-card', title: '卡片' },
                    { name: 'list', icon: 'display-list', title: '列表' }
                ],
                listComponent: ListCard.name,
                sort: 'createTime', // 应用的默认排序为id相当于创建时间
                projectListDefaultSort: [],
                iamEnable: IAM_ENABLE
            }
        },
        provide () {
            return {
                getUpdateInfoMessage: this.getUpdateInfoMessage,
                getUpdateInfo: this.getUpdateInfo
            }
        },
        computed: {
            ...mapGetters(['iamNoResourcesPerm']),
            filter () {
                return this.$route.query.filter || ''
            },
            isCopy () {
                return this.dialog.create.formData.copyFrom !== null
            },
            isSearch () {
                return this.$route.query?.q?.length > 0
            }
        },
        watch: {
            $route: function () {
                this.getProjectList()
            },
            keyword (val) {
                if (!val) {
                    this.handleSearchClear()
                }
            }
        },
        created () {
            this.getProjectList()
            this.getDefaultLayout()
        },
        methods: {
            test () {
                console.error('testtesttest')
            },
            getCursorData () {
                return {
                    active: true,
                    auth: { type: 'app', relation: [11] },
                    onclick: this.hideSelectorPanel
                }
            },
            hideSelectorPanel () {
                console.error('hideSelectorPanel')
            },
            async getDefaultLayout () {
                try {
                    const layoutList = await this.$store.dispatch('layout/getPlatformList')
                    layoutList.forEach(item => {
                        const isEmptyType = ['empty', 'mobile-empty'].includes(item.type)
                        item.isDefault = isEmptyType
                        item.checked = isEmptyType
                        item.disabled = isEmptyType
                    })
                    this.layoutFullList = layoutList
                    this.defaultLayoutList = this.layoutFullList.filter(item => item.type !== 'mobile-empty')
                } catch (e) {
                    console.error(e)
                }
            },
            async getProjectList () {
                this.pageLoading = true
                try {
                    const params = this.$route.query
                    const { projectList, pageMap } = await this.$store.dispatch('project/query', { config: { params } })
                    this.projectList = projectList
                    this.pageMap = pageMap

                    this.projectListDefaultSort = this.projectList.slice()

                    // 当前非默认排序才需要执行一次排序
                    if (this.sort !== 'createTime') {
                        this.handleSortChange(this.sort)
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    this.pageLoading = false
                }
            },
            getUpdateInfoMessage (project) {
                const info = this.getUpdateInfo(project)
                return `${info.updateUser} ${info.updateTimeFromNow}`
            },
            getUpdateInfo (project) {
                const latestPage = this.pageMap[project.id] ? this.pageMap[project.id][0] : null
                return latestPage ? {
                    updateUser: latestPage.updateUser || 'admin',
                    updateTimeFromNow: `${dayjs(latestPage.updateTime).fromNow()}更新`,
                    updateTime: latestPage.updateTime
                } : {
                    updateUser: project.createUser || 'admin',
                    updateTimeFromNow: `${dayjs(project.createTime).fromNow()}创建`,
                    updateTime: project.createTime
                }
            },
            async handleCreateConfirm () {
                try {
                    await this.$refs.createForm.validate()
                    const data = this.dialog.create.formData
                    const layouts = this.layoutFullList.filter(layout => layout.checked || layout.type === 'mobile-empty').map(layout => {
                        return {
                            layoutId: layout.id,
                            routePath: layout.defaultPath,
                            isDefault: layout.isDefault,
                            showName: layout.defaultName,
                            layoutCode: layout.defaultCode,
                            content: layout.defaultContent,
                            layoutType: layout.layoutType
                        }
                    })
                    data.layouts = layouts

                    this.dialog.create.loading = true
                    const projectId = await this.$store.dispatch('project/create', { data })

                    this.messageSuccess('应用创建成功')
                    this.dialog.create.visible = false

                    setTimeout(() => {
                        this.handleGotoPage(projectId)
                    }, 300)
                } catch (e) {
                    console.error(e)
                } finally {
                    this.dialog.create.loading = false
                }
            },
            async handleCollect (project) {
                try {
                    const favorite = project.favorite ? 0 : 1
                    const data = {
                        id: project.id,
                        favorite
                    }
                    await this.$store.dispatch('project/favorite', { data })
                    this.messageSuccess(`${favorite ? '添加' : '取消'}成功`)

                    // 更新数据状态
                    project.favorite = favorite
                    if (this.filter === 'favorite') {
                        this.getProjectList()
                    }
                } catch (e) {
                    console.error(e)
                }
            },
            async handleRenameConfirm () {
                try {
                    await this.$refs.renameForm.validate()

                    const { id, projectName } = this.dialog.rename.formData
                    const data = {
                        id,
                        fields: { projectName }
                    }
                    this.dialog.rename.loading = true

                    const checkNameResult = await this.checkProjectName(projectName)
                    if (!checkNameResult) {
                        return
                    }

                    await this.$store.dispatch('project/update', { data })

                    this.messageSuccess('重命名成功')
                    this.dialog.rename.visible = false

                    const activeProject = this.projectList.find(project => project.id === id)
                    if (activeProject) {
                        activeProject.projectName = projectName
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    this.dialog.rename.loading = false
                }
            },
            async handleDeleteConfirm () {
                try {
                    await this.$refs.deleteForm.validate()

                    const { id } = this.dialog.delete.formData
                    const data = { id }
                    this.dialog.delete.loading = true

                    await this.$store.dispatch('project/delete', { config: { data } })

                    this.messageSuccess('删除成功')
                    this.dialog.delete.visible = false

                    this.getProjectList()
                } catch (e) {
                    console.error(e)
                } finally {
                    this.dialog.delete.loading = false
                }
            },
            async checkProjectName (name) {
                const res = await this.$store.dispatch('project/checkname', {
                    data: { name }
                })
                if (res.code !== 0) {
                    this.messageError(res.message)
                    return false
                }
                return true
            },
            handleLayoutChecked (layout) {
                layout.checked = !layout.checked
                if (!layout.checked && layout.isDefault) {
                    layout.isDefault = 0
                    this.defaultLayoutList.filter(item => item.checked)[0].isDefault = 1
                }
            },
            handleLayoutDefault (layout) {
                this.defaultLayoutList.forEach(item => (item.isDefault = 0))
                layout.isDefault = 1
            },
            handleCreateCancel () {
                this.dialog.create.visible = false
            },
            handleRenameCancel () {
                this.dialog.rename.visible = false
            },
            handleDeleteCancel () {
                this.dialog.delete.visible = false
            },
            handleCreateDialogToggle () {
                this.dialog.create.formData = { ...defaultCreateFormData }
            },
            handleRenameDialogAfterLeave () {
                this.dialog.rename.formData.projectName = ''
            },
            handleDeleteDialogToggle () {
                this.dialog.delete.formData.projectName = ''
            },
            handleCreate () {
                defaultCreateFormData.copyFrom = null
                defaultCreateFormData.projectName = ''
                this.dialog.create.visible = true
            },
            async handleCopy (project) {
                defaultCreateFormData.copyFrom = project.id
                defaultCreateFormData.projectName = `${project.projectName}copy`
                this.dialog.create.visible = true
            },
            handleDownloadSource (project) {
                this.$refs.downloadDialog.isShow = true
                this.$refs.downloadDialog.projectId = project.id
                this.$refs.downloadDialog.projectCode = project.projectCode
                this.$refs.downloadDialog.projectName = project.projectName
            },
            handleSetTemplate (project) {
                this.$refs.setTemplateDialog.isShow = true
                this.$refs.setTemplateDialog.projectId = project.id
                this.$refs.setTemplateDialog.formData = {
                    isOffcial: project.isOffcial,
                    offcialType: project.offcialType
                }
            },
            async handleRename (project) {
                this.activatedProject = project

                this.dialog.rename.visible = true
                this.dialog.rename.formData.projectName = project.projectName
                this.dialog.rename.formData.id = project.id
                setTimeout(() => {
                    this.$refs.projectRenameInput && this.$refs.projectRenameInput.$el.querySelector('input').focus()
                }, 0)
            },
            async handleDelete (project) {
                this.activatedProject = project

                this.dialog.delete.visible = true
                this.dialog.delete.formData.id = project.id
            },
            handleClickFilter (filter = '') {
                const query = { ...this.$route.query, ...{ filter } }
                this.updateRoute({ query })
            },
            handleSearchClear (a, b) {
                const query = { ...this.$route.query, ...{ q: '' } }
                this.updateRoute({ query })
            },
            handleSearchEnter (value) {
                const query = { ...this.$route.query, ...{ q: value } }
                this.updateRoute({ query })
            },
            updateRoute (location) {
                this.$router.push(location).catch(e => e)
            },
            handleGotoPage (projectId) {
                this.$router.push({
                    name: 'pageList',
                    params: {
                        projectId
                    }
                })
            },
            handleRelease (projectId) {
                this.$router.push({
                    name: 'release',
                    params: {
                        projectId
                    }
                })
            },
            handlePreview (id) {
                window.open(`/preview/project/${id}/`, '_blank')
            },
            // 从模板创建
            handleTempCreate () {
                this.$refs.templateDialog.isShow = true
            },
            handleToggleDisplayType (type) {
                const typeMap = {
                    'card': ListCard.name,
                    'list': ListTable.name
                }
                this.listComponent = typeMap[type]
            },
            handleSortChange (sort) {
                this.sort = sort
                if (sort !== 'createTime') {
                    if (sort === 'updateTime') {
                        this.sortByUpdateTime()
                    }
                } else {
                    this.projectList = this.projectListDefaultSort.slice()
                }
            },
            sortByCreateTime () {
                this.projectList.sort((projA, projB) => new Date(projB.createTime).getTime() - new Date(projA.createTime).getTime())
            },
            sortByUpdateTime () {
                this.projectList.sort((projA, projB) => {
                    const projAUpdateTime = this.getUpdateInfo(projA)?.updateTime
                    const projBUpdateTime = this.getUpdateInfo(projB)?.updateTime
                    return new Date(projBUpdateTime).getTime() - new Date(projAUpdateTime).getTime()
                })
            }
        }
    }
</script>

<style lang="postcss">
    .project-create-dialog {
        .bk-dialog-body {
            padding-bottom: 10px;
        }
    }
</style>

<style lang="postcss" scoped>
    .projects {
        max-width: 1680px;
        margin: 0 auto;
    }

    .create-dropdown {
        /deep/ .bk-dropdown-trigger .bk-button {
            font-size: 14px;
        }
    }

    .page-head {
        margin-bottom: 8px;

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

    .page-body {
        display: flex;
        flex: 1;
        height: calc(100% - 40px);

        .page-body-inner {
            overflow: hidden;
        }

        &.is-empty {
            ::v-deep .list-card {
                display: flex;
            }
        }
    }

    .filter-links {
        display: flex;
        align-items: center;
        margin-left: 16px;
        .link-item {
            padding: 6px 12px;
            margin: 0 8px;
            border-radius: 16px;
            cursor: pointer;

            &:hover {
                background: #E1ECFF;
            }

            &.active {
                background: #E1ECFF;
                color: #3A84FF;
            }
        }
    }

    .rename-form {
        margin: 12px 0;
    }

    /deep/ .delete-dialog-wrapper {
        .delete-form {
            .confirm-name {
                margin: 16px 0 8px 0;
                font-size: 14px;
                em {
                    font-style: normal;
                    font-weight: 700;
                    cursor: pointer;
                }
            }
        }
        .bk-dialog-footer {
            text-align: center;
            padding: 0 65px 40px;
            background-color: #fff;
            border: none;
            border-radius: 0;
        }
        .dialog-footer {
            button {
                width: 86px;
            }
        }
    }

    .project-create-dialog {
        .layout-desc {
            font-size: 12px;
            color: #979BA5;
        }
        .layout-list {
            display: flex;
            margin-left: 10px;
            .list-item {
                position: relative;
                width: 158px;
                height: 120px;
                background: #ffffff;
                border-radius: 2px;
                &:hover {
                    .default-setting {
                        display: block;
                    }
                }
                .default-span {
                    position: absolute;
                    right: 0;
                    top: 0;
                    border-radius: 2px;
                    font-size: 12px;
                    padding: 0 5px;
                }
                .default-checked {
                    cursor: default;
                    color: #fff;
                    background: #FFB848;
                }
                .default-setting {
                    display: none;
                    background: #e1ecff;
                    color: #3a84ff;
                    cursor: pointer;
                }
                .checked-icon-div {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 34px;
                    height: 32px;
                    background: linear-gradient(135deg,transparent 50%,#3a84ff 50%);
                    border-radius: 0px 2px 0px;
                    text-align: right;
                    .checked-icon {
                        display: block;
                        color: #fff;
                        font-size: 20px;
                        margin: 12px 0 0 12px;
                    }
                }
            }
            .layout-empty-item {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #979ba5;
                font-size: 12px;
                border: 1px solid #c4c6cc;
                cursor: default;
            }
            .layout-item {
                cursor: pointer;
                border: 1px solid #dcdee5;
                margin-left: 12px;
                .layout-img {
                    margin: 6px 6px 0;
                    img {
                        width: 146px;
                        height: 88px;
                    }
                }
                .layout-info {
                    text-align: center;
                    font-size: 12px;
                    color: #63656e;
                }
            }
        }
    }

    .permission-disable {
        color: #fff !important;
        background-color: #dcdee5 !important;
        border-color: #dcdee5 !important;

        &.bk-button-text {
            color: #c4c6cc !important;
            background: none !important;
        }
    }
</style>
