<template>
    <section style="height: 100%; width: 100%">
        <div class="page-menu-item" :key="page.pageId" :class="{ 'selected-item': page.pageId === currentPageId }" @click="changeCurrentPage(page.pageId)">
            <div class="icon-and-name">
                <i :style="{ color: NOCODE_TYPE_MAP['color'][page.nocodeType || ''] }" :class="NOCODE_TYPE_MAP['icon'][page.nocodeType || '']"></i>
                <span class="page-name" :title="page.pageName">{{ page.pageName }}</span>
            </div>
            <div>
                <span class="tag-span">{{NOCODE_TYPE_MAP['title'][page.nocodeType || '']}}</span>
                <bk-dropdown-menu :ref="`moreActionDropdown${page.id}`">
                    <span slot="dropdown-trigger" class="more-menu-trigger">
                        <i class="bk-drag-icon bk-drag-more-dot"></i>
                    </span>
                    <ul class="bk-dropdown-list page-item-ul" slot="dropdown-content" @click="hideDropdownMenu(page.id)">
                        <li><a href="javascript:;" @click="handleEditPage(page)">编辑</a></li>
                        <li v-if="!page.nocodeType"><a href="javascript:;" @click="handleCopy(page)">复制</a></li>
                        <li><a href="javascript:;" @click="handleRename(page)">重命名</a></li>
                        <li><a href="javascript:;" @click="handleEditRoute(page)">修改路由</a></li>
                        <li v-if="!page.nocodeType"><a href="javascript:;" @click="handleDownloadSource(page)">下载源码</a></li>
                        <li v-if="page.nocodeType === 'FORM'"><a href="javascript:;" @click="handleCreateFormManage(page)">生成数据管理页</a></li>
                        <li><a href="javascript:;" @click="handleDelete(page)">删除</a></li>
                    </ul>
                </bk-dropdown-menu>
            </div>
        </div>
        <page-dialog ref="pageDialog" :action="action" :current-name="currentName" :refresh-list="getPageList"></page-dialog>
        <edit-route-dialog ref="editRouteDialog" :route-group="editRouteGroup" :current-route="currentRoute" @success="getPageList" />
    </section>
</template>

<script>
    import pageDialog from '@/components/project/page-dialog'
    import editRouteDialog from '@/components/project/edit-route-dialog'
    import { getRouteFullPath } from 'shared/route'
    import { NOCODE_TYPE_MAP } from '@/common/constant'

    export default {
        components: {
            pageDialog,
            editRouteDialog
        },
        props: {
            page: {
                type: Object,
                required: true
            },
            currentPageId: {
                type: Number,
                required: true
            },
            pageRouteList: {
                type: Array,
                default: () => ([])
            },
            routeGroup: {
                type: Array,
                default: () => ([])
            },
            changeCurrentPage: {
                type: Function,
                default: () => {}
            }
        },
        data () {
            return {
                action: '',
                currentName: '',
                currentRoute: {},
                editRouteGroup: [],
                NOCODE_TYPE_MAP: NOCODE_TYPE_MAP
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
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
                console.log(routeMap, 'computedmap')
                return routeMap
            }
        },
        methods: {
            getPageList () {
                this.$emit('getPageList')
            },
            hideDropdownMenu (pageId) {
                this.$refs[`moreActionDropdown${pageId}`]?.hide()
            },
            async handleCopy (page) {
                this.action = 'copy'
                const layoutId = this.routeMap[page.id]?.layoutId
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
                        message: '该页面为空页面，无源码生成'
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
                console.log(page, 'page')
                this.$refs.editRouteDialog.dialog.visible = true
                this.$refs.editRouteDialog.dialog.pageId = page.id
                // this.editRouteGroup = this.routeGroup.filter(item => item.layoutType === (page.pageType || 'PC'))
                this.editRouteGroup = this.routeGroup
                this.currentRoute = this.routeMap[page.id]
                console.log(this.routeGroup, this.editRouteGroup, this.currentRoute, 'EDITROUTE')
            },
            handleDelete (page) {
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
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/variable";
    .bk-dropdown-list.page-item-ul {
        max-height: 200px;
    }
    .page-menu-item.selected-item {
        background: #E1ECFF;
        .more-menu-trigger {
            color: $primaryColor;
            display: inline-block;
        }
        .icon-and-name .page-name {
            width: 105px;
        }
        .tag-span {
            background: #A3C5FD;
            color: #FFF;
        }
    }
    .page-menu-item {
        padding: 0 12px;
        font-size: 12px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        &:hover {
            background: #F0F1F5;
            .more-menu-trigger {
                display: inline-block;
            }
            .icon-and-name .page-name {
                width: 105px;
            }
        }
        .icon-and-name {
            display: flex;
            align-items: center;
            .page-name {
                display: inline-block;
                margin: 0 8px;
                width: 120px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        i {
            font-size: 14px;
        }
        .tag-span {
            background: #F5F7FA;
            border-radius: 2px;
            padding: 2px 4px;
            font-size: 12px;
        }

        .more-menu-trigger {
            display: none;
            padding-left: 6px;
            color: #979BA5;
        }
    }
</style>
