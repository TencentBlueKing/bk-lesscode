<template>
    <bk-cascade
        ext-popover-cls="api-cascade"
        :value="value"
        :list="apiData"
        :is-remote="true"
        :remote-method="getRemoteApi"
        @change="chooseApi"
    >
    </bk-cascade>
</template>

<script>
    import Vue from 'vue'
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

        setup (_, { emit }) {
            const store = useStore()
            const route = useRoute()
            const apiData = ref([
                {
                    id: 'lesscode-api',
                    name: 'Lesscode Api',
                    type: 'lesscode',
                    children: []
                },
                {
                    id: 'apigateway-api',
                    name: 'ApiGateWay Api',
                    type: 'apigateway',
                    children: []
                },
                {
                    id: 'datasource-api',
                    name: 'Data Manage Api',
                    type: 'datasource',
                    children: []
                }
            ])
            const projectId = route.params.projectId

            const getRemoteApi = (item, resolve) => {
                switch (item.type) {
                    case 'lesscode':
                        getLesscodeApiCategoryList(item, resolve)
                        break
                    case 'lesscode-category':
                        getLesscodeApiList(item, resolve)
                        break
                    case 'apigateway':
                        getApigatewayNameList(item, resolve)
                        break
                    case 'apigateway-name':
                        getApigatewayStageList(item, resolve)
                        break
                    case 'apigateway-stage':
                        getApigatewayList(item, resolve)
                        break
                    case 'datasource':
                        getDataTableList(item, resolve)
                        break
                    case 'datasource-table':
                        getDataTableApiList(item, resolve)
                        break
                    default:
                        resolve(item)
                        break
                }
            }

            // 获取 lesscode 分类
            const getLesscodeApiCategoryList = (item, resolve) => {
                Vue.set(item, 'isLoading', true)
                store
                    .dispatch('api/getCategoryList', {
                        projectId
                    })
                    .then((categoryList) => {
                        const children = categoryList.map((category) => {
                            category.type = 'lesscode-category'
                            category.children = []
                            return category
                        })
                        Vue.set(item, 'children', children)
                        apiData.value[0].children = children
                        resolve(item)
                    })
            }

            // 获取 lesscode 接口列表
            const getLesscodeApiList = (item, resolve) => {
                Vue.set(item, 'isLoading', true)
                store
                    .dispatch('api/getApiList', {
                        projectId,
                        categoryId: item.id
                    })
                    .then((apiList) => {
                        const apiCategory = apiData.value[0].children.find((category) => category.id === item.id)
                        const children = apiList <= 0 ? [{ disabled: true, name: '无数据' }] : apiList
                        children.forEach((stag) => {
                            stag.isLoading = false
                        })
                        Vue.set(item, 'children', apiList)
                        apiCategory.children = apiList
                        resolve(item)
                    })
            }

            // 获取 apigateway 网关列表
            const getApigatewayNameList = (item, resolve) => {
                Vue.set(item, 'isLoading', true)
                store
                    .dispatch('api/getApiGateWayNameList')
                    .then((apiNameList) => {
                        const children = apiNameList.map((apiName) => {
                            apiName.type = 'apigateway-name'
                            apiName.children = []
                            return apiName
                        })
                        Vue.set(item, 'children', children)
                        apiData.value[1].children = children
                        resolve(item)
                    })
            }

            // 获取 apigateway 环境列表
            const getApigatewayStageList = (item, resolve) => {
                Vue.set(item, 'isLoading', true)
                store
                    .dispatch('api/getApiGateWayStagList', {
                        apiName: item.name
                    })
                    .then((stagList) => {
                        const apigateWayName = apiData.value[1].children.find((apiName) => apiName.id === item.id)
                        const children = stagList <= 0 ? [{ disabled: true, name: '无数据' }] : stagList
                        children.forEach((stag) => {
                            stag.apiName = item.name
                            stag.parentId = item.id
                            stag.type = 'apigateway-stage'
                        })
                        item.children = children
                        apigateWayName.children = children
                        resolve(item)
                    })
            }

            // 获取 apigateway 接口列表
            const getApigatewayList = (item, resolve) => {
                Vue.set(item, 'isLoading', true)
                store
                    .dispatch('api/getApiGateWayApiList', {
                        apiName: item.apiName,
                        stageName: item.name
                    })
                    .then(({ results: apiList }) => {
                        const apigateWayName = apiData.value[1].children.find((apiName) => apiName.id === item.parentId)
                        const apiStage = apigateWayName.children.find((apiStage) => apiStage.id === item.id)
                        const children = apiList <= 0 ? [{ disabled: true, name: '无数据' }] : apiList
                        children.forEach((stag) => {
                            stag.isLoading = false
                            stag.summary = stag.description
                        })
                        item.children = children
                        apiStage.children = children
                        resolve(item)
                    })
            }

            // 获取表列表
            const getDataTableList = (item, resolve) => {
                Vue.set(item, 'isLoading', true)
                store
                    .dispatch('dataSource/list', {
                        projectId
                    })
                    .then(({ list: tableList }) => {
                        const children = tableList <= 0 ? [{ disabled: true, name: '无数据' }] : tableList
                        children.forEach((table) => {
                            table.type = 'datasource-table'
                            table.children = []
                            table.name = table.tableName
                        })
                        Vue.set(item, 'children', children)
                        apiData.value[2].children = children
                        resolve(item)
                    })
            }

            // 获取表接口
            const getDataTableApiList = (item, resolve) => {
                Vue.set(item, 'isLoading', true)
                const dataTable = apiData.value[2].children.find(dataTable => dataTable.id === item.id)
                const apiList = getDataSourceApiList(item.name, item.columns)
                apiList.forEach((api) => {
                    api.isLoading = false
                })
                item.children = apiList
                dataTable.children = apiList
                resolve(item)
            }

            // 触发值更新
            const chooseApi = (path, _, selectList) => {
                const api = selectList.at(-1)
                emit('change', {
                    path,
                    method: api.method.toLowerCase(),
                    url: api.url,
                    query: api.query || [],
                    body: api.body || {},
                    response: api.response || {},
                    summary: api.summary
                })
            }

            return {
                apiData,
                getRemoteApi,
                chooseApi
            }
        }
    })
</script>

<style lang="postcss">
    .api-cascade {
        width: auto !important;
        .bk-option-name {
            max-width: 100%;
            display: inline-block;
        }
    }
</style>
