<template>
    <section style="height: 100%; width: 100%">
        <div class="page-menu-item" :key="page.pageId" :class="{ 'selected-item': page.pageId === currentPageId }" @click="changeCurrentPage(page.pageId)">
            <div class="icon-and-name">
                <i :style="{ color: NOCODE_TYPE_MAP['color'][page.nocodeType || ''] }" :class="NOCODE_TYPE_MAP['icon'][page.nocodeType || '']"></i>
                <span class="page-name" :title="page.pageName">{{ page.pageName }}</span>
            </div>
            <div class="tag-and-operate" style="position: positive">
                <form-manage-page v-if="page.nocodeType === 'FORM' && getFormManagePages(page.formId).length" :manage-pages="getFormManagePages(page.formId)"></form-manage-page>
                <span class="tag-span" :title="NOCODE_TYPE_MAP['title'][page.nocodeType || '']">{{NOCODE_TYPE_MAP['title'][page.nocodeType || '']}}</span>
                <bk-dropdown-menu :ref="`moreActionDropdown${page.id}`">
                    <span slot="dropdown-trigger" class="more-menu-trigger">
                        <i class="bk-drag-icon bk-drag-more"></i>
                    </span>
                    <ul class="bk-dropdown-list page-item-ul" slot="dropdown-content" @click.stop="hideDropdownMenu(page.id)">
                        <li><a href="javascript:;" @click="handleEditPage(page)">{{$t('编辑')}}</a></li>
                        <li v-if="!page.nocodeType"><a href="javascript:;" @click="handleShowDialog(page, 'copy')">{{$t('复制')}}</a></li>
                        <li><a href="javascript:;" @click="handleShowDialog(page, 'rename')">{{$t('重命名')}}</a></li>
                        <li><a href="javascript:;" @click="handleShowDialog(page, 'editRoute')">{{$t('修改路由')}}</a></li>
                        <li v-if="!page.nocodeType"><a href="javascript:;" @click="handleDownloadSource(page)">{{$t('下载源码')}}</a></li>
                        <li v-if="page.nocodeType === 'FORM'"><a href="javascript:;" @click="handleShowDialog(page, 'createFormManage')">{{$t('生成数据管理页')}}</a></li>
                        <li><a href="javascript:;" @click="handleDelete(page)">{{$t('删除')}}</a></li>
                    </ul>
                </bk-dropdown-menu>
            </div>
        </div>
    </section>
</template>

<script>
    import { NOCODE_TYPE_MAP } from '@/common/constant'
    import formManagePage from './form-manage-page.vue'

    export default {
        components: {
            formManagePage
        },
        props: {
            page: {
                type: Object,
                required: true
            },
            renderList: {
                type: Array,
                default: () => ([])
            },
            currentPageId: {
                type: Number,
                required: true
            },
            changeCurrentPage: {
                type: Function,
                default: () => {}
            }
        },
        data () {
            return {
                NOCODE_TYPE_MAP
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },
        methods: {
            getPageList () {
                this.$emit('getPageList')
            },
            getFormManagePages (formId) {
                return this.renderList.filter(page => page.formId === formId && page.nocodeType === 'FORM_MANAGE')
            },
            hideDropdownMenu (pageId) {
                this.$refs[`moreActionDropdown${pageId}`]?.hide()
            },
            handleShowDialog (page, type) {
                this.$emit('toggleDialog', true, { page, type })
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
            handleDelete (page) {
                this.$bkInfo({
                    width: 422,
                    extCls: 'delete-page-dialog',
                    title: window.i18n.t('确认删除该{0}页面', [this.NOCODE_TYPE_MAP.title[page.nocodeType]]),
                    subHeader: this.getDeleteSubHeader(page.pageName, this.NOCODE_TYPE_MAP.deleteTips[page.nocodeType] || ''),
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
                    }, `${window.i18n.t('页面')}：${pageName}`),
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
                            params: { projectId: this.projectId, flowId: page.flowId, pageId: page.id }
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
        .tag-span {
            background: #A3C5FD;
            color: #FFF;
        }
    }
    .page-menu-item {
        padding: 0 8px 0 12px;
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
        }
        .icon-and-name {
            display: flex;
            align-items: center;
            .page-name {
                display: inline-block;
                margin: 0 8px;
                width: 130px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        .tag-and-operate {
            display: flex;
            align-items: center;
        }
        i {
            font-size: 14px;
        }
        .tag-span {
            color: #979BA5;
            background: #F5F7FA;
            border-radius: 2px;
            font-size: 12px;
            margin-right: 12px;
            padding: 2px 5px;
            display: inline-block;
            transform: scale(0.83, 0.83);
            max-width: 96px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .more-menu-trigger {
            display: none;
            color: #979BA5;
            position: absolute;
            right: 0px;
            top: -8px;
            &:hover {
                color: $primaryColor;
            }
        }
    }
</style>
