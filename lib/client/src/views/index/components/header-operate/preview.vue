<template>
    <bk-button @click="handlePreview">{{$t('预览')}}</bk-button>
</template>

<script>
    import { mapGetters, mapState } from 'vuex'
    import { getRouteFullPath } from 'shared/route'

    export default {
        computed: {
            ...mapState('route', ['layoutPageList']),
            ...mapGetters('page', [
                'pageDetail',
                'platform'
            ]),
            ...mapGetters('drag', [
                'curTemplateData'
            ]),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId', currentVersion: 'currentVersion' }),
            projectId () {
                return this.$route.params.projectId || ''
            }
        },
        methods: {
            async handlePreview () {
                // await this.handleSave()
                const pageRoute = this.layoutPageList.find(({ pageId }) => pageId === Number(this.pageDetail.id))
                if (!pageRoute.id) {
                    this.messageErrorwindow.i18n.t('页面未配置路由，请先配置')
                    return
                }

                if (this.pageDetail.nocodeType === 'FORM' && !this.pageDetail.formId) {
                    this.messageError(window.i18n.t('新创建的表单类型页面请先保存后再预览'))
                    return
                }

                const fullPath = getRouteFullPath(pageRoute)

                if (this.platform === 'MOBILE') {
                    const versionQuery = `${this.versionId ? `&version=${this.versionId}` : ''}`
                    window.open(`/preview-mobile/project/${this.projectId}?pagePath=${fullPath}&pageCode=${this.pageDetail.pageCode}${versionQuery}`, '_blank')
                } else {
                    // 预览表单
                    const versionPath = `${this.versionId ? `/version/${this.versionId}` : ''}`
                    const routerUrl = `/preview/project/${this.projectId}${versionPath}${fullPath}?pageCode=${this.pageDetail.pageCode}`
                    window.open(routerUrl, '_blank')
                }
            }
        }
    }
</script>
