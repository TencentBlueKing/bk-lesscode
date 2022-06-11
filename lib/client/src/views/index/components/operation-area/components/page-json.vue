<template>
    <section>
        <code-viewer
            :code="code"
            :filename="`bklesscode-${pageId}.json`"
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
    import { bus } from '@/common/bus'
    import { mapGetters } from 'vuex'

    export default {
        components: {
            CodeViewer,
            JsonView
        },
        data () {
            return {
                code: '',
                dialogTitle: 'json数据将会覆盖当前已有页面内容'
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            pageId () {
                return this.$route.params.pageId || ''
            }
        },
        created () {
            if (this.pageDetail.nocodeType === 'FORM') {
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
                    if (this.pageDetail.nocodeType === 'FORM') {
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
