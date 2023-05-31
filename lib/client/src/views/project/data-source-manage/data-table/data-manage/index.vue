<template>
    <article v-bkloading="{ isLoading: pageStatus.isLoading }">
        <render-header>
            <span class="table-header">
                <i class="bk-drag-icon bk-drag-arrow-back" @click="goBack"></i>
                {{ $t('数据管理') }} </span>
        </render-header>
        <div class="g-page-tab">
            <div
                v-for="environment in environmentList"
                :key="environment.key"
                :class="{ active: pageStatus.activeEnvironment.key === environment.key, 'tab-item': true }"
                @click="setEnvironment(environment)"
            >{{ environment.name }}</div>
        </div>

        <template v-if="!pageStatus.isLoading">
            <template v-if="!pageStatus.errorCode">
                <bk-alert type="info" v-if="isShowUpdateInfo">
                    <span slot="title" class="table-data-info">
                        {{ $t('预览环境数据表结构有更新，需') }} <bk-button text @click="goDeploy">{{ $t('部署') }}</bk-button>
                        {{ $t('后生效') }} </span>
                </bk-alert>

                <layout class="data-manage-main">
                    <aside class="table-list" slot="left">
                        <bk-input
                            clearable
                            class="filter-table-name"
                            :placeholder="$t('请输入表名')"
                            right-icon="bk-icon icon-search"
                            v-model="pageStatus.tableName"
                        ></bk-input>

                        <ul class="table-item-list" v-if="displayTableList.length">
                            <li
                                @click="setActiveTable(item)"
                                v-for="item in displayTableList"
                                :key="item.tableName"
                                :class="{
                                    active: item.tableName === pageStatus.activeTable.tableName,
                                    'table-item': true
                                }"
                            >
                                <span class="table-item-name" v-tooltips="item.tableName">
                                    <i class="bk-drag-icon bk-drag-data-table"></i>
                                    <span>{{ item.tableName }}</span>
                                </span>
                            </li>
                        </ul>
                        <empty-status v-else :type="emptyType" @clearSearch="handlerClearSearch" :part="false"></empty-status>
                    </aside>
                    <section class="data-main">
                        <bk-tab :active.sync="pageStatus.currentTab">
                            <bk-tab-panel
                                v-for="panel in panels"
                                v-bind="panel"
                                :key="panel.name">
                            </bk-tab-panel>
                        </bk-tab>
                        <component
                            class="data-component"
                            :is="pageStatus.currentTab"
                            :environment="pageStatus.activeEnvironment"
                            :active-table="pageStatus.activeTable"
                        ></component>
                    </section>
                </layout>
            </template>
            <bk-exception class="exception-wrap-item exception-part" type="empty" scene="part" v-else>
                <div v-if="pageStatus.errorCode === 'CANNOT_READ_INSTANCE_INFO'">
                    {{ $t('绑定应用的{0}，未开启 GCS-MySql增强服务，无法进行数据管理，请尝试', [pageStatus.activeEnvironment.name]) }} <bk-button text @click="goDeploy">{{ $t('重新部署') }}</bk-button>
                    {{ $t('后再试') }} </div>
                <div v-else-if="pageStatus.errorCode === 'NOT_BIND_APPLICATION'">
                    {{ $t('本应用暂未绑定蓝鲸应用，请绑定蓝鲸应用并') }} <bk-button text @click="goDeploy">{{ $t('部署') }}</bk-button>
                    {{ $t('后再试') }} </div>
                <div v-else-if="!pageStatus.tableList.length">
                    {{ pageStatus.activeEnvironment.name }}{{$t('未查询到表，无法进行数据管理，请')}}
                    <bk-button text @click="goDeploy">{{ $t('重新部署') }}</bk-button>
                    {{ $t('后再试') }} </div>
            </bk-exception>
        </template>
    </article>
</template>

