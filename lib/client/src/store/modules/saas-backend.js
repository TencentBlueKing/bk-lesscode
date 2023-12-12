import http from '@/api'

export default {
    namespaced: true,
    state: {
    },
    mutations: {
    },
    getters: {
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
        }
    }
}
