import http from '@/api'

export default {
    namespaced: true,
    state: {
        needUpdate: false,
        isExecuting: false
    },
    mutations: {
        setStateProperty (state, data) {
            state[data.key] = data.value
        }
    },
    getters: {
        getNeedUpdate: state => state.needUpdate || false,
        getIsExecuting: state => state.isExecuting
    },
    actions: {
        getModuleList ({ state }, projectId) {
            return http.get(`/saas-backend/getModuleList?projectId=${projectId}`).then(response => {
                const data = response.data
                return data
            })
        },
        createModule ({ state }, params) {
            return http.post('/saas-backend/createModule', params).then(response => {
                const data = response.data
                return data
            })
        },
        getStoryList ({ state }, moduleId) {
            return http.get(`/saas-module-story/getStoryList?moduleId=${moduleId}`).then(response => {
                const data = response.data
                return data
            })
        },
        createModuleStory ({ state }, params) {
            return http.post('/saas-module-story/createStory', params).then(response => {
                const data = response.data
                return data
            })
        },
        patchModuleStory ({ state }, params) {
            return http.post('/saas-module-story/patchStory', params).then(response => {
                const data = response.data
                return data
            })
        },
        getSaasBuilderList ({ state }, params) {

        },
        getSaasBuilderDetail ({ state }, uuid) {
            return http.get(`/saas-module-story/getBuilderDetail?uuid=${uuid}`).then(response => {
                const data = response.data
                return data
            })
        }
    }
}
