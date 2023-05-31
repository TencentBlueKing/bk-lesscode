<template>
    <div class="basic page-content" v-bkloading="{ isLoading: pageLoading, opacity: 1 }">
        <div class="info-flexible" v-show="!pageLoading">
            <div class="title">{{ $t('基本信息') }}</div>
            <bk-form class="info-list" :label-width="150">
                <bk-form-item :label="$t('form_应用名称：')">
                    {{projectDetail.projectName}}
                </bk-form-item>
                <bk-form-item :label="$t('应用ID：')">
                    {{projectDetail.projectCode}}
                </bk-form-item>
                <bk-form-item :label="$t('form_绑定蓝鲸应用模块：')" :desc="$t('必须绑定“源码管理”方式为“蓝鲸可视化开发平台提供源码包”的蓝鲸应用模块,绑定后不能修改')">
                    <app-module-select :can-edit="true"></app-module-select>
                </bk-form-item>
                <bk-form-item :label="$t('form_应用简介：')">
                    {{projectDetail.projectDesc}}
                </bk-form-item>
                <bk-form-item :label="$t('form_创建人：')">
                    {{projectDetail.createUser}}
                </bk-form-item>
                <bk-form-item :label="$t('form_创建时间：')">
                    {{projectDetail.createTime | time}}
                </bk-form-item>
                <bk-form-item class="buttons">
                    <bk-button theme="primary" @click="handleEdit">{{ $t('编辑') }}</bk-button>
                    <!-- <bk-button :hover-theme="'danger'" @click="handleDelete">删除</bk-button> -->
                </bk-form-item>
            </bk-form>
        </div>

        <bk-dialog v-model="dialog.edit.visible"
            render-directive="if"
            theme="primary"
            :title="$t('编辑应用')"
            width="600"
            :mask-close="false"
            :auto-close="false"
            header-position="left">
            <bk-form ref="editForm" :label-width="$store.state.Language === 'en' ? 100 : 90" :rules="dialog.edit.formRules" :model="dialog.edit.formData">
                <bk-form-item :label="$t('form_应用名称')" required property="projectName">
                    <bk-input maxlength="20" v-model.trim="dialog.edit.formData.projectName"
                        :placeholder="$t('请输入应用名称，20个字符以内')">
                    </bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('应用ID')" required property="projectCode">
                    <bk-input disabled maxlength="60" v-model.trim="dialog.edit.formData.projectCode"
                        :placeholder="$t('请输入，由全小写字母组成，该ID将作为自定义组件前缀，创建后不可更改')">
                    </bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('form_应用简介')" required property="projectDesc">
                    <bk-input
                        v-model.trim="dialog.edit.formData.projectDesc"
                        :type="'textarea'"
                        :rows="3"
                        :maxlength="100">
                    </bk-input>
                </bk-form-item>
            </bk-form>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :disabled="!hasChange"
                    :loading="dialog.edit.loading"
                    @click="handleEditConfirm">{{ $t('确定') }}</bk-button>
                <bk-button @click="handleEditCancel" :disabled="dialog.edit.loading">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>

        <bk-dialog v-model="dialog.delete.visible"
            render-directive="if"
            theme="primary"
            ext-cls="delete-dialog-wrapper"
            :title="$t('确认删除该应用？')"
            width="500"
            footer-position="center"
            :mask-close="false"
            :auto-close="false">
            <bk-form ref="deleteForm" class="delete-form" :label-width="0" :rules="dialog.delete.formRules" :model="dialog.delete.formData">
                <p class="confirm-name">{{ $t('请输入') }}<em :title="$t('复制名称')">“{{projectDetail.projectName}}”</em>{{ $t('确认') }}</p>
                <bk-form-item property="projectName">
                    <bk-input
                        maxlength="60"
                        v-model.trim="dialog.delete.formData.projectName"
                        :placeholder="$t('请输入应用名称')">
                    </bk-input>
                </bk-form-item>
            </bk-form>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="danger"
                    :loading="dialog.delete.loading"
                    @click="handleDeleteConfirm">{{ $t('删除') }}</bk-button>
                <bk-button @click="handleDeleteCancel" :disabled="dialog.delete.loading">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </div>
</template>

