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
<!-- 应用开发页面 -->
<template>
    <main class="project-page-container">
        <div class="page-head-wrapper">
            <div class="page-head">
                <!-- 新建按钮 -->
                <bk-dropdown-menu trigger="click" :align="'center'" :ext-cls="'create-dropdown'">
                    <div class="dropdown-trigger-btn" slot="dropdown-trigger">
                        <bk-button theme="primary" icon-right="icon-angle-down">{{ $t('新建') }}</bk-button>
                    </div>
                    <ul class="bk-dropdown-list" slot="dropdown-content">
                        <template v-if="iamEnable">
                            <li>
                                <auth-component auth="create_app">
                                    <a href="javascript:;" slot="forbid">{{ $t('新建应用') }}</a>
                                    <a href="javascript:;" slot="allow" @click="handleTempCreate">{{ $t('新建应用') }}</a>
                                </auth-component>
                            </li>
                            <li>
                                <auth-component auth="create_app">
                                    <a href="javascript:;" slot="forbid">{{ $t('导入应用') }}</a>
                                    <a href="javascript:;" slot="allow" @click="handleCreate('importProject')">{{ $t('导入应用') }}</a>
                                </auth-component>
                            </li>
                        </template>
                        <template v-else>
                            <li><a href="javascript:;" @click="handleTempCreate">{{ $t('新建应用') }}</a></li>
                            <li><a href="javascript:;" @click="handleCreate('importProject')">{{ $t('导入应用') }}</a></li>
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
                    <span class="total" v-show="projectList.length">{{ $t('共') }}<em class="count">{{projectList.length}}</em>{{ $t('个应用') }}</span>
                    <bk-input
                        style="width: 260px"
                        :placeholder="$t('请输入应用名称或描述')"
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
        </div>
        <div class="page-content projects">
            <!-- 应用列表 -->
            <div :class="['page-body', { 'is-empty': !projectList.length }]" v-bkloading="{ isLoading: pageLoading, opacity: 1 }">
                <div class="page-body-inner" v-show="!pageLoading">
                    <component
                        :is="listComponent"
                        :project-list="projectList"
                        :page-map="pageMap"
                        :empty-type="emptyType"
                        :filter="filter"
                        @create="handleCreate"
                        @preview="handlePreview"
                        @to-page="handleGotoPage"
                        @copy="handleCopy"
                        @export="handleExport"
                        @rename="handleRename"
                        @download="handleDownloadSource"
                        @set-template="handleSetTemplate"
                        @collect="handleCollect"
                        @release="handleRelease"
                        @clearSearch="handlerClearSearch"
                    />
                </div>
            </div>
            
            <!-- 应用重命名弹窗 -->
            <bk-dialog v-model="dialog.rename.visible"
                theme="primary"
                :title="$t('重命名')"
                width="600"
                :mask-close="false"
                :auto-close="false"
                header-position="left"
                @after-leave="handleRenameDialogAfterLeave">
                <bk-form ref="renameForm" class="rename-form" :label-width="90" :rules="dialog.rename.formRules" :model="dialog.rename.formData">
                    <bk-form-item :label="$t('form_应用名称')" required property="projectName" error-display-type="normal">
                        <bk-input ref="projectRenameInput"
                            maxlength="60"
                            v-model="dialog.rename.formData.projectName"
                            :placeholder="$t('由汉字，英文字母，数字组成，20个字符以内')">
                        </bk-input>
                    </bk-form-item>
                </bk-form>
                <div class="dialog-footer" slot="footer">
                    <bk-button
                        theme="primary"
                        :disabled="activatedProject.projectName === dialog.rename.formData.projectName"
                        :loading="dialog.rename.loading"
                        @click="handleRenameConfirm">{{ $t('确定') }}</bk-button>
                    <bk-button @click="handleCancel('rename')" :disabled="dialog.rename.loading">{{ $t('取消') }}</bk-button>
                </div>
            </bk-dialog>
            <!-- 删除应用确认弹窗 -->
            <bk-dialog v-model="dialog.delete.visible"
                render-directive="if"
                theme="primary"
                ext-cls="delete-dialog-wrapper"
                :title="$t('确认删除该应用？')"
                width="500"
                footer-position="center"
                :mask-close="false"
                :auto-close="false"
                @value-change="handleDeleteDialogToggle">
                <bk-form ref="deleteForm" class="delete-form" :label-width="0" :rules="dialog.delete.formRules" :model="dialog.delete.formData">
                    <p class="confirm-name">{{ $t('请输入') }}<em :title="$t('复制名称')">“{{activatedProject.projectName}}”</em>{{ $t('确认') }}</p>
                    <bk-form-item property="projectName" error-display-type="normal">
                        <bk-input
                            maxlength="60"
                            v-model="dialog.delete.formData.projectName"
                            :placeholder="$t('请输入应用名称')">
                        </bk-input>
                    </bk-form-item>
                </bk-form>
                <div class="dialog-footer" slot="footer">
                    <bk-button
                        theme="danger"
                        :loading="dialog.delete.loading"
                        @click="handleDeleteConfirm">{{ $t('删除') }}</bk-button>
                    <bk-button @click="handleCancel('delete')" :disabled="dialog.delete.loading">{{ $t('取消') }}</bk-button>
                </div>
            </bk-dialog>

            <create-empty-project-dialog ref="createDialog" />

            <template-dialog ref="templateDialog" @preview="handlePreview"></template-dialog>

            <download-dialog ref="downloadDialog"></download-dialog>

            <export-dialog ref="exportDialog"></export-dialog>

            <set-template-dialog ref="setTemplateDialog" :refresh-list="getProjectList"></set-template-dialog>
        </div>
    </main>
