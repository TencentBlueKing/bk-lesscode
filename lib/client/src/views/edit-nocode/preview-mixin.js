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
        ...mapGetters('nocode/formSetting', ['fieldsList', 'tableFieldsConfig']),
        ...mapState('route', ['layoutPageList']),
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
                this.handleUpdatePerviewNav()
            }
        },
        'pageDetail.styleSetting' () {
            // 页面样式发生变化的时候  reload
            this.handleUpdatePreviewContent()
        },
        fieldsList () {
            this.handleUpdatePreviewContent()
        },
        tableFieldsConfig () {
            this.handleUpdatePreviewContent()
        }
    },
    async created () {
        if (this.pageDetail?.flowId) {
            this.previewFlowData = await this.$store.dispatch('nocode/flow/getFlowData', { id: this.pageDetail?.flowId })
        }
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
                    Object.assign(nocodePayload, { fields: this.fieldsList })
                } else if (nocodeType === 'FORM_MANAGE') {
                    Object.assign(nocodePayload, { config: this.tableFieldsConfig, formIds: this.pageDetail?.formId })
                } else if (nocodeType === 'FLOW_MANAGE') {
                    Object.assign(nocodePayload, { config: this.tableFieldsConfig, formIds: JSON.parse(this.previewFlowData?.formIds || '{}'), serviceId: this.previewFlowData?.itsmId })
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
