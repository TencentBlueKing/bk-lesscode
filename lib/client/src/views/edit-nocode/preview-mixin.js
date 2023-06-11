import { mapGetters, mapActions, mapState } from 'vuex'
import { debounce } from 'shared/util.js'

export default {
    data () {
        return {
            previewFlowData: {}
        }
    },
    computed: {
        ...mapGetters('drag', ['curTemplateData']),
        ...mapGetters('nocode/formSetting', ['fieldsList']),
        ...mapGetters('nocode/dataManage', ['pageConfig']),
        ...mapGetters('nocode/form', ['formList']),
        ...mapGetters('nocode/markdown', ['mdContent']),
        ...mapState('route', ['layoutPageList']),
        ...mapGetters('functions', ['funcGroups']),
        pageRoute () {
            return this.layoutPageList.find(({ pageId }) => pageId === Number(this.pageDetail?.id))
        }
    },
    watch: {
        curTemplateData: {
            handler () {
                this.handleUpdatePerviewNav()
            }
        },
        layoutPageList: {
            handler () {
                if (this.debounceUpdatePreview) {
                    this.handleUpdatePerviewNav()
                }
            }
        },
        funcGroups () {
            // 函数发生变化的时候  reload
            this.handleUpdatePreviewContent()
        },
        'pageDetail.lifeCycle' () {
            // 生命周期发生变化的时候  reload
            this.handleUpdatePreviewContent()
        },
        'pageDetail.styleSetting' () {
            // 页面样式发生变化的时候  reload
            this.handleUpdatePreviewContent()
        },
        'pageDetail.flowId': {
            handler: async function (val) {
                if (val) {
                    this.previewFlowData = await this.$store.dispatch('nocode/flow/getFlowData', { id: this.pageDetail?.flowId })
                    this.handleUpdatePreviewContent()
                }
            }
        },
        fieldsList () {
            this.handleUpdatePreviewContent()
        },
        pageConfig () {
            this.handleUpdatePreviewContent()
        },
        formList () {
            this.handleUpdatePreviewContent()
        },
        mdContent () {
            this.handleUpdatePreviewContent()
        }
    },
    mounted () {
        this.$store.dispatch('nocode/form/getFormList', {
            projectId: this.projectId,
            versionId: this.versionId
        })
        this.debounceUpdatePreview = debounce(this.updatePreview)
    },
    beforeDestroy () {
        localStorage.removeItem('ONLINE_PREVIEW_CONTENT')
        localStorage.removeItem('ONLINE_PREVIEW_NAV')
    },
    methods: {
        ...mapActions(['updatePreview']),
        getNocodePayload (nocodeType) {
            const nocodePayload = {}
            if (nocodeType) {
                if (['FORM', 'FLOW'].includes(nocodeType)) {
                    const tableName = (this.formList.find(item => item.id === this.pageDetail?.formId) || {})?.tableName
                    Object.assign(nocodePayload, { fields: this.fieldsList, formId: this.pageDetail?.formId, tableName, serviceId: this.previewFlowData?.itsmId })
                } else if (nocodeType === 'FORM_MANAGE') {
                    Object.assign(nocodePayload, { config: this.pageConfig, formIds: this.pageDetail?.formId })
                } else if (nocodeType === 'FLOW_MANAGE') {
                    Object.assign(nocodePayload, { config: this.pageConfig, formIds: JSON.parse(this.previewFlowData?.formIds || '{}'), serviceId: this.previewFlowData?.itsmId })
                } else if (nocodeType === 'MARKDOWN') {
                    Object.assign(nocodePayload, { content: this.mdContent })
                }
            }
            return nocodePayload
        },
        handleUpdatePreviewContent (setting = {}) {
            const defaultSetting = {
                isGenerateNav: false,
                id: this.projectId + this.pageDetail.pageCode + this.versionId,
                curTemplateData: {},
                storageKey: 'ONLINE_PREVIEW_CONTENT',
                types: ['reload', 'update_style'],
                nocodePayload: this.getNocodePayload(this.pageDetail?.nocodeType)
            }
            this.debounceUpdatePreview(Object.assign(defaultSetting, setting))
        },
        handleUpdatePerviewNav (setting = {}) {
            const defaultSetting = {
                isGenerateNav: true,
                id: this.projectId + this.pageRoute?.layoutPath + this.versionId,
                curTemplateData: this.curTemplateData,
                storageKey: 'ONLINE_PREVIEW_NAV',
                types: ['reload'],
                nocodePayload: this.getNocodePayload(this.pageDetail?.nocodeType)
            }
            this.debounceUpdatePreview(Object.assign(defaultSetting, setting))
        }
    }
}
