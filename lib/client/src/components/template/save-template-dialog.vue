<template>
    <section>
        <bk-dialog v-model="isShow"
            render-directive="if"
            :title="$t('存为模板')"
            :width="$store.state.Language === 'en' ? 700 : 600"
            :mask-close="false"
            :auto-close="false"
            :close-icon="false"
            :esc-icon="false"
            :draggable="false"
            header-position="left"
            ext-cls="template-operate-dialog"
        >
            <bk-form ref="pageTemplateFrom" class="dialog-form" :label-width="$store.state.Language === 'en' ? 168 : 95" :rules="dialog.formRules" :model="dialog.formData">
                <bk-form-item :label="$t('form_操作类型')" property="templateName" style="margin-bottom: 20px">
                    <bk-radio-group v-model="dialog.formData.saveType">
                        <bk-radio value="new" style="margin-right: 20px">{{ $t('存为新模板') }}</bk-radio>
                        <bk-radio value="edit">{{ $t('更新覆盖已有模板') }}</bk-radio>
                    </bk-radio-group>
                </bk-form-item>
                <section v-if="dialog.formData.saveType === 'new'">
                    <bk-form-item :label="$t('form_模板名称')" required property="templateName" error-display-type="normal">
                        <bk-input ref="nameInput"
                            maxlength="60"
                            v-model.trim="dialog.formData.templateName"
                            :placeholder="$t('请输入模板名称，50个字符以内')">
                        </bk-input>
                    </bk-form-item>
                    <bk-form-item :label="$t('form_模板分类')" required property="categoryId" error-display-type="normal">
                        <bk-select
                            :clearable="false"
                            v-model="dialog.formData.categoryId"
                        >
                            <bk-option v-for="item in categoryList" :id="item.id" :name="item.name" :key="item.id">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                </section>
                <section v-else>
                    <bk-form-item :label="$t('form_待更新模板')" required property="templateId" error-display-type="normal">
                        <bk-select
                            v-model="dialog.formData.templateId"
                            @toggle="toggleTemplateList"
                        >
                            <bk-option v-for="item in templateList" :id="item.id" :name="item.templateName" :key="item.id">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                </section>
            </bk-form>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :loading="dialog.loading"
                    @click="handleDialogConfirm">{{ $t('确定') }}</bk-button>
                <bk-button @click="closeDialog" :disabled="dialog.loading">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    import LC from '@/element-materials/core'
    import { mapGetters } from 'vuex'
    import html2canvas from 'html2canvas'
    import { bus } from '@/common/bus'

    export default {
        name: 'template-dialog',
        data () {
            return {
                isShow: false,
                isWholePage: false,
                categoryList: [],
                templateList: [],
                dialog: {
                    loading: false,
                    formData: {
                        saveType: 'new',
                        templateName: '',
                        categoryId: '',
                        templateId: ''
                    },
                    formRules: {
                        templateName: [
                            {
                                required: true,
                                message: this.$t('必填项'),
                                trigger: 'blur'
                            },
                            {
                                max: 40,
                                message: this.$t('名称不能超过40个字符'),
                                trigger: 'blur'
                            }
                        ],
                        categoryId: [
                            {
                                required: true,
                                message: this.$t('必选项'),
                                trigger: 'blur'
                            }
                        ]
                    }
                }
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            ...mapGetters('page', [
                'pageDetail'
            ]),
            ...mapGetters('layout', ['pageLayout']),
            projectId () {
                return this.$route.params.projectId
            }
        },
        watch: {
            isShow (val) {
                if (val) {
                    this.getTemplateCategory()
                    setTimeout(() => {
                        this.$refs.nameInput && this.$refs.nameInput.$el.querySelector('input').focus()
                    }, 50)
                } else {
                    this.dialog.formData.saveType = 'new'
                    this.dialog.formData.templateName = ''
                    this.dialog.formData.categoryId = ''
                    this.dialog.formData.templateId = ''
                }
            }
        },
        created () {
            this.eventData = {}
            const showCallback = (event) => {
                this.isShow = true
                this.eventData = event
            }
            LC.addEventListener('saveTemplate', showCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('saveTemplate', showCallback)
            })
        },
        methods: {
            async toggleTemplateList (val) {
                if (val) {
                    this.templateList = await this.$store.dispatch('pageTemplate/list', { projectId: this.projectId })
                }
            },
            async getTemplateCategory () {
                try {
                    this.categoryList = await this.$store.dispatch('pageTemplate/categoryList', { projectId: this.projectId })
                    this.dialog.formData.categoryId = (this.categoryList[0] && this.categoryList[0].id) || ''
                } catch (e) {
                    this.categoryList = []
                }
            },
            async handleDialogConfirm () {
                const { formData = {} } = this.dialog

                if (formData.saveType === 'edit') {
                    if (!formData.templateId) {
                        this.$bkMessage({
                            theme: 'error',
                            message: this.$t('请先选择要更新的模板')
                        })
                        return
                    }
                } else {
                    await this.$refs.pageTemplateFrom.validate()
                }
                
                this.dialog.loading = true
                const $rootElm = this.eventData.target.$elm
                
                html2canvas($rootElm).then(async (canvas) => {
                    try {
                        const imgData = canvas.toDataURL('image/png')
                        let data = {}
                        let res = ''
                        const params = {
                            belongProjectId: this.projectId,
                            templateType: this.pageDetail.pageType,
                            versionId: this.versionId,
                            fromPageCode: this.pageDetail && this.pageDetail.pageCode,
                            content: JSON.stringify(this.eventData.value),
                            previewImg: imgData
                        }
                        
                        if (formData.saveType === 'edit') {
                            data = {
                                id: formData.templateId,
                                params
                            }
                            res = await this.$store.dispatch('pageTemplate/update', data)
                        } else {
                            data = {
                                projectId: this.projectId,
                                params: Object.assign({
                                    templateName: formData.templateName,
                                    categoryId: formData.categoryId
                                }, params)
                            }
                            res = await this.$store.dispatch('pageTemplate/create', data)
                        }
                        
                        if (res) {
                            this.dialog.loading = false
                            this.$bkMessage({
                                theme: 'success',
                                message: this.$t('存为模板成功')
                            })
                            this.isShow = false
                            bus.$emit('update-template-list')
                        }
                    } catch (err) {
                        this.$bkMessage({
                            theme: 'error',
                            message: err.message || err
                        })
                    } finally {
                        this.dialog.loading = false
                    }
                }).catch((err) => {
                    this.dialog.loading = false
                    this.$bkMessage({
                        theme: 'error',
                        message: err.message || err
                    })
                })
            },
            closeDialog () {
                this.isShow = false
            }
        }
    }
</script>

<style lang="postcss">
    .template-operate-dialog {
        /* z-index: 2100 !important; */
        .bk-dialog-body {
            padding: 10px 15px 25px;
        }
    }
</style>
