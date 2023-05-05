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
        <span slot="header">
            {{ createDialogTitle }}
            <i class="bk-icon icon-info-circle" style="font-size: 14px;" v-bk-tooltips.top="{ content: '创建Lesscode应用时，会同步在PaaS平台-开发者中心创建应用的default模块' }"></i>
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
                @click="handleCreateConfirm">确定</bk-button>
            <bk-button @click="handleCancel('create')" :disabled="loading">取消</bk-button>
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
                return this.projectType === 'copyProject' ? '复制应用' : (this.projectType === 'importProject') ? '导入应用' : '新建应用'
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
                                message: '请先上传符合规范的应用json'
                            })
                            return
                        }
                        Object.assign(data, { importProjectData, copyFrom: undefined })
                    }
                    
                    this.loading = true
                    const projectId = await this.$store.dispatch(actionMethod, { data })

                    this.messageSuccess('应用创建成功')
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

<style lang="postcss" scoped>
    .project-create-dialog {
        .layout-desc {
            font-size: 12px;
            color: #979BA5;
        }
        .layout-list {
            display: flex;
            margin-left: 10px;
            .list-item {
                position: relative;
                width: 158px;
                height: 120px;
                background: #ffffff;
                border-radius: 2px;
                &:hover {
                    .default-setting {
                        display: block;
                    }
                }
                .default-span {
                    position: absolute;
                    right: 0;
                    top: 0;
                    border-radius: 2px;
                    font-size: 12px;
                    padding: 0 5px;
                }
                .default-checked {
                    cursor: default;
                    color: #fff;
                    background: #FFB848;
                }
                .default-setting {
                    display: none;
                    background: #e1ecff;
                    color: #3a84ff;
                    cursor: pointer;
                }
                .checked-icon-div {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 34px;
                    height: 32px;
                    background: linear-gradient(135deg,transparent 50%,#3a84ff 50%);
                    border-radius: 0px 2px 0px;
                    text-align: right;
                    .checked-icon {
                        display: block;
                        color: #fff;
                        font-size: 20px;
                        margin: 12px 0 0 12px;
                    }
                }
            }
            .layout-empty-item {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #979ba5;
                font-size: 12px;
                border: 1px solid #c4c6cc;
                cursor: default;
            }
            .layout-item {
                cursor: pointer;
                border: 1px solid #dcdee5;
                margin-left: 12px;
                .layout-img {
                    margin: 6px 6px 0;
                    img {
                        width: 146px;
                        height: 88px;
                    }
                }
                .layout-info {
                    text-align: center;
                    font-size: 12px;
                    color: #63656e;
                }
            }
        }
    }
</style>
