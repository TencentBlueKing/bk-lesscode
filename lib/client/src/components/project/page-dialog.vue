<template>
    <section>
        <bk-dialog v-model="dialog.visible"
            render-directive="if"
            theme="primary"
            :title="title"
            width="750"
            :mask-close="false"
            :auto-close="false"
            header-position="left"
            ext-cls="page-operate-dialog"
        >
            <bk-form ref="dialogForm" class="dialog-form" :label-width="200" form-type="vertical" :rules="dialog.formRules" :model="dialog.formData">
                <bk-form-item :label="$t('form_页面名称')" required property="pageName" error-display-type="normal">
                    <bk-input ref="projectDialogInput"
                        maxlength="60"
                        v-model.trim="dialog.formData.pageName"
                        :placeholder="$t('请输入页面名称，60个字符以内')">
                    </bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('页面ID')" required property="pageCode" v-if="action !== 'rename'" error-display-type="normal">
                    <bk-input maxlength="60" v-model.trim="dialog.formData.pageCode"
                        :placeholder="$t('以小写字母开头，由字母与数字组成，创建后不可更改')">
                    </bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('form_页面路由')" required property="pageRoute" v-if="action !== 'rename'"
                    error-display-type="normal">
                    <bk-input maxlength="60" v-model.trim="dialog.formData.pageRoute"
                        :placeholder="$t('由数字、字母、下划线、中划线(-)、冒号(:)或反斜杠(/)组成')">
                        <template slot="prepend">
                            <div class="group-text">
                                {{layoutRoutePath}}
                            </div>
                        </template>
                    </bk-input>
                </bk-form-item>
            </bk-form>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :disabled="disabled"
                    :loading="dialog.loading"
                    @click="handleDialogConfirm">{{ $t('确定') }}</bk-button>
                <bk-button @click="handleDialogCancel" :disabled="dialog.loading">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { compile } from 'path-to-regexp'
    export default {
        name: 'page-dialog',
        props: {
            action: {
                type: String,
                default: ''
            },
            currentName: {
                type: String,
                default: ''
            },
            refreshList: {
                type: Function,
                default: () => {}
            }
        },
        data () {
            return {
                preName: '',
                title: '',
                actionName: '',
                requestMethod: '',
                layoutId: '',
                layoutList: [],
                selectedLayout: {},
                dialog: {
                    visible: false,
                    loading: false,
                    formData: {
                        id: '',
                        pageName: '',
                        pageCode: '',
                        pageRoute: ''
                    },
                    formRules: {
                        pageName: [
                            {
                                required: true,
                                message: this.$t('必填项'),
                                trigger: 'blur'
                            },
                            {
                                validator: this.checkName,
                                message: '该页面名称已存在',
                                trigger: 'blur'
                            }
                        ],
                        pageCode: [
                            {
                                required: true,
                                message: this.$t('必填项'),
                                trigger: 'blur'
                            },
                            {
                                regex: /^[a-z][a-zA-Z0-9]{0,60}$/,
                                message: this.$t('以小写字母开头，由字母与数字组成'),
                                trigger: 'blur'
                            },
                            {
                                validator: this.checkName,
                                message: '该页面ID已存在',
                                trigger: 'blur'
                            }
                        ],
                        pageRoute: [
                            {
                                required: true,
                                message: this.$t('必填项'),
                                trigger: 'blur'
                            },
                            {
                                validator: function (value) {
                                    try {
                                        compile(value)
                                        if (!/^[\w-_:\/?]+$/.test(value)) {
                                            this.message = this.$t('由数字、字母、下划线、中划线(-)、冒号(:)或反斜杠(/)组成')
                                            return false
                                        } else if (/\/{2,}/.test(value)) {
                                            this.message = this.$t('请检查路径正确性')
                                            return false
                                        }
                                    } catch (e) {
                                        this.message = this.$t('请检查路径正确性')
                                        return false
                                    }
                                    return true
                                },
                                trigger: 'blur'
                            }
                        ]
                    }
                },
                isAddNavList: true
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            disabled () {
                if (this.action === 'rename') {
                    return this.currentName === this.dialog.formData.pageName || !this.dialog.formData.pageName
                }
                return !this.dialog.formData.pageName || !this.dialog.formData.pageCode || !this.dialog.formData.pageRoute
            },
            layoutRoutePath () {
                const { routePath } = this.selectedLayout
                if (routePath) {
                    return routePath.endsWith('/') ? routePath : `${routePath}/`
                }
                return ''
            },
            isMobile () {
                return this.dialog.formData.pageType === 'MOBILE'
            }
        },
        watch: {
            'dialog.visible' (val) {
                if (val) {
                    setTimeout(() => {
                        this.$refs.projectDialogInput && this.$refs.projectDialogInput.$el.querySelector('input').focus()
                    }, 50)
                } else {
                    this.$emit('closeDialog')
                }
            },
            action: {
                handler: function (val) {
                    this.title = this.action === 'rename' ? this.$t('重命名') : this.$t('复制页面')
                    this.requestMethod = this.action === 'rename' ? 'page/update' : 'page/copy'
                    this.actionName = this.action === 'rename' ? this.$t('重命名') : this.$t('复制')
                },
                immediate: true
            },
            layoutId (layoutId) {
                if (this.action === 'copy' && layoutId) {
                    this.selectedLayout = this.layoutList.find(item => item.id === layoutId)
                }
            }
        },
        async created () {
            this.layoutList = await this.$store.dispatch('layout/getList', { projectId: this.projectId, versionId: this.versionId })
        },
        methods: {
            async checkName () {
                const nameExist = await this.$store.dispatch('page/checkName', {
                    data: {
                        pageName: this.dialog.formData.pageName,
                        pageCode: this.dialog.formData.pageCode,
                        projectId: this.projectId,
                        versionId: this.versionId,
                        currentName: this.currentName,
                        from: this.action,
                        blurCheck: true
                    }
                })
                if (nameExist) {
                    return false
                } else {
                    return true
                }
            },
            async handleDialogConfirm () {
                this.dialog.loading = true
                try {
                    await this.$refs.dialogForm.validate()

                    // 先校验是否重名
                    const formData = {
                        pageName: this.dialog.formData.pageName
                    }
                    if (this.action !== 'rename') {
                        formData.pageCode = this.dialog.formData.pageCode
                    }
                    const nameExist = await this.$store.dispatch('page/checkName', {
                        data: {
                            ...formData,
                            projectId: this.projectId,
                            versionId: this.versionId,
                            currentName: this.currentName,
                            from: this.action
                        }
                    })
                    if (nameExist) return

                    // 提交复制或重名数据
                    const pageData = this.action === 'copy' ? this.dialog.formData : { id: this.dialog.formData.id, pageName: this.dialog.formData.pageName }
                    const payload = {
                        data: {
                            pageData,
                            projectId: this.projectId,
                            versionId: this.versionId
                        }
                    }
                    const res = await this.$store.dispatch(this.requestMethod, payload)
                    if (res) {
                        this.$bkMessage({
                            theme: 'success',
                            message: this.$t('{0}成功', [this.actionName])
                        })
                        this.dialog.visible = false
                        this.refreshList(res)
                    }
                } catch (err) {
                    console.error(err)
                } finally {
                    this.dialog.loading = false
                }
            },
            handleDialogCancel () {
                this.dialog.visible = false
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .dialog-form {
        max-height: 446px;
        overflow-y: overlay;
        padding: 0 16px;
        @mixin scroller;

        /deep/ {
            .bk-form-control.control-prepend-group {
                background: #fff;
            }
            .bk-form-control .group-box .group-text {
                line-height: 30px;
                padding: 0 8px;
            }
        }
    }
</style>
<style lang="postcss">
    .page-operate-dialog {
        .bk-dialog-body {
            padding: 3px 6px 26px;
        }
    }
</style>
