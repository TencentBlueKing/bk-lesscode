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
        getLockStatus ({ rootGetters }, params) {
            return http.post('/resourceLock/lockStatus', params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        updateLockInfo ({ rootGetters }, params) {
            return http.put('/resourceLock/updateLockInfo', params).then(response => {
                return response.data || ''
            })
        },
        occupy ({ rootGetters }, params) {
            return http.post('/resourceLock/occupy', params).then(response => {
                return response.data || ''
            })
        },
        release ({ rootGetters }, params) {
            return http.post('/resourceLock/release', params).then(response => {
                return response.data || ''
            })
        }
    }
}