</template>

<script>
    import { mapGetters } from 'vuex'
    import PagePreviewThumb from '@/components/project/page-preview-thumb.vue'
    import ExportDialog from '../components/export-dialog'
    import DownloadDialog from '../components/download-dialog'
    import TemplateDialog from '../components/template-dialog'
    import CreateEmptyProjectDialog from '../components/create-empty-project-dialog'
    import IconButtonToggle from '@/components/ui/icon-button-toggle.vue'
    import SortSelect from '@/components/project/sort-select'
    import ListCard from './children/list-card.vue'
    import ListTable from './children/list-table.vue'
    import SetTemplateDialog from '../components/set-template-dialog.vue'
    import dayjs from '@/common/dayjs'
    
    export default {
        components: {
            PagePreviewThumb,
            ExportDialog,
            DownloadDialog,
            TemplateDialog,
            CreateEmptyProjectDialog,
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
                    { name: window.i18n.t('全部应用'), value: '' },
                    { name: window.i18n.t('我创建的'), value: 'my' },
                    { name: window.i18n.t('我收藏的'), value: 'favorite' }
                ],
                dialog: {
                    rename: {
                        visible: false,
                        loading: false,
                        formData: {
                            projectName: ''
                        },
                        formRules: {
                            projectName: [
                                {
                                    regex: /^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$/,
                                    message: window.i18n.t('由汉字，英文字母，数字组成，20个字符以内'),
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
                                    message: window.i18n.t('必填项'),
                                    trigger: 'blur'
                                },
                                {
                                    validator: (val) => {
                                        return this.activatedProject.projectName === val
                                    },
                                    message: window.i18n.t('名称不一致，请重试'),
                                    trigger: 'blur'
                                }
                            ]
                        }
                    }
                },
                activatedProject: {},
                pageLoading: true,
                projectCodeOldValue: '',
                displayTypeIcons: [
                    { name: 'card', icon: 'display-card', title: window.i18n.t('卡片') },
                    { name: 'list', icon: 'display-list', title: window.i18n.t('列表') }
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
            emptyType () {
                if (this.$route.query?.q?.length > 0) {
                    return 'search'
                }
                return 'noData'
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
        },
        methods: {
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
                    updateTimeFromNow: window.i18n.t('{0}更新', [dayjs(latestPage.updateTime).fromNow()]),
                    updateTime: latestPage.updateTime
                } : {
                    updateUser: project.createUser || 'admin',
                    updateTimeFromNow: window.i18n.t('{0}创建', [dayjs(project.createTime).fromNow()]),
                    updateTime: project.createTime
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
                    this.messageSuccess(`${favorite ? window.i18n.t('添加') : window.i18n.t('取消')}` + window.i18n.t('成功'))

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

                    this.messageSuccess(window.i18n.t('重命名成功'))
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

                    this.messageSuccess(window.i18n.t('删除成功'))
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
            handleCancel (type) {
                this.dialog[type].visible = false
            },
            handleRenameDialogAfterLeave () {
                this.dialog.rename.formData.projectName = ''
            },
            handleDeleteDialogToggle () {
                this.dialog.delete.formData.projectName = ''
            },
            handleCreate (type = 'newProject') {
                this.$refs.createDialog.projectType = type
                this.$refs.createDialog.formData.projectName = ''
                this.$refs.createDialog.formData.copyFrom = null
                this.$refs.createDialog.visible = true
            },
            async handleCopy (project) {
                this.$refs.createDialog.projectType = 'copyProject'
                this.$refs.createDialog.formData.copyFrom = project.id
                this.$refs.createDialog.formData.framework = project.framework || 'vue2'
                this.$refs.createDialog.formData.projectName = `${project.projectName}copy`
                this.$refs.createDialog.visible = true
            },
            async handleExport (project) {
                this.$refs.exportDialog.isShow = true
                this.$refs.exportDialog.projectId = project.id
                this.$refs.exportDialog.projectCode = project.projectCode
                this.$refs.exportDialog.projectName = project.projectName
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
                    offcialType: project.offcialType,
                    templateImg: project?.templateImg?.startsWith('http') ? project.templateImg : ''
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
                // 开发应用和页面管理时调用跳到@/views/project/page-manage
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
            },
            handlerClearSearch (searchEmpty) {
                this.keyword = searchEmpty
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

    .create-dropdown {
        /deep/ .bk-dropdown-trigger .bk-button {
            font-size: 14px;
        }
    }

    .project-page-container {
        position: relative;
        height: 100%;
        overflow: hidden;
        background-color: #FAFBFD;
    }

    .page-head-wrapper {
        background: #FFFFFF;
        box-shadow: 0 2px 4px 0 #1919290d;
        
        .page-head {
            max-width: 1680px;
            margin: 0 auto;
            height: 52px;
            padding: 10px 24px;
            display: flex;
            align-items: center;
            /* margin-bottom: 8px; */

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
    }

    .projects {
        max-width: 1680px;
        margin: 16px auto;
        padding: 0 0 16px;
        height: calc(100% - 52px);
    }

    .page-body {
        padding: 0 24px;
        display: flex;
        flex: 1;
        height: calc(100% - 60px);

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
