<template>
    <section>
        <code-viewer
            :code="code"
            :filename="`bklesscode-page-${pageDetail.pageCode}.json`"
            @show-edit-data="showEditData"
            page-type="json" />
        <json-view
            ref="editDialog"
            :show-input="false"
            :default-value="[]"
            :change="setImportData"
            name="targetData"
            type="json"
            :dialog-title="dialogTitle" />
    </section>
</template>

<script>
    import CodeViewer from '@/components/code-viewer'
    import JsonView from '@/element-materials/modifier/component/props/components/strategy/json-view.vue'
    import { circleJSON } from '@/common/util.js'
    import LC from '@/element-materials/core'
    import { mapGetters } from 'vuex'
    import { bus } from '@/common/bus'

    export default {
        components: {
            CodeViewer,
            JsonView
        },
        props: {
            nocodeType: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                code: '',
                dialogTitle: window.i18n.t('json数据将会覆盖当前已有页面内容')
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            pageId () {
                return this.$route.params.pageId || ''
            }
        },
        watch: {
            '$store.state.nocode.formSetting.fieldsList' (val) {
                this.code = circleJSON(val || [])
            }
        },
        created () {
            if (['FORM', 'FLOW'].includes(this.nocodeType)) {
                const content = this.$store.state.nocode.formSetting.fieldsList || []
                this.code = circleJSON(content)
            } else {
                const root = LC.getRoot()
                this.code = circleJSON(root.toJSON().renderSlots.default)
            }
        },
        methods: {
            showEditData () {
                this.$refs.editDialog && this.$refs.editDialog.showEdit()
            },
            setImportData (name, data) {
                if (data && Array.isArray(data)) {
                    if (['FORM', 'FLOW'].includes(this.nocodeType)) {
                        this.$store.commit('nocode/formSetting/setFieldsList', data)
                        bus.$emit('resetFieldList', data)
                        this.code = circleJSON(data)
                    } else {
                        LC.parseData(data)
                    }
                }
            }
        }
    }
</script>
