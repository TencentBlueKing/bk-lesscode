<template>
    <section v-bkloading="{ isLoading: isLoading }" class="page-container">
        <div class="left-panel">
            <menu-header></menu-header>
            <div class="menu-container">
                <div class="platform" v-if="hasMobilePage">
                    <div class="platform-tab">
                        <select-tab :tab-list="platformList" :active-item="platformActive" :item-change="handleSelectPlatform" active-color="#3a84ff" />
                    </div>
                </div>
                <div class="search-and-create">
                    <bk-input
                        style="width: 238px"
                        placeholder="请输入页面名称"
                        :clearable="true"
                        :right-icon="'bk-icon icon-search'"
                        v-model="keyword"
                        @clear="handleSearch(true)"
                        @enter="handleSearch(false)">
                    </bk-input>
                    <create-page-entry />
                </div>
            </div>
            <div class="menu-content">
                <template v-for="(pageList, groupName) in routeGroupMap">
                    <group-box
                        v-if="pageList.length > 0"
                        :key="groupName"
                        :list="pageList"
                        :group-name="groupName">
                        <template v-for="page in pageList">
                            <page-menu-item
                                :page="page"
                                :current-page-id="currentPageId"
                                :key="page.pageId"
                                :page-route-list="pageRouteList"
                                :route-group="routeGroup"
                                :change-current-page="changeCurrentPage"
                                @getPageList="initData" />
                        </template>
                    </group-box>
                </template>
            </div>
        </div>
        <div class="right-content">
            <div class="page-header">
                <div class="page-info">
                    <span class="icon-span"><i :style="{ color: NOCODE_TYPE_MAP['color'][currentPage.nocodeType || ''] }" :class="NOCODE_TYPE_MAP['icon'][currentPage.nocodeType || '']"></i></span>
                    <span class="name-span">{{currentPage.pageName}}</span>
                    <span class="tag-span">{{NOCODE_TYPE_MAP['title'][currentPage.nocodeType || '']}}</span>
                </div>
                <div class="page-operate">
                    <bk-button theme="primary" @click="handleEditPage(currentPage)">编辑</bk-button>
                    <bk-button @click="handlePreview(currentPage)">预览</bk-button>
                </div>
            </div>
            <div class="page-content">
                <iframe
                    v-if="currentPageId"
                    width="100%"
                    height="100%"
                    style="border: none"
                    :src="iframeUrl"
                >
                </iframe>
                <!-- <bk-exception v-else class="exception-wrap-item" type="empty">
                    <span>暂未选中页面</span>
                </bk-exception> -->
            </div>
        </div>
    </section>
</template>

