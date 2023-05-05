<template>
    <section>
        <bk-dialog v-model="isShow"
            render-directive="if"
            theme="primary"
            :title="dialogTitle"
            :width="$store.state.Language === 'en' ? 750 : 600"
            :mask-close="false"
            :auto-close="false"
            header-position="left"
            ext-cls="template-edit-dialog"
        >
            <bk-form ref="pageTemplateFrom" class="dialog-form" :label-width="$store.state.Language === 'en' ? 168 : 120" :rules="dialog.formRules" :model="dialog.formData">
                <bk-form-item :label="$t('form_模板名称')" required property="templateName" error-display-type="normal">
                    <bk-input ref="nameInput"
                        maxlength="40"
                        v-model.trim="dialog.formData.templateName"
                        :placeholder="$t('请输入模板名称，40个字符以内')">
                    </bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('form_模板分类')" required property="categoryId" error-display-type="normal">
                    <bk-select
                        :clearable="false"
                        v-model="dialog.formData.categoryId"
                        @toggle="toggleCategory"
                    >
                        <bk-option v-for="item in categoryList" :id="item.id" :name="item.name" :key="item.id">
                        </bk-option>
                    </bk-select>
                </bk-form-item>
                <section v-if="actionType === 'update'" style="margin-top: 20px;">
                    <bk-form-item :label="$t('form_模板封面')" property="previewImg" error-display-type="normal">
                        <src-input v-model="dialog.formData.previewImg" file-type="img" @change="handleImgChange" />
                    </bk-form-item>
                </section>
                <section v-if="iamNoResourcesPerm[$IAM_ACTION.manage_platform[0]] && actionType === 'update'" style="margin-top: 20px;">
                    <bk-form-item :label="$t('form_设为公开模板')" required property="isOffcial" error-display-type="normal">
                        <bk-radio-group v-model="dialog.formData.isOffcial">
                            <bk-radio :value="1" style="margin-right: 20px;">{{ $t('是') }}</bk-radio>
                            <bk-radio :value="0">{{ $t('否') }}</bk-radio>
                        </bk-radio-group>
                    </bk-form-item>
                    <bk-form-item :label="$t('form_公开模板分类')" required property="offcialType" error-display-type="normal">
                        <bk-select
                            :clearable="false"
                            v-model="dialog.formData.offcialType"
                        >
                            <bk-option v-for="item in offcialTypeList" :id="item.id" :name="item.name" :key="item.id">
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
                <bk-button :disabled="dialog.loading" @click="() => isShow = false">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    import { PAGE_TEMPLATE_TYPE } from '@/common/constant'
    import { mapGetters } from 'vuex'
    import templateMixin from './template-mixin'
    import SrcInput from '@/components/src-input/index.vue'

    export default {
        name: 'template-dialog',
        components: {
            SrcInput
        },
        mixins: [templateMixin],
        props: {
            actionType: {
                type: String,
                default: 'update'
            },
            refreshList: {
                type: Function
            }
        },
        data () {
            return {
                isShow: false,
                categoryList: [],
                offcialTypeList: PAGE_TEMPLATE_TYPE,
                templateId: '',
                fromTemplate: {},
                dialog: {
                    loading: false,
                    formData: {
                        templateName: '',
                        categoryId: '',
                        previewImg: '',
                        isOffcial: 0,
                        offcialType: ''
                    },
                    formRules: {
                        templateName: [
                            {
                                required: true,
                                message: window.i18n.t('必填项'),
                                trigger: 'blur'
                            },
                            {
                                max: 50,
                                message: window.i18n.t('名称不能超过40个字符'),
                                trigger: 'blur'
                            }
                        ],
                        categoryId: [
                            {
                                required: true,
                                message: window.i18n.t('必选项'),
                                trigger: 'blur'
                            }
                        ]
                    }
                }
            }
        },
        computed: {
            ...mapGetters(['iamNoResourcesPerm']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            dialogTitle () {
                return this.actionType === 'apply' ? window.i18n.t('添加模板【{0}】到本应用，请重命名模板', [this.fromTemplate.templateName]) : window.i18n.t('编辑模板')
            },
            actionName () {
                return this.actionType === 'apply' ? window.i18n.t('添加模板') : window.i18n.t('编辑模板')
            }
        },
        watch: {
            isShow (val) {
                if (val) {
                    if (this.actionType === 'apply') {
                        this.dialog.formData.categoryId = (this.categoryList[0] && this.categoryList[0].id) || ''
                    }
                    setTimeout(() => {
                        this.$refs.nameInput && this.$refs.nameInput.$el.querySelector('input').focus()
                    }, 50)
                }
            }
        },
        created () {
            this.getTemplateCategory()
        },
        methods: {
            handleImgChange (value) {
                this.dialog.formData.previewImg = value
            },
            toggleCategory (open = false) {
                if (open) {
                    this.getTemplateCategory()
                }
            },
            async getTemplateCategory () {
                try {
                    this.categoryList = await this.$store.dispatch('pageTemplate/categoryList', { projectId: this.projectId })
                } catch (e) {
                    this.categoryList = []
                }
            },
            async handleDialogConfirm () {
                await this.$refs.pageTemplateFrom.validate()
                try {
                    this.dialog.loading = true
                    const { formData = {} } = this.dialog
                    const params = {
                        templateName: formData.templateName,
                        categoryId: formData.categoryId,
                        belongProjectId: this.projectId,
                        fromPageCode: this.fromTemplate.fromPageCode,
                        previewImg: formData.previewImg || undefined
                    }
                    if (this.actionType !== 'apply' && this.iamNoResourcesPerm[this.$IAM_ACTION.manage_platform[0]]) {
                        if (formData.isOffcial && !formData.offcialType) {
                            this.$bkMessage({
                                theme: 'error',
                                message: window.i18n.t('公开模板分类不能为空')
                            })
                            return
                        } else {
                            Object.assign(params, { isOffcial: formData.isOffcial, offcialType: formData.offcialType })
                        }
                    }
                    const data = {
                        id: this.templateId,
                        fromProjectId: this.fromTemplate.belongProjectId,
                        params,
                        templateInfo: [{ templateName: formData.templateName, belongProjectId: this.projectId, versionId: this.versionId, categoryId: formData.categoryId }]
                    }
                    if (this.actionType === 'apply') {
                        const { varList, funcList } = await this.getVarAndFuncList(this.fromTemplate)
                        Object.assign(data, { varList, funcList })
                    }
                    const res = await this.$store.dispatch(`pageTemplate/${this.actionType}`, data)
                    if (res) {
                        this.$bkMessage({
                            theme: 'success',
                            message: window.i18n.t('{0}成功', [this.actionName])
                        })
                        this.refreshList(params)
                        this.isShow = false
                    }
                } catch (err) {
                    this.$bkMessage({
                        theme: 'error',
                        message: err.message || err
                    })
                } finally {
                    this.dialog.loading = false
                }
            }
        }
    }
</script>

<style lang="postcss">
    .template-edit-dialog {
        /* z-index: 2008 !important; */
        .bk-dialog-body {
            padding: 10px 15px 25px;
        }
    }
</style>
