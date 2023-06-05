import http from '@/api'

export default {
    namespaced: true,
    state: {},
    mutations: {},
    getters: {},
    actions: {
        check ({ commit }, { data, config }) {
            return http.post('/iam/check', data, config).then(response => {
                const data = response.data || ''
                return data
            })
        },

        checkBatch ({ commit }, { data, config }) {
            return http.post('/iam/check-batch', data, config).then(response => {
                const data = response.data || ''
                return data
            })
        }
    }
}
