<template>
    <section v-bkloading="{ isLoading: isLoading }" class="page-container">
        <div class="left-panel">
            <menu-header :has-mobile-page="hasMobilePage"></menu-header>
            <div class="menu-container">
                <div class="platform" v-if="hasMobilePage">
                    <div class="platform-tab">
                        <select-tab :tab-list="platformList" :active-item="platformActive" :item-change="handleSelectPlatform" active-color="#3a84ff" />
                    </div>
                </div>
                <div class="search-and-create">
                    <search-box
                        style="width: 100%;margin-right: 6px;"
                        :placeholder="$t('form_页面名称')"
                        input-cls=""
                        :list="renderList"
                        :reset-keyword-on-change-list="false"
                        @on-change="handleSearch" />
                    <create-page-entry :framework="projectDetail.framework"/>
                </div>
            </div>
            <div class="menu-content">
                <template v-if="Object.keys(routeGroupMap).length < 1">
                    <bk-exception
                        class="group-list-empty"
                        type="empty"
                        scene="part">
                        <span>{{ $t('暂无数据') }}</span>
                    </bk-exception>
                </template>
                <template v-else v-for="(pageList, groupName) in routeGroupMap">
                    <group-box
                        v-if="pageList.length > 0"
                        :key="groupName"
                        :list="pageList"
                        :group-name="groupName">
                        <template v-for="page in pageList">
                            <page-menu-item
                                :key="page.pageId"
                                :page="page"
                                :current-page-id="currentPageId"
                                :render-list="renderList"
                                :change-current-page="changeCurrentPage"
                                @toggleDialog="toggleDialog"
                                @getPageList="initData" />
                        </template>
                    </group-box>
                </template>
            </div>
        </div>
        <div class="right-content">
            <template v-if="currentPageId > 0">
                <page-header :current-page="currentPage" />
                <div class="preview-page-content">
                    <iframe
                        v-if="currentPage && (currentPage.content || currentPage.nocodeType)"
                        width="100%"
                        height="100%"
                        style="border: none"
                        :src="iframeUrl"
                    >
                    </iframe>
                    <bk-exception v-else class="exception-wrap-item" type="empty">
                        <span>{{ $t('暂无页面内容') }}</span>
                        <div class="exception-desc">
                            <span class="text">{{ $t('你可以通过编辑页面生成内容，') }}</span>
                            <span class="link-btn" @click="handleEditPage(currentPage)">{{ $t('立即编辑') }}</span>
                        </div>
                    </bk-exception>
                </div>
            </template>
            <bk-exception v-else class="exception-wrap-item" type="empty">
                <span>{{ $t('暂无页面，请新建页面') }}</span>
            </bk-exception>
        </div>
        <page-operate-dialog
            :show-dialog="showDialog"
            :dialog-payload="dialogPayload"
            :page-route-list="pageRouteList"
            :route-group="routeGroup"
            @toggleDialog="toggleDialog"
            @getPageList="initData"
        />
    </section>
</template>

