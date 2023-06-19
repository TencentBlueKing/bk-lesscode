<template>
    <bk-dialog v-model="isShow"
        :position="{ top: '10%', left: '10%' }"
        :show-mask="true"
        :mask-close="true"
        :auto-close="false"
        :close-icon="false"
        :draggable="false"
        render-directive="if"
        width="80%"
        header-position="left"
        ext-cls="code-json-dialog"
    >
        <section class="vue-code" v-bkloading="{ isLoading: isLoading, color: '#313238' }">
            <code-viewer
                ref="codeView"
                :code-type="codeType"
                :type-list="typeList"
                :code="renderValue"
                @close="$emit('close')"
                @show-edit-data="showEditData"
                @change-code-type="changeCodeType"
                @change-with-nav="getFormatCode" />

            <json-view
                ref="editDialog"
                :show-input="false"
                :default-value="[]"
                :change="setImportData"
                name="targetData"
                type="json"
                :dialog-title="$t('json数据将会覆盖当前已有页面内容')" />
        </section>
    </bk-dialog>
</template>

<script>
    import CodeViewer from '@/components/code-viewer'
    import JsonView from '@/element-materials/modifier/component/props/components/strategy/json-view.vue'
    import LC from '@/element-materials/core'
    import { circleJSON } from '@/common/util.js'
    import { mapGetters } from 'vuex'
    import { bus } from '@/common/bus'

    export default {
        components: {
            CodeViewer,
            JsonView
        },
        props: {
            isShow: {
                type: Boolean,
                default: false
            },
            typeList: {
                type: Array,
                default: () => (['code', 'json'])
            },
            defaultType: {
                type: String,
                default: 'code'
            }
        },
        data () {
            return {
                isLoading: false,
                codeType: this.defaultType,
                formatCode: '',
                json: ''
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId', currentVersion: 'currentVersion' }),
            ...mapGetters('variable', ['variableList']),
            projectId () {
                return this.$route.params.projectId || ''
            },
            pageId () {
                return this.$route.params.pageId || ''
            },
            renderValue () {
                return this.codeType === 'code' ? this.formatCode : this.json
            }
        },
        watch: {
            isShow (val) {
                if (val) {
                    this.initContent()
                    this.codeType = this.defaultType
                }
            },
        },
        methods: {
            changeCodeType (val) {
                this.codeType = val
            },
            initContent () {
                console.log(this.pageDetail, 'pagedetail')
                // json内容， 表单页或流程编辑表单页
                if (['FORM', 'FLOW'].includes(this.pageDetail?.nocodeType) || this.$route.name === 'flowConfig') {
                    const content = this.$store.state.nocode.formSetting.fieldsList || []
                    this.json = circleJSON(content)
                    console.log(this.json, this.$store.state.nocode.formSetting.fieldsList)
                } else {
                    const root = LC.getRoot()
                    this.json = circleJSON(root.toJSON().renderSlots.default)
                }

                // code内容
                if (this.typeList.includes('code')) {
                    this.getFormatCode(true)
                }
            },
            getFormatCode (withNav) {
                this.isLoading = true
                const { projectId, pageId } = this
                const targetData = JSON.parse(circleJSON(LC.getRoot().toJSON()?.renderSlots?.default) || '[]')
                this.$store.dispatch('vueCode/getPageCode', {
                    targetData,
                    pageType: 'vueCode',
                    projectId,
                    versionId: this.versionId,
                    pageId,
                    withNav,
                    variableData: this.variableList
                }).then(res => {
                    this.formatCode = res
                }).finally(() => {
                    this.isLoading = false
                })
            },
            showEditData () {
                this.$refs.editDialog && this.$refs.editDialog.showEdit()
            },
            setImportData (name, data) {
                if (data && Array.isArray(data)) {
                    if (['FORM', 'FLOW'].includes(this.pageDetail?.nocodeType)) {
                        this.$store.commit('nocode/formSetting/setFieldsList', data)
                        bus.$emit('resetFieldList', data)
                        this.code = circleJSON(data)
                    } else {
                        LC.parseData(data)
                    }
                }
                this.$emit('close')
            }
        }
    }
</script>

<style lang="postcss">
    .code-json-dialog {
        .bk-dialog {
            width: 80%;
            /* height: 80%; */
            top: 10%;
        }
        .bk-dialog-tool, .bk-dialog-footer {
            display: none;
        }
        .bk-dialog-body {
            padding: 0;
            height: 80vh;
        }
    }
    .vue-code {
        height: 100%;
        .hljs-attr {
            color: #a6e22e;
        }
    }
</style>
