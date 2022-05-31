<template>
    <div class="flow-manage-home">
        <div class="operation-area">
            <bk-button theme="primary" @click="isCreateDialogShow = true">新建</bk-button>
            <div class="search-wrapper">
                <bk-input
                    placeholder="请输入流程名称"
                    style="width: 360px;"
                    right-icon="bk-icon icon-search">
                </bk-input>
                <div class="archived-icon" @click="$router.push({ name: 'flowArchivedList' })">
                    <i class="bk-drag-icon bk-drag-countdown"></i>
                </div>
            </div>
        </div>
        <bk-table
            v-bkloading="{ isloading: listLoading }"
            :data="flowList"
            :pagination="pagination"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            @page-change="handlePageChange"
            @page-limit-change="handlePageLimitChange">
            <bk-table-column label="流程名称" property="flowName" show-overflow-tooltip :min-width="120">
                <template slot-scope="{ row }">
                    <router-link
                        class="link-btn"
                        :to="{ name: 'flowConfig', params: { projectId, flowId: row.id } }">
                        {{ row.flowName }}
                    </router-link>
                </template>
            </bk-table-column>
            <bk-table-column label="流程描述" property="summary"></bk-table-column>
            <bk-table-column label="流程表单页">--</bk-table-column>
            <bk-table-column label="流程数据管理页">--</bk-table-column>
            <bk-table-column label="创建人" property="createUser"></bk-table-column>
            <bk-table-column label="创建时间" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    {{ row.createTime | timeFormatter }}
                </template>
            </bk-table-column>
            <bk-table-column label="操作" width="140">
                <template slot-scope="{ row }">
                    <router-link
                        class="link-btn"
                        :to="{ name: 'flowConfig', params: { projectId, flowId: row.id } }">
                        编辑
                    </router-link>
                    <bk-button
                        style="margin-left: 17px;"
                        theme="primary"
                        :text="true"
                        @click="handleArchiveClick">
                        归档
                    </bk-button>
                </template>
            </bk-table-column>
        </bk-table>
        <bk-dialog
            title="新建流程"
            header-position="left"
            render-directive="if"
            ext-cls="create-flow-dialog"
            :value="isCreateDialogShow"
            :width="480"
            :mask-close="false"
            :auto-close="false"
            @confirm="handleCreateConfirm"
            @cancel="isCreateDialogShow = false">
            <bk-form
                ref="createForm"
                form-type="vertical"
                :model="newFlowData"
                :rules="flowDataRule">
                <bk-form-item label="流程名称" property="name" :required="true">
                    <bk-input v-model="newFlowData.name" />
                </bk-form-item>
                <bk-form-item label="流程描述" property="desc">
                    <bk-input v-model="newFlowData.summary" type="textarea" :row="4" />
                </bk-form-item>
            </bk-form>
        </bk-dialog>
    </div>
</template>
<script>
    // import { mapGetters } from 'vuex'
    import dayjs from 'dayjs'
    import { messageError } from '@/common/bkmagic'

    export default {
        name: 'flowList',
        filters: {
            timeFormatter (val) {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'
            }
        },
        data () {
            return {
                flowList: [],
                listLoading: true,
                pagination: {
                    current: 1,
                    count: 0,
                    limit: 15
                },
                newFlowData: {
                    name: '',
                    summary: ''
                },
                flowDataRule: {
                    name: [{
                        required: true,
                        trigger: 'blur',
                        message: '必填项'
                    }]
                },
                isCreateDialogShow: false,
                createPending: false
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            },
            versionId () {
                return this.$store.state.projectVersion.currentVersion.id
            }
        },
        mounted () {
            this.getFlowList()
        },
        methods: {
            async getFlowList () {
                this.listLoading = true
                try {
                    this.flowList = await this.$store.dispatch('nocode/flow/getFlowList', {
                        projectId: this.projectId,
                        versionId: this.versionId
                    })
                } catch (err) {
                    messageError(err.message || err)
                } finally {
                    this.listLoading = false
                }
            },
            handleCreateConfirm () {
                this.$refs.createForm.validate().then(async () => {
                    this.createPending = true
                    try {
                        const { name, summary } = this.newFlowData
                        const params = {
                            name,
                            summary,
                            projectId: this.projectId,
                            versionId: this.versionId
                        }
                        await this.$store.dispatch('nocode/flow/createFlow', params)
                    } catch (e) {
                        console.error(e)
                    } finally {
                        this.createPending = false
                    }
                })
            },
            handleEditClick () {
                this.$router.push({ name: 'FlowEdit', params: { id: this.projectId } })
            },
            handleArchiveClick () {},
            handlePageChange () {},
            handlePageLimitChange () {}
        }
    }
</script>
<style lang="postcss" scoped>
    .flow-manage-home {
        padding: 16px 24px;
        height: 100%;
    }
    .operation-area {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    .search-wrapper {
        display: flex;
        align-items: center;
        .archived-icon {
            margin-left: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border: 1px solid #c4c6cc;
            border-radius: 2px;
            cursor: pointer;
            &:hover {
                i {
                    color: #3a84ff;
                }
            }
            i {
                font-size: 14px;
                transform: rotateY(180deg);
                color: #63656e;
            }
        }
    }
    .link-btn {
        color: #3a84ff;
    }
</style>
<style lang="postcss">
    .create-flow-dialog {
        .bk-dialog-header {
            padding-bottom: 10px;
        }
    }
</style>