<script>
    import dayjs from 'dayjs'
    import { bus } from '@/common/bus'
    import AppModuleSelect from '@/components/project/app-module-select'

    export default {
        filters: {
            time: function (value) {
                if (!value) return '--'
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
            }
        },
        components: {
            AppModuleSelect
        },
        data () {
            return {
                pageLoading: true,
                projectDetail: {},
                dialog: {
                    edit: {
                        visible: false,
                        loading: false,
                        formData: {},
                        formRules: {
                            projectName: [
                                {
                                    required: true,
                                    message: window.i18n.t('必填项'),
                                    trigger: 'blur'
                                }
                            ],
                            projectCode: [
                                {
                                    required: true,
                                    message: window.i18n.t('必填项'),
                                    trigger: 'blur'
                                },
                                {
                                    regex: /^[a-z]+$/,
                                    message: window.i18n.t('需由全小写字母组成'),
                                    trigger: 'blur'
                                }
                            ],
                            projectDesc: [
                                {
                                    required: true,
                                    message: window.i18n.t('必填项'),
                                    trigger: 'blur'
                                }
                            ]
                        }
                    },
                    delete: {
                        visible: false,
                        loading: false,
                        formData: {
                            projectName: ''
                        },
                        formRules: {
                            projectName: [
                                {
                                    required: true,
                                    message: window.i18n.t('必填项'),
                                    trigger: 'blur'
                                },
                                {
                                    validator: (val) => {
                                        return this.projectDetail.projectName === val
                                    },
                                    message: window.i18n.t('名称不一致，请重试'),
                                    trigger: 'blur'
                                }
                            ]
                        }
                    }
                }
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            },
            hasChange () {
                const formData = this.dialog.edit.formData
                const projectDetail = this.projectDetail
                return formData.projectName !== projectDetail.projectName || formData.projectDesc !== projectDetail.projectDesc
            }
        },
        created () {
            this.fetchData()
        },
        methods: {
            async fetchData () {
                this.pageLoading = true
                try {
                    this.projectDetail = await this.$store.dispatch('project/detail', { projectId: this.projectId }) || {}
                } catch (e) {
                    console.error(e)
                } finally {
                    this.pageLoading = false
                }
            },
            async handleEditConfirm () {
                try {
                    await this.$refs.editForm.validate()
                    this.dialog.edit.loading = true

                    const { id, projectName, projectDesc } = this.dialog.edit.formData
                    const data = {
                        id,
                        fields: { projectName, projectDesc }
                    }

                    if (projectName !== this.projectDetail.projectName) {
                        const checkNameResult = await this.checkProjectName(projectName)
                        if (!checkNameResult) {
                            return
                        }
                    }

                    await this.$store.dispatch('project/update', { data })

                    this.messageSuccess(window.i18n.t('应用编辑成功'))
                    this.dialog.edit.visible = false

                    this.projectDetail = { ...this.projectDetail, ...data.fields }
                    this.$store.commit('project/updateCurrentProject', data.fields)

                    bus.$emit('update-project-list')
                } catch (e) {
                    console.error(e)
                } finally {
                    this.dialog.edit.loading = false
                }
            },
            async handleDeleteConfirm () {
                try {
                    await this.$refs.deleteForm.validate()

                    const { id } = this.dialog.delete.formData
                    const data = { id }
                    this.dialog.delete.loading = true

                    await this.$store.dispatch('project/delete', { config: { data } })

                    this.messageSuccess(window.i18n.t('删除成功'))
                    this.dialog.delete.visible = false

                    this.getProjectList()
                } catch (e) {
                    console.error(e)
                } finally {
                    this.dialog.delete.loading = false
                }
            },
            async checkProjectName (name) {
                const res = await this.$store.dispatch('project/checkname', {
                    data: { name }
                })
                if (res.code !== 0) {
                    return false
                }
                return true
            },
            handleEdit () {
                this.dialog.edit.visible = true
                this.dialog.edit.formData = { ...this.projectDetail }
            },
            async handleDelete (project) {
                this.dialog.delete.visible = true
                this.dialog.delete.formData.id = project.id
            },
            handleEditCancel () {
                this.dialog.edit.visible = false
            },
            handleDeleteCancel () {
                this.dialog.delete.visible = false
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .basic {
        padding: 30px 24px;

        .title {
            font-size: 14px;
            font-weight: 700;
            color: #63656E;
        }

        .info-list {
            padding: 42px 42px 8px 42px;
        }

        .buttons {
            button {
                min-width: 86px;
                vertical-align: middle;
                & + button {
                    margin-left: 4px;
                }
            }
        }

        /deep/ {
            .bk-label {
                .bk-label-text {
                    font-size: 12px;
                    font-weight: 700;
                }
            }
            .bk-form-content {
                font-size: 12px;
                line-height: 32px;
            }
        }
    }

    /deep/ .delete-dialog-wrapper {
        .delete-form {
            .confirm-name {
                margin: 16px 0 8px 0;
                font-size: 14px;
                em {
                    font-style: normal;
                    font-weight: 700;
                    cursor: pointer;
                }
            }
        }
        .bk-dialog-footer {
            text-align: center;
            padding: 0 65px 40px;
            background-color: #fff;
            border: none;
            border-radius: 0;
        }
        .dialog-footer {
            button {
                width: 86px;
            }
        }
    }
</style>
