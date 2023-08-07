<template>
    <section>
        <page-dialog ref="pageDialog" :action="action" :current-name="currentName" :refresh-list="getPageList" @closeDialog="handleClose"></page-dialog>
        <edit-route-dialog ref="editRouteDialog" :route-group="editRouteGroup" :current-route="currentRoute" @success="getPageList" @closeDialog="handleClose" />
        <create-page-dialog ref="createPageDialog" platform="PC" nocode-type="FORM_MANAGE" :init-page-data="createInitData" @closeDialog="handleClose" />
    </section>
</template>

<script>
    import pageDialog from '@/components/project/page-dialog'
    import editRouteDialog from '@/components/project/edit-route-dialog'
    import createPageDialog from '@/components/project/create-page-dialog'
    import { getRouteFullPath } from 'shared/route'

    export default {
        components: {
            pageDialog,
            editRouteDialog,
            createPageDialog
        },
        props: {
            showDialog: {
                type: Boolean,
                default: false
            },
            dialogPayload: {
                type: Object,
                default: () => ([])
            },
            pageRouteList: {
                type: Array,
                default: () => ([])
            },
            routeGroup: {
                type: Array,
                default: () => ([])
            }
        },
        data () {
            return {
                action: '',
                currentName: '',
                currentRoute: {},
                editRouteGroup: [],
                createInitData: {}
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
                return routeMap
            }
        },
        watch: {
            showDialog (val) {
                if (val) {
                    const { page, type } = this.dialogPayload
                    if (type === 'copy') {
                        this.handleCopy(page)
                    } else if (type === 'rename') {
                        this.handleRename(page)
                    } else if (type === 'editRoute') {
                        this.handleEditRoute(page)
                    } else if (type === 'createFormManage') {
                        this.handleCreateFormManage(page)
                    }
                }
            }
        },
        methods: {
            getPageList () {
                this.$emit('getPageList')
            },
            handleClose () {
                this.$emit('toggleDialog', false, {})
            },
            handleCopy (page) {
                this.action = 'copy'
                const layoutId = this.routeMap[page.id]?.layoutId
                this.$refs.pageDialog.layoutId = layoutId
                this.$refs.pageDialog.dialog.formData.id = page.id
                this.$refs.pageDialog.dialog.formData.pageName = `${page.pageName}-copy`
                this.$refs.pageDialog.dialog.formData.pageCode = ''
                this.$refs.pageDialog.dialog.formData.pageRoute = ''
                this.$refs.pageDialog.dialog.visible = true
            },
            handleRename (page) {
                this.action = 'rename'
                this.currentName = page.pageName
                this.$refs.pageDialog.layoutId = null
                this.$refs.pageDialog.dialog.formData.pageName = page.pageName
                this.$refs.pageDialog.dialog.formData.pageCode = ''
                this.$refs.pageDialog.dialog.formData.id = page.id

                this.$refs.pageDialog.dialog.visible = true
            },
            handleEditRoute (page) {
                this.$refs.editRouteDialog.dialog.visible = true
                this.$refs.editRouteDialog.dialog.pageId = page.pageId
                // this.editRouteGroup = this.routeGroup.filter(item => item.layoutType === (page.pageType || 'PC'))
                this.editRouteGroup = this.routeGroup
                this.currentRoute = this.routeMap[page.pageId]
            },
            handleCreateFormManage (page) {
                const initData = {
                    formId: page.formId,
                    pageCode: page.pageCode + 'manage',
                    pageName: page.pageName + '_数据管理页'
                }
                this.createInitData = initData
                this.$refs.createPageDialog.isShow = true
            }
        }
    }
</script>
