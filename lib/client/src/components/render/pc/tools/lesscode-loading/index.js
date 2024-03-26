import './index.postcss'
import Vue from 'vue'
import {
    h,
    ref,
    onBeforeMount,
    onBeforeUnmount
} from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import {
    addEventListener,
    removeEventListener
} from '@/common/watcher'
import {
    getVariableValue
} from 'shared/variable'
import {
    evalWithSandBox
} from 'shared/function'
import store from '@/store'
import http from '@/api/pureAxios'
import _ from 'lodash'
import useDatasource from '@/hooks/use-datasource'

export default {
    props: {
        componentData: Object
    },
    setup (props) {
        const {
            getTableDatas
        } = useDatasource()

        const isLoading = ref(false)
        const watchMap = {}

        const getResourceData = async (type, code, payload, staticValue) => {
            if (staticValue !== undefined) return staticValue

            const variableList = store.getters['variable/variableList']
            const functionList = store.getters['functions/functionList']
            const apiList = store.getters['api/apiList']
            let data
            switch (type) {
                case 'variable':
                    data = getVariableValue(
                        variableList.find(variable => variable.variableCode === code)
                    )
                    break
                case 'function':
                    data = await evalWithSandBox(
                        code,
                        payload,
                        functionList,
                        variableList,
                        apiList,
                        {
                            $store: store,
                            $http: http,
                            $bkMessage: Vue.prototype.$bkMessage
                        }
                    )
                    break
                case 'datasource':
                    ({ list: data } = await getTableDatas(payload.tableName, payload.bkDataSourceType, payload.thirdPartDBName))
                    break
            }
            return data
        }

        const triggerUpdate = (update) => {
            return () => {
                isLoading.value = true
                update().finally(() => {
                    LC.triggerEventListener('update', {
                        target: props.componentData,
                        type: 'resourceChange'
                    })
                    isLoading.value = false
                })
            }
        }

        // 监听变量的变化
        const watchVariable = (data, key, staticValue) => {
            const {
                code,
                format
            } = data
            const watchKey = `watchVariable-${key}`
            const watchedCode = watchMap[watchKey]
            const watchCode = code
            const update = triggerUpdate(async () => {
                data.renderValue = await getResourceData('variable', watchCode, null, staticValue)
            })
            if (watchedCode && (format !== 'variable' || watchedCode !== watchCode)) {
                delete watchMap[watchKey]
                removeEventListener(watchedCode, update)
            }
            if ((!watchedCode || watchedCode !== watchCode) && format === 'variable' && code) {
                watchMap[watchKey] = watchCode
                addEventListener(watchCode, update, { immediate: true })
            }
        }

        // 监听远程函数变化
        const watchRemote = (data, key, staticValue) => {
            // 兼容 methodCode 平铺的老数据
            let methodData = data?.payload?.methodData
            if (data?.payload?.methodCode) {
                methodData = {
                    methodCode: data?.payload?.methodCode,
                    params: data?.payload?.params
                }
            }
            // 远程函数由函数加变量组成
            const watchKey = `watchRemote-${key}`
            const watchCode = methodData?.params?.reduce?.((acc, cur) => {
                if (cur.format === 'variable' && cur.code) {
                    acc += `&${cur.code}`
                }
                return acc
            }, `${methodData?.methodCode}`)
            const watchedCode = watchMap[watchKey]
            const update = triggerUpdate(async () => {
                const val = await getResourceData('function', methodData.methodCode, methodData.params, staticValue)
                if (typeof val === typeof data.renderValue || typeof val === typeof data.code) {
                    data.renderValue = val
                    data.code = val
                }
            })
            // 更新event
            if (watchedCode && (!['select-remote', 'remote'].includes(data.valueType) || watchedCode !== watchCode)) {
                delete watchMap[watchKey]
                watchedCode.split('&').forEach((code) => {
                    removeEventListener(code, update)
                })
            }
            if ((!watchedCode || watchedCode !== watchCode) && ['select-remote', 'remote'].includes(data.valueType) && watchCode) {
                watchMap[watchKey] = watchCode
                watchCode.split('&').forEach((code) => {
                    addEventListener(code, update, { immediate: true })
                })
            }
        }

        // 更新数据源数据
        const updateDataSource = (data, key) => {
            const isDataSourceType = [
                'data-source',
                'select-data-source',
                'table-data-source'
            ].includes(data.valueType)
            const tableName = data?.payload?.sourceData?.tableName
            const dataSourceType = data?.payload?.sourceData?.dataSourceType
            const thirdPartDBName = data?.payload?.sourceData?.thirdPartDBName
            const watchKey = `updateDataSource-${key}`
            const watchCode = `datasource-${tableName}`
            const watchedCode = watchMap[watchKey]
            if (watchedCode && (!isDataSourceType || watchedCode !== watchCode)) {
                delete watchMap[watchKey]
            }
            if (isDataSourceType && tableName && !watchMap[watchKey]) {
                watchMap[watchKey] = watchCode
                triggerUpdate(() => {
                    return getResourceData(
                        'datasource',
                        tableName,
                        {
                            tableName,
                            bkDataSourceType: dataSourceType,
                            thirdPartDBName
                        }
                    ).then((val) => {
                        if (!_.isEqual(data.renderValue, val)) {
                            data.renderValue = val
                        }
                    })
                })()
            }
        }

        // 监听 payload 中使用到的变量
        const watchPayload = (data, key) => {
            const payload = data.payload || {}
            // 检查 table pagination
            if (key === 'prop-pagination' && data.format === 'value' && ['local', 'remote'].includes(payload.type)) {
                const paginationVal = payload.val || {}
                Object
                    .keys(paginationVal)
                    .forEach((key) => {
                        const {
                            format,
                            code
                        } = paginationVal[key]
                        const watchKey = `watchPayload-${key}`
                        const watchedCode = watchMap[watchKey]
                        const watchCode = code
                        const update = triggerUpdate(async () => {
                            paginationVal[key].val = await getResourceData('variable', watchCode)
                        })
                        if (watchedCode && (format !== 'variable' || watchedCode !== watchCode)) {
                            delete watchMap[watchKey]
                            removeEventListener(watchedCode, update)
                        }
                        if ((!watchedCode || watchedCode !== watchCode) && format === 'variable' && watchCode) {
                            watchMap[watchKey] = watchCode
                            addEventListener(watchCode, update, { immediate: true })
                        }
                    })
            }
        }

        const watchResource = () => {
            const node = props.componentData
            const propMaterial = node.material?.props

            Object.keys(node.renderProps).forEach(propKey => {
                const material = propMaterial[propKey]
                const prop = node.renderProps[propKey]
                const key = `prop-${propKey}`
                watchVariable(prop, key, material?.staticValue)
                watchRemote(prop, key, material?.staticValue)
                watchPayload(prop, key)
                updateDataSource(prop, key)
            })

            Object.keys(node.renderSlots).forEach(slotKey => {
                const slot = node.renderSlots[slotKey]
                const key = `slot-${slotKey}`
                if (!LC.isNode(slot)) {
                    watchVariable(slot, key)
                    watchRemote(slot, key)
                    updateDataSource(slot, key)
                }
            })
        }

        const handleUpdate = (event) => {
            if (event.target.componentId === props.componentData.componentId) {
                watchResource()
            }
        }

        onBeforeMount(() => {
            watchResource()
            LC.addEventListener('update', handleUpdate)
        })

        onBeforeUnmount(() => {
            LC.removeEventListener('update', handleUpdate)
        })

        return {
            isLoading
        }
    },
    render (render) {
        h.init(render)

        // loading 组件样式
        const style = Object.assign(
            {},
            this.componentData.style,
            this.$parent.baseComponentStyleReset,
            {
                position: 'relative',
                height: '100%',
                width: '100%'
            }
        )

        // 交互式组件需要父级fixed
        if (this.componentData.isInteractiveComponent) {
            Object.assign(style, {
                position: 'fixed',
                background: 'rgba(0,0,0,0.5)',
                zIndex: 9999,
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                pointerEvents: 'auto !important'
            })
        }

        return h({
            component: 'bk-loading',
            key: this.isLoading,
            style,
            props: {
                extCls: 'component-loading',
                loading: this.isLoading,
                isLoading: this.isLoading
            },
            children: this.$slots.default
        })
    }
}
