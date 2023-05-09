<template>
    <div class="operation-list">
        <div class="filter">
            <bk-date-picker class="filter-item"
                v-model="filters.dateRange"
                type="daterange"
                :placeholder="$t('创建时间')"
                @change="handleTimeChange"
                :shortcuts="dateShortcuts[0]">
            </bk-date-picker>
            <bk-input
                class="filter-item search-input"
                clearable
                :placeholder="$t('按名称/ID搜索')"
                right-icon="bk-icon icon-search"
                @clear="handleKeywordClear"
                @enter="handleKeywordEnter"
                v-model="filters.keyword">
            </bk-input>
            <export-button name="comp" :list="list" :fields="exportFields" :remote-list="getAllData" />
        </div>
        <div class="data-list" v-bkloading="{ isLoading: fetching.base }">
            <bk-table
                class="g-hairless-table"
                v-show="!fetching.base"
                :data="list"
                :pagination="pagination"
                :outer-border="false"
                :header-border="false"
                :header-cell-style="{ background: '#f0f1f5' }"
                @page-change="handlePageChange"
                @page-limit-change="handlePageLimitChange">
                <bk-table-column
                    v-for="column in columns"
                    :key="column.id"
                    :label="column.name"
                    :prop="column.id"
                    :width="column.width"
                    :sortable="column.sortable"
                    :show-overflow-tooltip="column.tooltip">
                    <template slot-scope="{ row }">
                        <loading v-if="column.dynamic" :loading="fetching[column.id]">
                            <span v-if="column.type === 'number'">{{row[column.id] | formatCount}}</span>
                            <span v-else>{{row[column.id]}}</span>
                        </loading>
                        <template v-else>{{row[column.id]}}</template>
                    </template>
                </bk-table-column>
                <empty-status slot="empty" :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
            </bk-table>
        </div>
    </div>
</template>