<script lang="ts">
    import {
        defineComponent,
        reactive,
        computed,
        watch,
        onBeforeMount
    } from '@vue/composition-api'
    import {
        messageError
    } from '@/common/bkmagic'
    import router from '@/router'
    import store from '@/store'
    import renderHeader from '../common/header'
    import renderData from './render-data.vue'
    import renderStruct from './render-struct.vue'
    import renderApi from './render-api.vue'
    import layout from '@/components/ui/layout.vue'

    const environmentList = [
        { key: 'preview', name: window.i18n.t('预览环境') },
        { key: 'stag', name: window.i18n.t('预发布环境') },
        { key: 'prod', name: window.i18n.t('正式环境') }
    ]

    const panels = [
        { name: 'render-data', label: window.i18n.t('数据'), count: 10 },
        { name: 'render-struct', label: window.i18n.t('表结构'), count: 20 },
        { name: 'render-api', label: 'API', count: 30 }
    ]

    export default defineComponent({
        components: {
            renderHeader,
            renderData,
            renderStruct,
            renderApi,
            layout
        },

        setup () {
            const projectId = router?.currentRoute?.params?.projectId
            const tableName = router?.currentRoute?.query?.tableName
            const pageStatus = reactive({
                activeEnvironment: { key: 'preview', name: window.i18n.t('预览环境') },
                isLoading: false,
                tableName: '',
                activeTable: {
                    tableName: '',
                    comment: '',
                    columns: []
                },
                tableList: [],
                errorCode: '',
                currentTab: 'render-data'
            })
            const releaseInfo = reactive({
                isProdNeedUpdate: false,
                isStagNeedUpdate: false
            })

            const goBack = () => {
                router.push({ name: 'tableList' })
            }

            const goDeploy = () => {
                router.push({ name: 'release' })
            }

            const setEnvironment = (val) => {
                pageStatus.activeEnvironment = val
            }

            const setActiveTable = (item = pageStatus.tableList[0]) => {
                pageStatus.activeTable = item
            }

            const getTableList = () => {
                pageStatus.errorCode = ''
                pageStatus.isLoading = true
                const queryData = {
                    environment: pageStatus.activeEnvironment?.key,
                    projectId
                }
                store.dispatch('dataSource/getOnlineTableList', queryData).then((data) => {
                    pageStatus.tableList = data || []
                    const activeTable = data.find(x => x.tableName === tableName)
                    setActiveTable(activeTable)
                }).catch((error) => {
                    // 清除数据
                    pageStatus.tableList = []
                    setActiveTable()
                    const code = error?.response?.data?.code
                    switch (code) {
                        case 'CANNOT_READ_INSTANCE_INFO':
                        case 'NOT_BIND_APPLICATION':
                            pageStatus.errorCode = code
                            break
                        default:
                            messageError(error.message || error)
                            break
                    }
                }).finally(() => {
                    if (!pageStatus.errorCode) {
                        pageStatus.errorCode = pageStatus.tableList.length <= 0 ? 'NO_DATA' : ''
                    }
                    pageStatus.isLoading = false
                })
            }

            const getReleaseInfo = () => {
                const params = {
                    projectId,
                    pageSize: 1,
                    page: 1
                }
                Promise.all([
                    store.dispatch('release/detailInfo', { projectId }),
                    store.dispatch('dataSource/list', params)
                ]).then(([releaseApiData, tableApiData]) => {
                    const prodCreateTime = new Date(releaseApiData?.prodInfo?.createTime)
                    const stagCreateTime = new Date(releaseApiData?.stagInfo?.createTime)
                    const latestTable = tableApiData.list[0] || {}
                    releaseInfo.isProdNeedUpdate = new Date(latestTable.updateTime) > prodCreateTime
                    releaseInfo.isStagNeedUpdate = new Date(latestTable.updateTime) > stagCreateTime
                }).catch((error) => {
                    messageError(error.message || error)
                })
            }

            const handlerClearSearch = () => {
                pageStatus.tableName = ''
            }

            const displayTableList = computed(() => {
                return pageStatus.tableList.filter((table) => {
                    return table.tableName.includes(pageStatus.tableName)
                })
            })

            const isShowUpdateInfo = computed(() => {
                const updateMap = {
                    stag: releaseInfo.isStagNeedUpdate,
                    prod: releaseInfo.isProdNeedUpdate
                }
                return updateMap[pageStatus.activeEnvironment.key]
            })

            const emptyType = computed(() => {
                if (pageStatus.tableName) {
                    return 'search'
                }
                return 'noData'
            })

            watch(
                () => pageStatus.activeEnvironment.key,
                getTableList
            )

            onBeforeMount(() => {
                getReleaseInfo()
                getTableList()
            })

            return {
                environmentList,
                panels,
                pageStatus,
                displayTableList,
                isShowUpdateInfo,
                emptyType,
                goBack,
                goDeploy,
                setEnvironment,
                setActiveTable,
                handlerClearSearch
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    @import "@/css/mixins/ellipsis";

    .table-header {
        display: flex;
        align-items: center;
        .bk-drag-arrow-back {
            color: #3a84ff;
            padding: 10px;
            cursor: pointer;
            font-size: 14px;
        }
    }
    .data-manage-main {
        height: calc(100vh - 160px);
        z-index: auto;
        .table-list {
            padding: 14px 0;
            background: #fafbfd;
            height: 100%;
            overflow-y: auto;
            @mixin scroller;
            .filter-table-name {
                padding: 0 15px;
                ::v-deep .right-icon {
                    right: 25px !important;
                }
            }
            .table-item-list {
                margin-top: 9px;
            }
            .table-item {
                padding: 0 15px;
                height: 40px;
                line-height: 19px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 14px;
                cursor: pointer;
                &.active {
                    background: #e1ecff;
                    color: #3a84ff;
                    .table-item-num {
                        background: #a3c5fd;
                        color: #ffffff;
                    }
                }
            }
            .table-item-name {
                @mixin ellipsis 330px;
                line-height: 19px;
                flex: 1;
                .bk-drag-data-table {
                    margin-right: 4px;
                    font-size: 16px;
                }
            }
            .table-item-num {
                height: 20px;
                padding: 0 7px;
                background: #f0f1f5;
                font-size: 12px;
                color: #979ba5;
                border-radius: 2px;
            }
        }
        .data-main {
            height: 100%;
            .data-component {
                padding: 20px;
                height: calc(100% - 50px);
                overflow-y: auto;
            }
            ::v-deep .bk-tab-section {
                padding: 0;
                border: none;
            }
        }
    }
    .exception-wrap-item {
        position: absolute;
        top: 40%;
        transform: translateY(-50%);
    }
</style>
