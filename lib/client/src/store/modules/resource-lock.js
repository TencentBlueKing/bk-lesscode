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
            return http.post(`/projects/${rootGetters['projectId']}/resourceLock/lockStatus`, params).then(response => {
                const data = response.data || ''
                return data
            })
        },
        updateLockInfo ({ rootGetters }, params) {
            return http.put(`/projects/${rootGetters['projectId']}/resourceLock/updateLockInfo`, params).then(response => {
                return response.data || ''
            })
        },
        occupy ({ rootGetters }, params) {
            return http.post(`/projects/${rootGetters['projectId']}/resourceLock/occupy`, params).then(response => {
                return response.data || ''
            })
        },
        release ({ rootGetters }, params) {
            return http.post(`/projects/${rootGetters['projectId']}/resourceLock/release`, params).then(response => {
                return response.data || ''
            })
        }
    }
}