<script>
    import http from '@/api'
    import Loading from '@/components/ui/loading.vue'
    import ExportButton from '../export-button.vue'
    import sharedMixin from '../shared-mixin.js'
    import tableListMixin from '../table-list-mixin.js'

    export default {
        components: {
            Loading,
            ExportButton
        },
        mixins: [sharedMixin, tableListMixin],
        data () {
            return {
                list: [],
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 10
                },
                columns: [
                    { id: 'fullName', name: window.i18n.t('table_自定义组件名'), width: '360', tooltip: true },
                    { id: 'type', name: window.i18n.t('table_自定义组件ID'), width: '300', tooltip: true },
                    { id: 'projectUsedCount', name: window.i18n.t('table_使用应用数'), dynamic: true, type: 'number' },
                    { id: 'pageUsedCount', name: window.i18n.t('table_使用页面数'), dynamic: true, type: 'number' },
                    { id: 'versionCount', name: window.i18n.t('table_版本数'), dynamic: true, type: 'number' }
                ],
                filters: {
                    keyword: '',
                    dateRange: []
                },
                fetching: {
                    base: false
                },
                emptyType: 'noData'
            }
        },
        computed: {
            params () {
                const params = {
                    q: this.filters.keyword,
                    time: this.timeParam, // mixin
                    pageSize: this.pagination.limit,
                    pageNum: this.pagination.current
                }
                return params
            }
        },
        created () {
            this.setFetching()
            this.fetchData()
        },
        methods: {
            fetchData () {
                this.getCompBase()
            },
            async getCompBase () {
                this.fetching.base = true
                const dateRanges = this.filters.dateRange?.filter(item => item)
                if (this.filters.keyword || dateRanges?.length) {
                    this.emptyType = 'search'
                } else {
                    this.emptyType = 'noData'
                }
                try {
                    const { data: [list, total] } = await http.post('/operation/stats/comp/base', this.params)
                    this.list = list.map((item) => ({
                        ...item,
                        fullName: `${item.displayName}(${item.name})`,
                        ...this.getDynamicValues()
                    }))
                    this.pagination.count = total

                    if (this.list && this.list.length) {
                        this.getMoreData()
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    this.fetching.base = false
                }
            },
            getMoreData () {
                this.getCompProjectUsedCount()
                this.getCompPageUsedCount()
                this.getCompVersionCount()
            },
            async getCompProjectUsedCount () {
                const compIds = this.list.map(item => item.id)
                this.fetching.projectUsedCount = true
                try {
                    const { data: countList } = await http.post('/operation/stats/comp/projectUsedCount', { compIds })
                    countList.forEach((item) => {
                        const updateItem = this.list.find(comp => comp.id === item.compId)
                        updateItem.projectUsedCount = Number(item.count)
                    })
                } catch (e) {
                    console.error(e)
                } finally {
                    this.fetching.projectUsedCount = false
                }
            },
            async getCompPageUsedCount () {
                const compIds = this.list.map(item => item.id)
                this.fetching.pageUsedCount = true
                try {
                    const { data: countList } = await http.post('/operation/stats/comp/pageUsedCount', { compIds })
                    countList.forEach((item) => {
                        const updateItem = this.list.find(comp => comp.id === item.compId)
                        updateItem.pageUsedCount = Number(item.count)
                    })
                } catch (e) {
                    console.error(e)
                } finally {
                    this.fetching.pageUsedCount = false
                }
            },
            async getCompVersionCount () {
                const compIds = this.list.map(item => item.id)
                this.fetching.versionCount = true
                try {
                    const { data: countList } = await http.post('/operation/stats/comp/versionCount', { compIds })
                    countList.forEach((item) => {
                        const updateItem = this.list.find(comp => comp.id === item.componentId)
                        updateItem.versionCount = Number(item.count)
                    })
                } catch (e) {
                    console.error(e)
                } finally {
                    this.fetching.versionCount = false
                }
            },
            async getAllData () {
                const total = this.pagination.count
                let index = 1

                if (this.list.length === total) {
                    return this.list
                }

                const pageSize = 500

                // 分页方法
                const page = index => ({ pageNum: index, pageSize })

                // 请求列表的req
                const req = index => http.post('/operation/stats/comp/base', {
                    ...this.params,
                    ...page(index)
                })

                // 列表一共要拉取多少次
                const max = Math.ceil(total / pageSize)

                // 循环组装得到所有的req
                const baseReqs = []
                const projectUsedCountReqs = []
                const pageUsedCountReqs = []
                const versionCountReqs = []
                while (index <= max) {
                    baseReqs.push(req(index))
                    index += 1
                }

                const baseAll = await Promise.all(baseReqs)
                const results = []

                baseAll.forEach(({ data: [list] }) => {
                    const newList = list.map((item) => ({
                        ...item,
                        fullName: `${item.displayName}(${item.name})`,
                        ...this.getDynamicValues()
                    }))
                    results.push(...newList)

                    const compIds = newList.map(item => item.id)
                    projectUsedCountReqs.push(http.post('/operation/stats/comp/projectUsedCount', { compIds }))
                    pageUsedCountReqs.push(http.post('/operation/stats/comp/pageUsedCount', { compIds }))
                    versionCountReqs.push(http.post('/operation/stats/comp/versionCount', { compIds }))
                })

                const projectUsedCountAll = await Promise.all(projectUsedCountReqs)
                const pageUsedCountAll = await Promise.all(pageUsedCountReqs)
                const versionCountAll = await Promise.all(versionCountReqs)

                projectUsedCountAll.forEach(({ data: countList }) => {
                    countList.forEach((item) => {
                        const updateItem = results.find(comp => comp.id === item.compId)
                        updateItem.projectUsedCount = Number(item.count)
                    })
                })

                pageUsedCountAll.forEach(({ data: countList }) => {
                    countList.forEach((item) => {
                        const updateItem = results.find(comp => comp.id === item.compId)
                        updateItem.pageUsedCount = Number(item.count)
                    })
                })

                versionCountAll.forEach(({ data: countList }) => {
                    countList.forEach((item) => {
                        const updateItem = results.find(comp => comp.id === item.componentId)
                        updateItem.versionCount = Number(item.count)
                    })
                })

                return results
            },
            handlerClearSearch () {
                this.filters.dateRange = []
                this.filters.keyword = ''
                this.handleKeywordClear()
            }
        }
    }
</script>
