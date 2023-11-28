/**
 * 保存页面中的表单渲染容器
 * 遍历所有表单容器，如果是新建表类型，需要新建或者更新form表，将fields字段保存到form表，并将新建得到的form id存到dataSource中
 */
import { ref, computed, getCurrentInstance } from '@vue/composition-api'
import { useStore } from '@/store'
import { useRoute } from '@/router'
import LC from '@/element-materials/core'

// 筛选出数据源类型为新建表的表单容器节点
const getFormContainerComponents = (nodes) => {
    const list = []
    nodes.forEach(node => {
        if (node.type === 'widget-form-container') {
            list.push(node)
        }
        list.push(...getFormContainerComponents(node.children))
    })
    return list
}

const checkFormConfig = (nodes) => {
    const configErrors = []
    const relatedIdEmpty = []
    nodes.forEach(node => {
        const dataSource = node.renderProps.dataSource.code
        const { type, relatedId } = dataSource
        if (type === 'USE_FORM' && !relatedId) {
            relatedIdEmpty.push(node.componentId)
        }
    })
    if (relatedIdEmpty.length > 0) {
        configErrors.push(`组件${relatedIdEmpty.map(item => '【' + item + '】').join(', ')}的表单数据源为复用数据表方式，但没有选择数据表`)
    }
    return configErrors
}

export default () => {
    const store = useStore()
    const route = useRoute()
    const isFormContainerPending = ref(false)
    
    const pageDetail = computed(() => store.getters['page/pageDetail'])
    const versionId = computed(() => store.getters['projectVersion/currentVersionId'])

    const currentInstance = getCurrentInstance()

    const saveFormContainers = () => {
        const formContainerComponents = getFormContainerComponents(LC.getRoot().children)
        const compsToUpdate = formContainerComponents.filter(node => {
            const dataSource = node.renderProps.dataSource.code
            const fields = node.renderProps.fields.code
            const { type, id } = dataSource
            // 空的表单容器不需要新建表
            return type === 'NEW_FORM' && (id || fields.length > 0)
        })

        const configError = checkFormConfig(formContainerComponents)
        if (configError.length > 0) {
            currentInstance.proxy.$bkMessage({
                theme: 'error',
                offsetY: 80,
                ellipsisLine: 0,
                message: configError.join('\n')
            })
            return Promise.reject(new Error(window.i18n.t('数据不完整')))
        }

        const getRequests = (nodes) => {
            return nodes.map(node => {
                const { id, tableName } = node.renderProps.dataSource.code
                const fields = node.renderProps.fields.code
                const params = {
                    content: fields,
                    formName: `${pageDetail.value.pageName}_${node.componentId}`, // pageName + componentId
                    tableName: tableName || `${pageDetail.value.pageCode}_${node.componentId}`, // pageCode + componentId
                    componentId: node.componentId,
                    pageId: pageDetail.value.id,
                    projectId: route.params.projectId,
                    versionId: versionId.value
                }
                if (id) {
                    return store.dispatch('form/updateForm', { ...params, id })
                }

                return store.dispatch('form/createForm', params)
            })
        }

        isFormContainerPending.value = true
        return Promise.all(getRequests(compsToUpdate)).then(responses => {
            responses.forEach((res, index) => {
                const node = compsToUpdate[index]
                const dataSourceValue = node.renderProps.dataSource.code
                if (!dataSourceValue.id && res.id) {
                    const newValue = { ...dataSourceValue, id: res.id, tableName: res.tableName }
                    node.setProp('dataSource', {
                        ...node.renderProps.dataSource,
                        code: newValue,
                        renderValue: newValue
                    })
                }
            })
        }).finally(() => {
            isFormContainerPending.value = false
        })
    }

    return {
        isFormContainerPending,
        saveFormContainers
    }
}
