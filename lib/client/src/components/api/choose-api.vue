<template>
    <bk-select
        ref="treeRef"
        searchable
        :tag-fixed-height="false"
        :show-empty="false"
        :clearable="false"
        :scroll-height="300"
        :remote-method="handleSearch"
        @toggle="handleToggle"
    >
        <span
            class="display-value"
            slot="trigger"
        >
            {{ getDisplayName() }}
            <i class="bk-select-angle bk-icon icon-angle-down"></i>
        </span>
        <bk-big-tree
            ref="bigTreeRef"
            class="tree-select"
            :key="bigTreeKey"
            :selectable="true"
            :data="apiData"
            :default-expanded-nodes="getDefaultExpandedNode()"
            :lazy-method="getRemoteApi"
        >
            <div
                slot-scope="{ node, data }"
                :class="{
                    'display-option': true,
                    'disabled': data.disabled
                }"
                @click="chooseApi(data, node)"
            >
                {{data.name}}
                <i
                    class="bk-drag-icon bk-drag-jump-link"
                    v-if="['lesscode-api', 'datasource-api'].includes(data.id)"
                    @click="goToCreate(data.id)"
                ></i>
            </div>
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
    import { isEmpty, uuid } from 'shared/util'

    export default defineComponent({
        props: {
            value: {
                type: Array,
                default: () => ([])
            },
            // 用来设置指定的api类型隐藏
            excluded: {
                type: Array,
                default: () => ([])
            }
        },

        setup (props, { emit }) {
            // 可使用的api类型
            const getApiClassify = (projectId) => {
                const defaultClassify = [
                    {
                        id: 'apigateway-api',
                        name: '蓝鲸网关 API',
                        type: 'apigateway',
                        isLeaf: false,
                        children: []
                    }
                ]
                if (!isEmpty(projectId)) {
                    defaultClassify.unshift(
                        ...[
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
                            }
                        ]
                    )
                }
                if (Array.isArray(props.excluded) && props.excluded.length) {
                    return defaultClassify.filter(item => !props.excluded.includes(item.id))
                }
                return defaultClassify
            }
            const store = useStore()
            const route = useRoute()
            const projectId = route.params.projectId
            const apiData = ref(getApiClassify(projectId))
            const treeRef = ref(null)
            const bigTreeRef = ref(null)
            const bigTreeKey = ref(1)
            // 空数据则返回空节点
            const getNodeValue = (data, isLeaf) => {
                const node = {
                    data
                }
                if (isEmpty(data)) {
                    node.data = [{
                        name: '暂无数据',
                        disabled: true
                    }]
                }
                node.data.forEach((item) => {
                    item.originId = item.id
                    item.id = uuid()
                })
                if (isLeaf || isEmpty(data)) {
                    node.leaf = node.data.map(x => x.id)
                }
                return node
            }

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
                        return getNodeValue(data)
                    })
            }

            // 获取 lesscode 接口列表
            const getLesscodeApiList = (item) => {
                return store
                    .dispatch('api/getApiList', {
                        projectId,
                        categoryId: item.originId
                    })
                    .then((res) => {
                        return getNodeValue(res, true)
                    })
            }

            // 获取 apigateway 网关列表
            const getApigatewayNameList = () => {
                return store
                    .dispatch('api/getApiGateWayNameList')
                    .then((apiNameList) => {
                        const data = apiNameList?.map((apiName) => {
                            apiName.type = 'apigateway-name'
                            apiName.children = []
                            return apiName
                        })
                        return getNodeValue(data)
                    })
                    .catch(() => {
                        return getNodeValue()
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
                        return getNodeValue(stagList)
                    })
            }

            // 获取 apigateway 接口列表
            const getApigatewayList = (item) => {
                return store
                    .dispatch('api/getApiGateWayApiList', {
                        apiName: item.apiName,
                        stageName: item.name
                    })
                    .then((res) => {
                        const data = res?.results || []
                        data.forEach((stag) => {
                            stag.summary = stag.description
                        })
                        return getNodeValue(data, true)
                    })
            }

            // 获取表列表
            const getDataTableList = () => {
                return store
                    .dispatch('dataSource/list', {
                        projectId
                    })
                    .then((res) => {
                        const data = res?.list || []
                        data.forEach((table) => {
                            table.type = 'datasource-table'
                            table.children = []
                            table.name = table.tableName
                        })
                        return getNodeValue(data)
                    })
            }

            // 获取表接口
            const getDataTableApiList = (item) => {
                const apiList = getDataSourceApiList(item.name, item.columns)
                return getNodeValue(apiList, true)
            }

            // 触发值更新
            const chooseApi = (data, node) => {
                if (!node.isLeaf || data.disabled) return
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
            const getDisplayName = () => {
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

            // 跳转到新建的地方
            const goToCreate = (id) => {
                let url
                switch (id) {
                    case 'lesscode-api':
                        url = `/project/${projectId}/manage-api`
                        break
                    case 'datasource-api':
                        url = `/project/${projectId}/data-source-manage/`
                        break
                }
                window.open(url, '_blank')
            }

            // 折叠展开
            const handleToggle = (isOpen) => {
                if (!isOpen) {
                    bigTreeKey.value += bigTreeKey.value
                }
            }

            return {
                apiData,
                treeRef,
                bigTreeRef,
                bigTreeKey,
                getRemoteApi,
                chooseApi,
                getDisplayName,
                getDefaultExpandedNode,
                handleSearch,
                goToCreate,
                handleToggle
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .display-value {
        display: inline-block;
        line-height: 32px;
        padding: 0 36px 0 10px;
    }
    .display-option {
        font-size: 12px;
        &.disabled {
            cursor: not-allowed;
            color: #c4c6cc;
        }
    }
    .bk-drag-jump-link {
        color: #3a84ff;
        margin-left: 3px;
    }
</style>
