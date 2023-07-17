import store from '@/store'
import {
    useRoute
} from '@/router'

// 获取资源
export default () => {
    const route = useRoute()
    const param = {
        projectId: route.params.projectId,
        versionId: store.getters['projectVersion/currentVersionId']
    }

    // 获取项目api列表
    const getApiList = () => {
        return store.dispatch('api/getApiList', param)
    }

    // 获取项目函数列表
    const getFunctionList = () => {
        return store.dispatch('functions/getFunctionList', param)
    }

    // 获取项目级别变量列表
    const getProjectVariableList = () => {
        return store.dispatch('variable/getAllVariable', {
            ...param,
            effectiveRange: 0
        })
    }

    // 获取 项目+页面的变量列表
    const getVariableList = (pageCode) => {
        return store.dispatch('variable/getAllVariable', {
            ...param,
            pageCode,
            effectiveRange: 0
        })
    }

    return {
        getApiList,
        getFunctionList,
        getProjectVariableList,
        getVariableList
    }
}
