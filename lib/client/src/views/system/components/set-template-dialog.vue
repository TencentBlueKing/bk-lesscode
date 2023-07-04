<template>
    <section>
        <bk-dialog v-model="isShow"
            render-directive="if"
            theme="primary"
            :title="$t('设置模板')"
            width="600"
            :mask-close="false"
            :auto-close="false"
            header-position="left"
            ext-cls="set-template-dialog header-small-padding-dialog"
        >
            <bk-form ref="pageTemplateFrom" class="dialog-form" :label-width="300" form-type="vertical">
                <bk-form-item :label="$t('form_是否公开')" required property="isOffcial" error-display-type="normal">
                    <bk-radio-group v-model="formData.isOffcial">
                        <bk-radio :value="1" style="margin-right: 20px;">{{ $t('是') }}</bk-radio>
                        <bk-radio :value="0">{{ $t('否') }}</bk-radio>
                    </bk-radio-group>
                </bk-form-item>
                <section v-if="formData.isOffcial">
                    <bk-form-item :label="$t('form_模板封面')" property="templateImg" error-display-type="normal" style="margin-top: 20px">
                        <src-input v-model="formData.templateImg" :project-id="projectId" file-type="img" @change="handleImgChange" />
                    </bk-form-item>
                    <bk-form-item :label="$t('form_应用模板分类')" required property="offcialType" error-display-type="normal">
                        <bk-select
                            :clearable="false"
                            v-model="formData.offcialType"
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
                    :loading="isLoading"
                    @click="handleDialogConfirm">{{ $t('确定') }}</bk-button>
                <bk-button :disabled="isLoading" @click="() => isShow = false">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    import { PROJECT_TEMPLATE_TYPE } from '@/common/constant'
    import SrcInput from '@/components/src-input/index.vue'

    export default {
        name: 'template-dialog',
        components: {
            SrcInput
        },
        props: {
            refreshList: {
                type: Function
            }
        },
        data () {
            return {
                projectId: 0,
                isShow: false,
                isLoading: false,
                offcialTypeList: PROJECT_TEMPLATE_TYPE,
                formData: {
                    isOffcial: 0,
                    offcialType: '',
                    templateImg: ''
                }
            }
        },
        methods: {
            handleImgChange (value) {
                this.formData.templateImg = value
            },
            async handleDialogConfirm () {
                try {
                    this.isLoading = true
                    let params = {}
                    if (this.formData.isOffcial && !this.formData.offcialType) {
                        this.$bkMessage({
                            theme: 'error',
                            message: window.i18n.t('模板分类不能为空')
                        })
                        return
                    } else {
                        params = {
                            isOffcial: this.formData.isOffcial,
                            offcialType: this.formData.isOffcial ? this.formData.offcialType : '',
                            templateImg: this.formData.isOffcial ? this.formData.templateImg : ''
                        }
                    }
                    const data = {
                        id: this.projectId,
                        fields: params
                    }
                    const res = await this.$store.dispatch('project/update', { data })
                    if (res) {
                        this.isShow = false
                        this.refreshList()
                        this.$bkMessage({
                            theme: 'success',
                            message: window.i18n.t('设置成功')
                        })
                    }
                } catch (err) {
                    this.$bkMessage({
                        theme: 'error',
                        message: err.message || err
                    })
                } finally {
                    this.isLoading = false
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
