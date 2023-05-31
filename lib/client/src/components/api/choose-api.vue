<template>
    <bk-select
        ref="treeRef"
        searchable
        :search-placeholder="$t('请输入关键字搜索。如果没搜索到，可能是懒加载还未加载相应数据，请手动展开目录来寻找 API')"
        :tag-fixed-height="false"
        :show-empty="false"
        :clearable="false"
        :scroll-height="300"
        :popover-options="{ appendTo: 'parent' }"
        :disabled="disabled"
        :remote-method="handleSearch"
        @toggle="handleToggle"
    >
        <span
            class="display-value"
            slot="trigger"
        >
            {{ getDisplayName() }}
            <i
                class="bk-select-clear bk-icon icon-close-circle-shape"
                @click.stop="handleClear"
            ></i>
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
    import { transItsmApiSchemeToDataSourceScheme } from 'shared/no-code'
    import { API_METHOD } from 'shared/api'

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
            },
            // itsm系统对接的esb接口
            useFlowEsbApi: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },

        setup (props, { emit }) {
            // 可使用的api类型
            const getApiClassify = (projectId) => {
                const defaultClassify = [
                    {
                        id: 'apigateway-api',
                        name: window.i18n.t('蓝鲸网关API'),
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
                                name: window.i18n.t('应用自建API'),
                                type: 'lesscode',
                                children: []
                            },
                            {
                                id: 'datasource-api',
                                name: window.i18n.t('数据表操作API'),
                                type: 'datasource',
                                children: []
                            }
                        ]
                    )
                }
                if (props.useFlowEsbApi) {
                    defaultClassify.unshift({
                        id: 'flow-esb-api',
                        name: window.i18n.t('蓝鲸网关API'),
                        type: 'flow-esb-systems',
                        children: []
                    })
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
                        name: window.i18n.t('暂无数据'),
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
                    case 'flow-esb-systems':
                        return getFlowEsbSystems(data)
                    case 'flow-esb-api-list':
                        return getFlowEsbApiList(data)
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
                        const data = res.map((api) => {
                            api.name = `${api.name}（${api.code}）`
                            return api
                        })
                        return getNodeValue(data, true)
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

            // 获取itsm对接的esb系统
            const getFlowEsbSystems = (item) => {
                return store.dispatch('nocode/flow/getEsbSystems')
                    .then(res => {
                        const data = res?.map((sysItem) => {
                            sysItem.type = 'flow-esb-api-list'
                            sysItem.children = []
                            return sysItem
                        })
                        return getNodeValue(data)
                    })
            }

            // 获取itsm对接系统的接口列表
            const getFlowEsbApiList = (system) => {
                return store.dispatch('nocode/flow/getEsbApis', { system_id: system.originId })
                    .then(res => {
                        const apiList = (res || []).map(api => {
                            api.path = `${system.domain}${api.path}`
                            return api
                        })
                        return getNodeValue(apiList, true)
                    })
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
                        name: data.name,
                        code: data.code
                    })
                    cur = cur.parent
                } while (cur)
                const apiType = path[path.length - 1]?.id
                const apiData = apiType === 'flow-esb-api' ? transItsmApiSchemeToDataSourceScheme(data) : data
                emit('change', {
                    path: path.reverse(),
                    method: apiData.method.toLowerCase(),
                    url: apiData.url,
                    query: apiData.query || [],
                    body: apiData.body || {},
                    response: apiData.response || {},
                    summary: apiData.summary
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
                        return item.code || item.name
                    })
                    .reduce((acc, cur, index) => {
                        const divider = index === 0 ? '' : index === 1 ? '：' : ' / '
                        acc += divider + cur
                        return acc
                    }, '')
            }

            // 获取默认展开的节点
            const getDefaultExpandedNode = () => {
                return ['lesscode-api', 'apigateway-api', 'datasource-api', 'flow-esb-api']
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

            // 点击清除
            const handleClear = () => {
                emit('change', {
                    path: [],
                    method: API_METHOD.GET,
                    url: '',
                    query: [],
                    body: {},
                    response: {},
                    summary: ''
                })
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
                handleToggle,
                handleClear
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
