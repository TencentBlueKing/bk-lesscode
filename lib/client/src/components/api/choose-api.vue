<template>
    <bk-select
        ref="treeRef"
        searchable
        :tag-fixed-height="false"
        :show-empty="false"
        :clearable="false"
        :scroll-height="300"
        :remote-method="handleSearch"
    >
        <span
            class="display-value"
            slot="trigger"
        >
            {{ getDisplatName() }}
            <i class="bk-select-angle bk-icon icon-angle-down"></i>
        </span>
        <bk-big-tree
            ref="bigTreeRef"
            class="tree-select"
            :selectable="true"
            :data="apiData"
            :default-expanded-nodes="getDefaultExpandedNode()"
            :lazy-method="getRemoteApi"
        >
            <div
                class="display-option"
                slot-scope="{ node, data }"
                @click="chooseApi(data, node)"
            >{{data.name}}</div>
        </bk-big-tree>
    </bk-select>
</template>

<script>
    import {
        defineComponent,
        ref
    } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import { getDataSourceApiList } from 'shared/data-source'

    export default defineComponent({
        props: {
            value: {
                type: Array,
                default: () => ([])
            }
        },

        setup (props, { emit }) {
            const store = useStore()
            const route = useRoute()
            const apiData = ref([
                {
                    id: 'lesscode-api',
                    name: '应用自建 API',
                    type: 'lesscode',
                    children: []
                },
                {
                    id: 'datasource-api',
                    name: '数据表操作 API',
                    type: 'datasource',
                    children: []
                },
                {
                    id: 'apigateway-api',
                    name: '蓝鲸网关 API',
                    type: 'apigateway',
                    isLeaf: false,
                    children: []
                }
            ])
            const treeRef = ref(null)
            const bigTreeRef = ref(null)
            const projectId = route.params.projectId

            // 远程获取数据
            const getRemoteApi = ({ data }) => {
                switch (data.type) {
                    case 'lesscode':
                        return getLesscodeApiCategoryList(data)
                    case 'lesscode-category':
                        return getLesscodeApiList(data)
                    case 'apigateway':
                        return getApigatewayNameList(data)
                    case 'apigateway-name':
                        return getApigatewayStageList(data)
                    case 'apigateway-stage':
                        return getApigatewayList(data)
                    case 'datasource':
                        return getDataTableList(data)
                    case 'datasource-table':
                        return getDataTableApiList(data)
                }
            }

            // 获取 lesscode 分类
            const getLesscodeApiCategoryList = () => {
                return store
                    .dispatch('api/getCategoryList', {
                        projectId
                    })
                    .then((categoryList) => {
                        const data = categoryList.map((category) => {
                            category.type = 'lesscode-category'
                            category.children = []
                            return category
                        })
                        return { data }
                    })
            }

            // 获取 lesscode 接口列表
            const getLesscodeApiList = (item) => {
                return store
                    .dispatch('api/getApiList', {
                        projectId,
                        categoryId: item.id
                    })
                    .then((data) => {
                        return {
                            data,
                            leaf: data.map(api => api.id)
                        }
                    })
            }

            // 获取 apigateway 网关列表
            const getApigatewayNameList = (item, resolve) => {
                return store
                    .dispatch('api/getApiGateWayNameList')
                    .then((apiNameList) => {
                        const data = apiNameList.map((apiName) => {
                            apiName.type = 'apigateway-name'
                            apiName.children = []
                            return apiName
                        })
                        return { data }
                    })
            }

            // 获取 apigateway 环境列表
            const getApigatewayStageList = (item) => {
                return store
                    .dispatch('api/getApiGateWayStagList', {
                        apiName: item.name
                    })
                    .then((stagList) => {
                        stagList.forEach((stag) => {
                            stag.apiName = item.name
                            stag.parentId = item.id
                            stag.type = 'apigateway-stage'
                        })
                        return {
                            data: stagList
                        }
                    })
            }

            // 获取 apigateway 接口列表
            const getApigatewayList = (item) => {
                return store
                    .dispatch('api/getApiGateWayApiList', {
                        apiName: item.apiName,
                        stageName: item.name
                    })
                    .then(({ results: apiList }) => {
                        apiList.forEach((stag) => {
                            stag.summary = stag.description
                        })
                        return {
                            data: apiList,
                            leaf: apiList.map(api => api.id)
                        }
                    })
            }

            // 获取表列表
            const getDataTableList = () => {
                return store
                    .dispatch('dataSource/list', {
                        projectId
                    })
                    .then(({ list: tableList }) => {
                        tableList.forEach((table) => {
                            table.type = 'datasource-table'
                            table.children = []
                            table.name = table.tableName
                        })
                        return {
                            data: tableList
                        }
                    })
            }

            // 获取表接口
            const getDataTableApiList = (item) => {
                const apiList = getDataSourceApiList(item.name, item.columns)
                return {
                    data: apiList,
                    leaf: apiList.map(api => api.id)
                }
            }

            // 触发值更新
            const chooseApi = (data, node) => {
                if (!node.isLeaf) return
                const path = []
                let cur = node
                do {
                    const { data } = cur
                    path.push({
                        id: data.id,
                        name: data.name
                    })
                    cur = cur.parent
                } while (cur)
                emit('change', {
                    path: path.reverse(),
                    method: data.method.toLowerCase(),
                    url: data.url,
                    query: data.query || [],
                    body: data.body || {},
                    response: data.response || {},
                    summary: data.summary
                })
                treeRef
                    .value
                    .getPopoverInstance()
                    .hide()
            }

            // 计算展示名
            const getDisplatName = () => {
                return props
                    .value
                    .map((item) => {
                        return item.name
                    })
                    .reduce((acc, cur, index) => {
                        const divider = index === 0 ? '' : index === 1 ? '：' : ' / '
                        acc += divider + cur
                        return acc
                    }, '')
            }

            // 获取默认展开的节点
            const getDefaultExpandedNode = () => {
                return ['lesscode-api', 'apigateway-api', 'datasource-api']
            }

            // 远程搜索
            const handleSearch = (keyword) => {
                bigTreeRef.value.filter(keyword)
            }

            return {
                apiData,
                treeRef,
                bigTreeRef,
                getRemoteApi,
                chooseApi,
                getDisplatName,
                getDefaultExpandedNode,
                handleSearch
            }
        }
    })
</script>

<style lang="postcss">
    .display-value {
        display: inline-block;
        line-height: 32px;
        padding: 0 36px 0 10px;
    }
    .display-option {
        font-size: 12px;
    }
</style>
