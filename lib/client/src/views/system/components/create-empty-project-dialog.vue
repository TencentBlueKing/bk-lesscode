<template>
    <!-- 创建应用弹窗 -->
    <bk-dialog v-model="visible"
        render-directive="if"
        theme="primary"
        width="750"
        :position="{ top: 100 }"
        :mask-close="false"
        :auto-close="false"
        header-position="left"
        ext-cls="project-create-dialog">
        <span slot="header" style="display: flex;align-items: center;">
            {{ createDialogTitle }}
            <i class="bk-icon icon-info-circle" style="font-size: 14px;margin-left: 2px;"
                v-bk-tooltips.top="{ content: $t('创建Lesscode应用时，会同步在PaaS平台-开发者中心创建应用的default模块'), maxWidth: 400 }">
            </i>
        </span>
        <!-- 表单组件，根据projectType来判断是创建空白应用还是导入应用，还是从已有模板选择 -->
        <project-form
            ref="projectForm"
            :type="projectType"
            :props-form-data="formData"
            :default-layout-list="defaultLayoutList">
        </project-form>
        <div class="dialog-footer" slot="footer">
            <bk-button
                theme="primary"
                :loading="loading"
                @click="handleCreateConfirm">{{ $t('确定') }}</bk-button>
            <bk-button @click="handleCancel('create')" :disabled="loading">{{ $t('取消') }}</bk-button>
        </div>
    </bk-dialog>
</template>

<script>
    import ProjectForm from '../components/project-form'
    import { bus } from '@/common/bus'

    export default {
        components: {
            ProjectForm
        },
        data () {
            return {
                visible: false,
                loading: false,
                projectType: 'newProject',
                formData: {},
                defaultLayoutList: [],
                layoutFullList: []
            }
        },
        computed: {
            createDialogTitle () {
                return this.projectType === 'copyProject' ? window.i18n.t('复制应用') : (this.projectType === 'importProject') ? window.i18n.t('导入应用') : window.i18n.t('新建应用')
            }
        },
        created () {
            this.getDefaultLayout()
        },
        methods: {
            handleGotoPage (projectId) {
                bus.$emit('update-project-info')
                // 开发应用和页面管理时调用跳到@/views/project/page-manage
                this.$router.replace({
                    name: 'pageList',
                    params: {
                        projectId
                    }
                })
            },
            async getDefaultLayout () {
                try {
                    const layoutList = await this.$store.dispatch('layout/getPlatformList')
                    layoutList.forEach(item => {
                        const isEmptyType = ['empty', 'mobile-empty'].includes(item.type)
                        item.isDefault = isEmptyType
                        item.checked = isEmptyType
                        item.disabled = isEmptyType
                    })
                    this.layoutFullList = layoutList
                    this.defaultLayoutList = this.layoutFullList.filter(item => item.type !== 'mobile-empty')
                } catch (e) {
                    console.error(e)
                }
            },
            async handleCreateConfirm () {
                try {
                    const data = this.$refs.projectForm.formData || {}
                    await this.$refs.projectForm.validate()

                    const projectType = this.projectType

                    let actionMethod = 'project/create'
                    if (projectType === 'newProject') {
                        const layouts = this.layoutFullList.filter(layout => layout.checked || layout.type === 'mobile-empty').map(layout => {
                            return {
                                layoutId: layout.id,
                                routePath: layout.defaultPath,
                                isDefault: layout.isDefault,
                                showName: layout.defaultName,
                                layoutCode: layout.defaultCode,
                                content: layout.defaultContent,
                                layoutType: layout.layoutType
                            }
                        })
                        data.layouts = layouts
                    } else if (projectType === 'importProject') {
                        actionMethod = 'project/import'
                        const importProjectData = this.$refs.projectForm?.importProjectData || {}
                        if (typeof importProjectData?.route !== 'object' || typeof importProjectData?.func !== 'object' || typeof importProjectData?.page !== 'object') {
                            this.$bkMessage({
                                theme: 'error',
                                message: window.i18n.t('请先上传符合规范的应用json')
                            })
                            return
                        }
                        Object.assign(data, { importProjectData, copyFrom: undefined })
                    }
                    
                    this.loading = true
                    const projectId = await this.$store.dispatch(actionMethod, { data })

                    this.messageSuccess(window.i18n.t('应用创建成功'))
                    this.visible = false

                    setTimeout(() => {
                        this.handleGotoPage(projectId)
                    }, 300)
                } catch (e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            },
            handleCancel () {
                this.visible = false
            }
        }
    }
</script>

<style lang="postcss">
    .project-create-dialog {
        .bk-dialog-header {
            padding-bottom: 10px;
        }
    }
</style>
