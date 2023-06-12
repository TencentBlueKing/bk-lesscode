export default {
    namespaced: true,
    state: {
        mdContent: ''
    },
    mutations: {
        setMdContent (state, data) {
            state.mdContent = data
        }
    },
    getters: {
        mdContent: state => state.mdContent
    },
    actions: {
    }
}
