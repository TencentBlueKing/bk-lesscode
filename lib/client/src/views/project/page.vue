<template>
    <section v-bkloading="{ isLoading: isLoading }" style="height: 100%">
        <main class="pages pages-content" v-show="!isLoading">
            <div class="pages-head">
                <bk-dropdown-menu trigger="click" :align="'left'" :ext-cls="'create-dropdown'">
                    <div class="dropdown-trigger-btn" slot="dropdown-trigger">
                        <bk-button theme="primary" icon-right="icon-angle-down">新建</bk-button>
                    </div>
                    <ul class="bk-dropdown-list select-page-type" slot="dropdown-content">
                        <li><a href="javascript:;" @click="handleCreate('PC', '')"><i class="bk-drag-icon bk-drag-pc"> </i>PC自定义页面</a></li>
                        <li><a href="javascript:;" @click="handleCreate('PC', 'FORM')"><i class="bk-drag-icon bk-drag-pc"> </i>PC表单页面</a></li>
                        <li><a href="javascript:;" @click="handleCreate('MOBILE', '')"><i class="bk-drag-icon bk-drag-mobilephone"> </i>Mobile自定义页面</a></li>
                    </ul>
                </bk-dropdown-menu>
                <template>
                    <bk-dropdown-menu v-if="hasMobilePage" trigger="click" :align="'center'" :ext-cls="'preview-dropdown'">
                        <div class="dropdown-trigger-btn" slot="dropdown-trigger">
                            <bk-button icon-right="icon-angle-down">预览应用</bk-button>
                        </div>
                        <ul class="bk-dropdown-list" slot="dropdown-content">
                            <li><a href="javascript:;" @click="handlePreviewPcProject">预览PC页面</a></li>
                            <li><a href="javascript:;" @click="handlePreviewMobileProject">预览移动端页面</a></li>
                        </ul>
                    </bk-dropdown-menu>
                    <bk-button v-else @click="handlePreviewPcProject">预览应用</bk-button>
                </template>
                <bk-button @click="handleDownLoadProject">源码下载</bk-button>
                <bk-button @click="handleRelease">我要发布</bk-button>
                <div class="extra">
                    <template>
                        <type-select v-if="hasMobilePage" @select-change="handleSelectChange"></type-select>
                        <span v-else class="total" v-show="renderList.length">共<em class="count">{{renderList.length}}</em>个页面</span>
                    </template>
                    <bk-input
                        :style="{ width: '400px' }"
                        placeholder="请输入页面名称"
                        :clearable="true"
                        :right-icon="'bk-icon icon-search'"
                        v-model="keyword"
                        @clear="handleSearch(true)"
                        @enter="handleSearch(false)">
                    </bk-input>
                </div>
            </div>
            <div class="pages-body">
                <div class="page-list">
                    <div class="page-item" v-for="(page, index) in renderList" :key="index">
                        <div class="item-bd">
                            <div class="preview" @click="handleEditPage(page)">
                                <page-preview-thumb alt="页面缩略预览" :page-id="page.id" />
                                <div class="mask">
                                    <div class="operate-btns">
                                        <bk-button class="edit-btn" theme="primary">编辑</bk-button>
                                        <bk-button class="preview-btn" @click.stop="handlePreview(page)">预览</bk-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="item-ft">
                            <div class="col">
                                <div class="page-name">
                                    <span class="page-type">
                                        <i v-if="page.pageType === 'MOBILE'" class="bk-drag-icon bk-drag-mobilephone"> </i>
                                        <i v-else class="bk-drag-icon bk-drag-pc"> </i>
                                    </span>
                                    <div class="name" :title="page.pageName">{{page.pageName}}</div>
                                </div>
                                <div class="route">
                                    <svg class="label" width="22" height="14" viewBox="0 0 22 14">
                                        <rect x="0" width="22" height="14" rx="2" fill="#F0F1F5" />
                                        <text font-family="'PingFang SC','Microsoft Yahei'" fill="#979ba5" style="text-anchor: middle" font-size="8" x="11" y="10">路由</text>
                                    </svg>
                                    <div class="path">
                                        <span class="fullpath" :title="routeMap[page.id].fullPath" v-if="routeMap[page.id].id">
                                            {{routeMap[page.id].fullPath}}
                                        </span>
                                        <span class="unset" v-else>未配置</span>
                                    </div>
                                </div>
                                <div class="stat">{{ page.updateUser || page.createUser }} {{ getRelativeTime(page.updateTime) }}更新</div>
                            </div>
                            <div class="col">
                                <bk-dropdown-menu :ref="`moreActionDropdown${page.id}`">
                                    <span slot="dropdown-trigger" class="more-menu-trigger">
                                        <i class="bk-drag-icon bk-drag-more-dot"></i>
                                    </span>
                                    <ul class="bk-dropdown-list" slot="dropdown-content" @click="hideDropdownMenu(page.id)">
                                        <li v-if="!page.nocodeType"><a href="javascript:;" @click="handleDownloadSource(page.content, page.id, page.styleSetting)">下载源码</a></li>
                                        <li><a href="javascript:;" @click="handleRename(page)">重命名</a></li>
                                        <li><a href="javascript:;" @click="handleEditRoute(page)">修改路由</a></li>
                                        <li v-if="!page.nocodeType"><a href="javascript:;" @click="handleCopy(page)">复制</a></li>
                                        <li><a href="javascript:;" @click="handleDelete(page)" :class="{ 'g-no-permission': !getDeletePerm(page) }" v-bk-tooltips="{ content: '无删除权限', disabled: getDeletePerm(page) }">删除</a></li>
                                    </ul>
                                </bk-dropdown-menu>
                            </div>
                        </div>
                        <span v-if="page.nocodeType" class="nocode-type-tag" :style="{ background: nocodeTypeMap.bgColor[page.nocodeType], color: nocodeTypeMap.color[page.nocodeType] }">
                            <bk-popover
                                v-if="page.nocodeType === 'FORM' && getFormManagePages(page.formId).length"
                                ext-cls="form-manage-page-list"
                                placement="right-start"
                                theme="light"
                                width="300"
                            >
                                <section style="display: flex; align-items: center;">
                                    {{nocodeTypeMap.title[page.nocodeType] || page.nocodeType}}
                                    <i class="bk-drag-icon bk-drag-data-source-manage" style="margin: 0 2px;"></i>
                                    <span>{{getFormManagePages(page.formId).length}}</span>
                                </section>
                                <div slot="content" class="form-manage-list">
                                    <div class="list-title"><span>关联的表单数据管理页</span></div>
                                    <ul class="list-ul">
                                        <li v-for="item in getFormManagePages(page.formId)" :key="item.id">
                                            <i class="bk-drag-icon bk-drag-page"></i>
                                            <span class="name">{{item.pageName}}</span>
                                            <i title="预览" class="bk-icon icon-eye click-icon" @click="handlePreview(item)"></i>
                                            <i title="编辑" class="bk-drag-icon bk-drag-edit click-icon" @click="handleEditPage(item)"></i>
                                        </li>
                                    </ul>
                                </div>
                            </bk-popover>
                            <section v-else>{{nocodeTypeMap.title[page.nocodeType] || page.nocodeType}}</section>
                        </span>
                    </div>
                </div>
                <div class="empty" v-show="(!pageList.length || !renderList.length) && !isLoading">
                    <bk-exception class="exception-wrap-item exception-part" type="empty" scene="part">
                        <div v-if="!pageList.length" class="empty-page">暂无页面，<bk-link theme="primary" @click="handleCreate">立即创建</bk-link></div>
                        <div v-else>无搜索结果</div>
                    </bk-exception>
                </div>
            </div>
            <page-dialog ref="pageDialog" :action="action" :current-name="currentName" :refresh-list="getPageList"></page-dialog>
            <download-dialog ref="downloadDialog"></download-dialog>
            <edit-route-dialog ref="editRouteDialog" :route-group="editRouteGroup" :current-route="currentRoute" @success="getPageList" />
            <create-page-dialog ref="createPageDialog" :platform="createPlatform" :nocode-type="createNocodeType" />
        </main>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import pageDialog from '@/components/project/page-dialog'
    import downloadDialog from '@/views/system/components/download-dialog'
    import editRouteDialog from '@/components/project/edit-route-dialog'
    import createPageDialog from '@/components/project/create-page-dialog.vue'
    import pagePreviewThumb from '@/components/project/page-preview-thumb.vue'
    import { getRouteFullPath } from 'shared/route'
    import typeSelect from '@/components/project/type-select'
    import dayjs from 'dayjs'
    import { NOCODE_TYPE_MAP } from '@/common/constant'
    import relativeTime from 'dayjs/plugin/relativeTime'
    import 'dayjs/locale/zh-cn'
    dayjs.extend(relativeTime)
    dayjs.locale('zh-cn')

    export default {
        components: {
            pageDialog,
            downloadDialog,
            editRouteDialog,
            createPageDialog,
            pagePreviewThumb,
            typeSelect
        },
        data () {
            return {
                createPlatform: '',
                createNocodeType: '',
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
                nocodeTypeMap: NOCODE_TYPE_MAP
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
            userPerm () {
                return this.$store.getters['member/userPerm'] || { roleId: 2 }
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
                    this.handleSearch(false)
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
                        this.renderList = this.pageList
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    this.isLoading = false
                }
            },
            handleCreate (platform, nocodeType) {
                this.createPlatform = platform
                this.createNocodeType = nocodeType
                this.$refs.createPageDialog.isShow = true
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
            async handleDownloadSource (targetData, pageId, styleSetting) {
                if (!targetData) {
                    this.$bkMessage({
                        theme: 'error',
                        message: '该页面为空页面，无源码生成'
                    })
                    return
                }
                this.$store.dispatch('vueCode/getPageCode', {
                    projectId: this.projectId,
                    versionId: this.versionId,
                    pageId,
                    styleSetting,
                    from: 'download_page'
                }).then((res) => {
                    const downlondEl = document.createElement('a')
                    const blob = new Blob([res])
                    downlondEl.download = `bklesscode-${pageId}.vue`
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
                if (!this.getDeletePerm(page)) return

                this.$bkInfo({
                    width: 422,
                    extCls: 'delete-page-dialog',
                    title: `确认删除该${this.nocodeTypeMap.title[page.nocodeType] || '页面'}`,
                    subHeader: this.getDeleteSubHeader(page.pageName, this.nocodeTypeMap.deleteTips[page.nocodeType] || ''),
                    theme: 'danger',
                    confirmFn: async () => {
                        await this.$store.dispatch('page/delete', {
                            pageId: page.id
                        })
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
                    }, `页面：${pageName}`),
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
            getDeletePerm (page) {
                return this.userPerm.roleId === 1 || this.user.username === page.createUser
            },
            handleEditPage (page) {
                if (page.nocodeType) {
                    if (page.nocodeType === 'FLOW') {
                        this.$router.push({
                            name: 'flowConfig',
                            params: {
                                projectId: this.projectId,
                                flowId: page.flowId
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
                if (!page.content) {
                    this.$bkMessage({
                        theme: 'error',
                        message: '该页面为空页面，请先编辑页面',
                        limit: 1
                    })
                    return
                }

                const route = this.routeMap[page.id]
                if (!route.id) {
                    this.$bkMessage({
                        theme: 'error',
                        message: '页面未配置路由，请先配置',
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
                this.$refs.downloadDialog.projectName = this.currentProject.projectName
            },
            handleSearch (clear = false) {
                if (clear) {
                    this.keyword = ''
                    this.renderList = this.pageList
                } else {
                    this.renderList = this.pageList.filter(item => item.pageName.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1)
                }
                this.handleTypeChange()
            },
            hideDropdownMenu (pageId) {
                this.$refs[`moreActionDropdown${pageId}`][0].hide()
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
    .form-manage-page-list {
        .form-manage-list {
            font-size: 12px;
            color: #63656E;
            cursor: default;
            .list-title {
                height: 24px;
                font-weight: bold;
            }
            .list-ul {
                li {
                    display: flex;
                    align-items: center;
                    height: 28px;
                    i {
                        margin-right: 6px;
                    }
                    .click-icon {
                        cursor: pointer;
                    }
                    .name {
                        display: inline-block;
                        width: 220px;
                    }
                    &:hover {
                        color: #3A84FF;
                        background: #E1ECFF;
                    }
                }
            }
        }
    }
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
            margin-bottom: 17px;

            button {
                width: 86px;
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
             .empty {
                flex: 1;
                display: flex;
                align-items: center;
                .empty-page {
                    display: flex;
                    align-items: center;
                }
            }
            .page-list {
                display: flex;
                flex-wrap: wrap;
                align-content: flex-start;

                .page-item {
                    position: relative;
                    flex: none;
                    width: 304px;
                    height: 258px;
                    margin: 0 14px 30px 0;
                    padding: 6px;
                    background: #fff;
                    border-radius: 0px 6px 6px 6px;
                    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.11);
                    cursor: pointer;

                    &:hover {
                        box-shadow: 1px 2px 8px 2px rgba(0, 0 ,0 , 0.11);

                        .desc {
                            display: block;
                        }
                        .preview {
                            .mask {
                                background: rgba(0, 0, 0, 0.4);
                                .operate-btns {
                                    display: block;
                                    opacity: 1;
                                }
                            }
                        }
                    }
                    .more-menu-trigger {
                        .bk-drag-more-dot {
                            display: block;
                            width: 32px;
                            height: 32px;
                            line-height: 34px;
                            text-align: center;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 20px;
                            color: #979BA5;
                            &:hover {
                                background: #F0F1F5;
                            }
                        }
                    }

                    .item-bd {
                        flex: none;
                        position: relative;
                        width: 292px;
                        height: 158px;
                        background: #fff;
                        border-radius: 4px 4px 0px 0px;
                    }
                    .item-ft {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin: 16px 10px 0 10px;
                    }

                    .nocode-type-tag {
                        position: absolute;
                        right: 6px;
                        top: 6px;
                        height: 22px;
                        line-height: 22px;
                        text-align: center;
                        border-radius: 2px;
                        font-size: 12px;
                        color: #fff;
                        padding: 0 6px;
                    }

                    .preview {
                        position: relative;
                        height: 100%;
                        overflow: hidden;
                        border-radius: 4px 4px 0px 0px;
                        img {
                            max-width: 100%;
                        }

                        .mask {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.1);
                            display: flex;
                            align-items: center;
                            .operate-btns {
                                display: none;
                                .edit-btn {
                                    width: 86px;
                                    margin-left: 59px;
                                }
                                .preview-btn {
                                    width: 86px;
                                    margin-left: 10px;
                                    margin-rihgt: 59px;
                                }
                            }
                        }

                        /* &::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.2);
                        } */
                    }
                    .desc {
                        display: none;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        padding: 28px 26px 28px 21px;

                        .desc-text {
                            font-size: 12px;
                            color: #fff;
                            margin: 0;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: -webkit-box;
                            -webkit-line-clamp: 5;
                            -webkit-box-orient: vertical;
                        }
                    }
                    .empty {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        font-weight: 700;
                        color: #C4C6CC;
                        height: 100%;
                        background: #f0f1f5;
                        border-radius: 4px 4px 0px 0px;
                    }
                    .page-name {
                        display: flex;
                        align-items: center;
                        margin: -2px 0 0 0;

                        .name {
                            font-size: 12px;
                            font-weight: 700;
                            color: #63656E;
                            width: 215px;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            margin-left: 7px;
                        }

                        .page-type {
                            font-size: 16px;
                            line-height: 18px;
                            height: 20px;
                            width: 20px;
                            text-align: center;
                            margin-left: -2px;
                            color: #979ba5;
                            border-radius: 2px;
                            background: #f0f1f5;
                        }
                    }
                    .stat {
                        font-size: 12px;
                        color: #979BA5;
                        margin: 4px 0;
                    }
                    .route {
                        display: flex;
                        align-items: center;
                        margin: 9px 0;
                        .label {
                            margin-top: 1px;
                            margin-left: -2px;
                        }
                        .path {
                            width: 212px;
                            font-size: 12px;
                            color: #63656E;
                            margin-left: 5px;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;

                            .unset {
                                color: #FF9C01;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
