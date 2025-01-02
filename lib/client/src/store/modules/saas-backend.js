import http from '@/api'

export default {
    namespaced: true,
    state: {
        isSaasAvailable: false,
        showSlider: false,
        showUpdateDialog: false,
        currentNode: {},
        needUpdate: false,
        isExecuting: false,
        isCanvasLocked: false,
        saasBuilderList: [],
        schemaApiList: []
    },
    mutations: {
        setSaasAvailable (state, data) {
            state.isSaasAvailable = data
        },
        setStateProperty (state, data) {
            state[data.key] = data.value
        }
    },
    getters: {
        isSaasAvailable: state => state.isSaasAvailable,
        getNeedUpdate: state => state.needUpdate || false,
        getIsExecuting: state => state.isExecuting,
        getSaasBuilderList: state => state.saasBuilderList
    },
    actions: {
        checkSaasAvailable ({ commit }) {
            return http.get('/ai/available?type=saas').then((res = {}) => {
                commit('setSaasAvailable', res.data)
                return res.data
            })
        },
        checkSaasPerm ({ rootGetters }, params) {
            return http.post('/saas-backend/checkSaasPerm', params).then(response => {
                const data = response.data
                return data
            })
        },
        getModuleList ({ rootGetters }, projectId) {
            return http.get('/saas-backend/getModuleList').then(response => {
                const data = response.data
                return data
            })
        },
        createModule ({ rootGetters }, params) {
            return http.post('/saas-backend/createModule', params).then(response => {
                const data = response.data
                return data
            })
        },
        getStoryList ({ rootGetters }, moduleId) {
            return http.get(`/saas-module-story/getStoryList?&moduleId=${moduleId}`).then(response => {
                const data = response.data
                return data
            })
        },
        createModuleStory ({ rootGetters }, params) {
            return http.post('/saas-module-story/createStory', params).then(response => {
                const data = response.data
                return data
            })
        },
        patchModuleStory ({ rootGetters }, params) {
            return http.post('/saas-module-story/patchStory', params).then(response => {
                const data = response.data
                return data
            })
        },
        execModuleStory ({ rootGetters }, params) {
            return http.post('/saas-module-story/execStory', params).then(response => {
                const data = response.data
                return data
            })
        },
        updateModuleStory ({ rootGetters }, params) {
            return http.put('/saas-module-story/updateStory', params).then(response => {
                const data = response.data
                return data
            })
        },
        getSaasBuilderDetail ({ rootGetters }, uuid) {
            return http.get(`/saas-module-story/getBuilderDetail?uuid=${uuid}`).then(response => {
                const data = response.data
                return data
            })
        },
        getSaasApiDoc ({ rootGetters }, params) {
            return http.get(`/saas-module-story/getBuilderApiDoc?schemaUrl=${params.schemaUrl}`).then(response => {
                const data = response.data
                return data
            })
        },
        updateSchemaApiList ({ rootGetters, commit }, params) {
            return http.get(`/saas-module-story/getBuilderApiDoc?schemaUrl=${params.schemaUrl}&type=API_DETAIL`).then(response => {
                const data = response.data
                commit('setStateProperty', {
                    key: 'schemaApiList',
                    value: data
                })
            })
        }
    }
}
