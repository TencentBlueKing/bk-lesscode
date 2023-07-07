<template>
    <menu-item :item="item">
        <bk-dialog v-model="isShow"
            :position="{ top: '10%', left: '10%' }"
            :show-mask="true"
            :mask-close="true"
            :auto-close="false"
            :draggable="false"
            render-directive="if"
            width="80%"
            header-position="left"
            ext-cls="code-json-dialog"
        >
            <page-variable />
        </bk-dialog>
    </menu-item>
</template>
<script>
    import { mapGetters } from 'vuex'
    import MenuItem from './menu-item'
    import PageVariable from '../children/page-variable'
    
    export default {
        components: {
            MenuItem,
            PageVariable
        },
        data () {
            return {
                item: {
                    icon: 'bk-drag-icon bk-drag-page-variable',
                    tips: window.i18n.t('页面变量'),
                    func: this.showPageVar
                },
                isShow: false
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId', currentVersion: 'currentVersion' }), 
            projectId () {
                return this.$route.params.projectId || ''
            }
        },
        methods: {
            showPageVar () {
                this.isShow = true
                this.$store.dispatch('variable/getAllVariable', {
                    projectId: this.projectId,
                    pageCode: this.pageDetail.pageCode,
                    versionId: this.versionId,
                    effectiveRange: 0
                })
            }
        }
    }
</script>