<script>
    import MenuHeader from './children/menu-header'
    import CreatePageEntry from './children/create-page-entry'
    import PageMenuItem from './children/page-menu-item'
    import SelectTab from '@/components/ui/select-tab'
    import GroupBox from '@/components/ui/group'
    import { defineComponent, reactive, ref, computed, onBeforeMount } from '@vue/composition-api'
    import usePageOperation from './children/use-page-operation'
    import store from '@/store'
    import router from '@/router'
    import { NOCODE_TYPE_MAP } from '@/common/constant'

    export default defineComponent({
        components: {
            GroupBox,
            MenuHeader,
            CreatePageEntry,
            PageMenuItem,
            SelectTab
        },
        setup () {
            const { handleEditPage } = usePageOperation()
            const projectId = router?.currentRoute?.params?.projectId
            const versionId = store.getters['projectVersion/currentVersionId']
            const params = { projectId: projectId, versionId }

            const isLoading = ref(false)
            const hasMobilePage = ref(true)
            const platformActive = ref('PC')
            const keyword = ref('')

            let renderList = []
            let pageList = []
            const pageRouteList = ref([])
            const routeGroupMap = ref({})
            const routeGroup = ref([])
            const currentPageId = ref(0)
            const currentPage = ref({})
            const iframeUrl = ref('')

            const platformList = [
                {
                    id: 'PC',
                    name: 'PC',
                    icon: 'bk-drag-icon bk-drag-pc'
                },
                {
                    id: 'MOBILE',
                    name: 'Mobile',
                    icon: 'bk-drag-icon bk-drag-mobilephone'
                }
            ]

            onBeforeMount(async () => {
                await initData()
            })

            async function initData () {
                isLoading.value = true
                const [routeTree, pageRouteArr, projectPageArr] = await Promise.all([
                    store.dispatch('route/getProjectRouteTree', params),
                    store.dispatch('route/query', params),
                    store.dispatch('page/getList', params)
                ])
                isLoading.value = false
                pageRouteList.value = pageRouteArr
                pageList = projectPageArr

                console.log(routeTree, pageList, 'init')
                hasMobilePage.value = pageList.filter(page => page.pageType === 'MOBILE').length > 0

                routeGroup.value = routeTree

                // 过滤platform
                setRenderList()
                // 默认选中第一个页面
                const defaultId = renderList[0]?.pageId || {}
                changeCurrentPage(defaultId)
                console.log(currentPage.value, 23665, renderList)
            }

            function handleSelectPlatform (val) {
                platformActive.value = val
                setRenderList()
            }

            function handleSearch (clear = false) {
                // if (clear) {
                //     keyword.value = ''
                //     renderList.vallue = pageList.value.slice()
                // } else {
                //     renderList.value = pageList.value.filter(item => item.pageName.toLowerCase().indexOf(keyword.value.toLowerCase()) !== -1)
                // }
            }

            function setRenderList () {
                renderList = []
                routeGroupMap.value = {}
                routeGroup.value?.filter(route => route.layoutType === platformActive.value).map(item => {
                    const curChildren = item.children.filter(route => route.pageCode).map(route => {
                        // 没有绑定页面的，不需要展示
                        const pageItem = pageList.find(page => page.id === route.pageId)
                        // delete pageItem.content
                        Object.assign(route, pageItem)
                        renderList.push(route)
                        return route
                    })
                    if (routeGroupMap.value[item.showName]) {
                        routeGroupMap.value[item.showName] = [...routeGroupMap.value[item.showName], ...curChildren]
                    } else {
                        routeGroupMap.value[item.showName] = curChildren || []
                    }
                })
            }

            function changeCurrentPage (id) {
                currentPageId.value = id
                currentPage.value = renderList.find(item => item.pageId === id)
                const url = getIframeUrl()
                iframeUrl.value = url
                console.log(renderList, currentPage.value, iframeUrl.value)
            }

            function getIframeUrl () {
                let url = ''
                const { layoutPath, path } = currentPage.value
                const fullPath = `${layoutPath}${layoutPath?.endsWith('/') ? '' : '/'}${path}`
                if (currentPage.value?.layoutType === 'MOBILE') {
                    const versionQuery = `${versionId ? `&version=${versionId}` : ''}`
                    url = `/preview-mobile/project/${projectId}?pagePath=${fullPath}&pageCode=${currentPage.value?.pageCode}${versionQuery}`
                } else {
                    const versionPath = `${versionId ? `/version/${versionId}` : ''}`
                    url = `/preview/project/${projectId}${versionPath}${fullPath}?pageCode=${currentPage.value?.pageCode}`
                }
                console.log(url, 'url')
                return url
            }

            function handlePreview (page) {
                if (!page.nocodeType && !page.content) {
                    this.$bkMessage({
                        theme: 'error',
                        message: '该页面为空页面，请先编辑页面',
                        limit: 1
                    })
                    return
                }

                const url = getIframeUrl()
                window.open(url, '_blank')
            }

            return {
                NOCODE_TYPE_MAP,
                isLoading,
                hasMobilePage,
                platformActive,
                platformList,
                pageRouteList,
                keyword,
                routeGroup,
                routeGroupMap,
                iframeUrl,
                currentPageId,
                currentPage,
                initData,
                handleSelectPlatform,
                handleSearch,
                handleEditPage,
                handlePreview,
                changeCurrentPage
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/variable";
    @import "@/css/mixins/scroller";

    .page-container {
        height: 100%;
        display: flex;
        .tag-span {
            background: #F5F7FA;
            border-radius: 2px;
            padding: 2px 4px;
            font-size: 12px;
        }
    }
    .left-panel {
        width: 300px;
        height: 100%;
        background: #FFFFFF;
        box-shadow: 1px 0 0 0 $boxBorderColor;
        .menu-container {
            padding: 12px;
            .platform-tab {
                margin-bottom: 12px;
                background: #fff;
            }
            .search-and-create {
                display: flex;
                justify-content: space-between;
            }
        }
        .menu-content {
            height: calc(100% - 152px);
            overflow-y: auto;
            @mixin scroller;
        }
    }
    .right-content {
        width: 100%;
        height: 100%;
        .page-header {
            width: 100%;
            height: 52px;
            padding: 0 24px 0 16px;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .page-info {
                .icon-span {
                    padding: 5px 6px;
                    background: #F5F7FA;
                    border-radius: 2px;
                    i {
                        font-size: 16px;
                    }
                }
                .name-span {
                    margin: 0 6px;
                }
            }
            .page-operate {
                button {
                    width: 88px;
                    margin-right: 8px;
                }
            }
        }
    }
</style>
