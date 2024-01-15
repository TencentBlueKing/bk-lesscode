import http from '@/api'

export default {
    namespaced: true,
    state: {
        needUpdate: false,
        isExecuting: false,
        saasBuilderList: []
    },
    mutations: {
        setStateProperty (state, data) {
            state[data.key] = data.value
        }
    },
    getters: {
        getNeedUpdate: state => state.needUpdate || false,
        getIsExecuting: state => state.isExecuting,
        getSaasBuilderList: state => state.saasBuilderList
    },
    actions: {
        getModuleList ({ rootGetters }, projectId) {
            return http.get(`/projects/${rootGetters['project/currentProjectId']}/saas-backend/getModuleList?projectId=${projectId}`).then(response => {
                const data = response.data
                return data
            })
        },
        createModule ({ rootGetters }, params) {
            return http.post(`/projects/${rootGetters['project/currentProjectId']}/saas-backend/createModule`, params).then(response => {
                const data = response.data
                return data
            })
        },
        getStoryList ({ rootGetters }, moduleId) {
            return http.get(`/projects/${rootGetters['project/currentProjectId']}/saas-module-story/getStoryList?&moduleId=${moduleId}`).then(response => {
                const data = response.data
                return data
            })
        },
        createModuleStory ({ rootGetters }, params) {
            return http.post(`/projects/${rootGetters['project/currentProjectId']}/saas-module-story/createStory`, params).then(response => {
                const data = response.data
                return data
            })
        },
        patchModuleStory ({ rootGetters }, params) {
            return http.post(`/projects/${rootGetters['project/currentProjectId']}/saas-module-story/patchStory`, params).then(response => {
                const data = response.data
                return data
            })
        },
        updateModuleStory ({ rootGetters }, params) {
            return http.put(`/projects/${rootGetters['project/currentProjectId']}/saas-module-story/updateStory`, params).then(response => {
                const data = response.data
                return data
            })
        },
        getSaasBuilderList ({ rootGetters }, params) {

        },
        getSaasBuilderDetail ({ rootGetters }, uuid) {
            return http.get(`/projects/${rootGetters['project/currentProjectId']}/saas-module-story/getBuilderDetail?uuid=${uuid}`).then(response => {
                const data = response.data
                return data
            })
        }
    }
}
