import { mapGetters, mapActions } from 'vuex'
export default {
    computed: {
        ...mapGetters('variable', ['variableList']),
        ...mapGetters('page', ['pageDetail'])
    },

    methods: {
        ...mapActions('variable', ['getAllVariable']),

        refreshVariable () {
            const routerParams = this.$route.params || {}
            const params = { projectId: routerParams.projectId, effectiveRange: 0 }
            if (routerParams.pageId) {
                params.pageCode = this.pageDetail.pageCode
            }
            return this.getAllVariable(params)
        }
    }
}