<script>
    import PageOperateDialog from './children/page-operate-dialog'
    import MenuHeader from './children/menu-header'
    import CreatePageEntry from './children/create-page-entry'
    import PageMenuItem from './children/page-menu-item'
    import PageHeader from './children/page-content-header'
    import SelectTab from '@/components/ui/select-tab'
    import GroupBox from '@/components/ui/group'
    import SearchBox from '@/views/index/components/material-panel/components/common/search-box'
    import { defineComponent, ref, onBeforeMount } from '@vue/composition-api'
    import usePageOperation from './children/use-page-operation'
    import store from '@/store'
    import router from '@/router'

    export default defineComponent({
        components: {
            GroupBox,
            SearchBox,
            MenuHeader,
            CreatePageEntry,
            PageMenuItem,
            SelectTab,
            PageHeader,
            PageOperateDialog
        },
        setup () {
            const { handleEditPage, handlePreview, getPreviewUrl } = usePageOperation()

            const projectId = router?.currentRoute?.params?.projectId
            const versionId = store.getters['projectVersion/currentVersionId']
            const projectDetail = store.getters['project/projectDetail']
            const params = { projectId: projectId, versionId }

            const isLoading = ref(false)
            const hasMobilePage = ref(true)
            const platformActive = ref('PC')
            const keyword = ref('')

            const showDialog = ref(false)
            const dialogPayload = ref({})

            let pageList = []
            const renderList = ref([])
            
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

            // 页面初始跟页面删除后回掉
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

                hasMobilePage.value = pageList.filter(page => page.pageType === 'MOBILE').length > 0
                const hasPcPage = pageList.filter(page => page.pageType !== 'MOBILE').length > 0
                // 如果移动端页面不存在页面，选中pc
                if (!hasMobilePage.value) {
                    platformActive.value = 'PC'
                }
                // 如果含有移动端页面，不含pc页面，选中mobile
                if (hasMobilePage && !hasPcPage) {
                    platformActive.value = 'MOBILE'
                }
                routeGroup.value = routeTree

                // 过滤platform
                setRenderList()
                // 默认选中第一个页面
                const defaultId = renderList.value[0]?.pageId || 0
                if (defaultId) {
                    changeCurrentPage(defaultId)
                } else {
                    currentPageId.value = 0
                    currentPage.value = {}
                }
            }

            function handleSelectPlatform (val) {
                platformActive.value = val
                setRenderList()
            }

            function handleSearch (data) {
                keyword.value = data?.name || ''
                setRenderList()
            }

            function setRenderList () {
                renderList.value = []
                routeGroupMap.value = {}
                routeGroup.value?.filter(route => route.layoutType === platformActive.value).map(item => {
                    const curChildren = item.children.filter(route => route.pageCode).map(route => {
                        // 没有绑定页面的，不展示
                        const pageItem = pageList.find(page => page.id === route.pageId)
                        // delete pageItem.content
                        Object.assign(route, pageItem, { name: pageItem.pageName })
                        renderList.value.push(route)
                        return route
                    })
                    // 处于搜索状态
                    if (keyword.value) {
                        const searchItem = curChildren.find(item => item.pageName === keyword.value)
                        if (searchItem?.pageName) {
                            routeGroupMap.value[item.showName] = [searchItem]
                        }
                    // 搜索框为空
                    } else {
                        if (routeGroupMap.value[item.showName]) {
                            routeGroupMap.value[item.showName] = [...routeGroupMap.value[item.showName], ...curChildren]
                        } else {
                            routeGroupMap.value[item.showName] = curChildren || []
                        }
                    }
                })
                console.log(renderList.value, 'renderlist')
            }

            function changeCurrentPage (id) {
                currentPageId.value = id
                currentPage.value = renderList.value.find(item => item.pageId === id)
                const url = getPreviewUrl(currentPage.value)
                iframeUrl.value = url
            }

            function toggleDialog (isShow, payload = {}) {
                showDialog.value = isShow
                dialogPayload.value = payload
            }

            return {
                isLoading,
                projectDetail,
                hasMobilePage,
                platformActive,
                platformList,
                pageRouteList,
                keyword,
                renderList,
                routeGroup,
                routeGroupMap,
                iframeUrl,
                currentPageId,
                currentPage,
                showDialog,
                dialogPayload,
                toggleDialog,
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
    }
    .left-panel {
        width: 300px;
        height: 100%;
        background: #FFFFFF;
        /* box-shadow: 1px 0 0 0 $boxBorderColor; */
        border-right: 1px solid $boxBorderColor;
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

        .preview-page-content {
            padding: 16px 24px;
            display: flex;
            height: calc(100% - 50px);
        }

        .exception-wrap-item {
            margin-top: 80px;
            .exception-desc {
                display: flex;
                align-items: center;
                margin-top: 16px;
                font-size: 14px;
                .text {
                    color: #979BA5;
                }
                .link-btn {
                    cursor: pointer;
                    color: $primaryColor;
                }
            }
        }
    }
</style>
