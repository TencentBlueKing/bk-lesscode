<template>
    <article class="app-perm-model-main">
        <section class="app-perm-model-head">
            <bk-alert type="info" closable style="flex: 1">
                <template slot="title">
                    <div>应用权限模型：即应用内部权限控制模型设计</div>
                    <div class="tips">
                        <p>注意：</p>
                        <p>1. 应用权限模型在应用预览环境、预发布环境不生效</p>
                        <p>2. 应用需部署至生产环境后，最新权限模型方可在生产环境生效</p>
                        <p>3. 应用未部署至生产环境时，系统管理员默认为本应用创建者，并不可修改；应用部署至生产环境之后，系统管理员可在权限中心设置</p>
                        <p>4. 系统管理员可以设置该应用的系统管理员，设置入口：权限中心 -> 权限管理 -> 系统管理员</p>
                        <p>5. 系统管理员也可以设置该应用的权限审批流程，设置入口：权限中心 -> 权限管理 -> 审批流程</p>
                        <p>6. 权限中心自定义权限默认审批流程为：【审批节点：申请人上级审批确认 -> 系统管理员审批】，系统管理员可根据自己的需求修改审批流程</p>
                    </div>
                </template>
            </bk-alert>
        </section>
        <div class="system-manager-wrapper">
            <div class="label">系统管理员: </div>
            <div class="inner">
                <div style="display: flex; align-items: center;" v-if="String(iamAppPerm.deployed) === '0'">
                    <span>{{iamAppPerm.createUser}}</span>
                </div>
                <div v-else>
                    应用已部署至生产环境，请去<span class="already-deploy-msg" @click="goSystemManager">权限中心</span>查看或修改系统管理员
                </div>
            </div>
        </div>
        <bk-button theme="primary" title="新建" style="margin-bottom: 16px;" @click="showCreate">
            新建
        </bk-button>

        <bk-table :data="iamAppPermActionList"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            v-bkloading="{ isLoading }"
            class="app-perm-model-table">
            <!-- { actionName: '页面访问', actionId: 'IAM_APP_PERM_BUILDIN_ACTION', actionType: '查看(view)', actionDesc: '页面访问权限', relatedResource: ''} -->
            <bk-table-column label="操作名称" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    {{row.actionName}}<span class="buildin" v-if="row.actionId === IAM_APP_PERM_BUILDIN_ACTION">内置</span>
                </template>
            </bk-table-column>
            <bk-table-column label="操作ID" prop="actionId" show-overflow-tooltip></bk-table-column>
            <bk-table-column label="操作类型" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    <div v-if="row.actionType" :title="row.actionType">{{row.actionType}}</div>
                    <div v-else>--</div>
                </template>
            </bk-table-column>
            <bk-table-column label="操作描述" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    <div v-if="row.actionDesc" :title="row.actionDesc">{{row.actionDesc}}</div>
                    <div v-else>--</div>
                </template>
            </bk-table-column>
            <bk-table-column label="关联资源" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    <div class="related-resource-wrapper" v-if="row.actionRelatedResourceList.length">
                        <div class="related-resource-item" v-for="(item, index) in row.actionRelatedResourceList" :key="index">
                            <span class="item-name">{{item.pageName}}</span>
                        </div>
                    </div>
                    <div v-else>--</div>
                </template>
            </bk-table-column>
            <bk-table-column label="引用" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    <template v-if="row.pageComponentRef && row.pageComponentRef.length">
                        <bk-popover placement="top">
                            <span style="cursor: pointer; color: #3a84ff;">{{row.pageComponentRef.length}}</span>
                            <div slot="content" style="white-space: normal;">
                                <div v-for="(str, index) in row.pageComponentRefStrList" :key="index">
                                    {{str}}
                                </div>
                            </div>
                        </bk-popover>
                    </template>
                    <template v-else>
                        --
                    </template>
                </template>
            </bk-table-column>
            <bk-table-column label="是否同步到权限中心" :render-header="renderHeader">
                <template slot-scope="{ row }">
                    <div v-if="row.registeredStatus === 1" style="color: #2dcb56">已同步</div>
                    <div v-else-if="row.registeredStatus === 0" style="color: #979ba5">未同步</div>
                    <div v-else style="color: #ff9c01">已更新未同步</div>
                </template>
            </bk-table-column>
            <bk-table-column label="操作">
                <template slot-scope="{ row }">
                    <span class="table-btn" @click="showUpdate(row)">编辑</span>
                    <template v-if="row.pageComponentRef && row.pageComponentRef.length">
                        <span class="table-btn disable" v-bk-tooltips="{ content: '该操作已被绑定，无法删除', placements: ['right'] }">
                            删除
                        </span>
                    </template>
                    <template v-else>
                        <span class="table-btn" :class="row.actionId === IAM_APP_PERM_BUILDIN_ACTION ? 'disable' : ''" v-bk-tooltips="{
                            content: '内置权限，无法删除',
                            placements: ['right'],
                            disabled: row.actionId !== IAM_APP_PERM_BUILDIN_ACTION
                        }" @click="showDelete(row)">删除</span>
                    </template>
                </template>
            </bk-table-column>
            <empty-status slot="empty"></empty-status>
        </bk-table>

        <app-perm-model-sideslider
            :is-show="isShowSideslider"
            :cur-update="curUpdate"
            :iam-app-perm="iamAppPerm"
            :is-default-action="isDefaultAction"
            @hide-sideslider="hideSideslider"
            @success="sidesliderSuccess"
        />

        <bk-dialog v-model="delObj.show"
            render-directive="if"
            theme="primary"
            ext-cls="delete-dialog-wrapper"
            title="确定删除？"
            width="400"
            footer-position="center"
            :mask-close="false"
            :auto-close="false">
            <p class="delete-content">{{ delObj.nameTips }}</p>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="danger"
                    :loading="delObj.loading"
                    @click="deleteAction">删除</bk-button>
                <bk-button @click="delObj.show = false" :disabled="delObj.loading">取消</bk-button>
            </div>
        </bk-dialog>
    </article>
</template>

<script>
    import { mapGetters } from 'vuex'

    import { IAM_APP_PERM_BUILDIN_ACTION } from 'shared/constant'
    import AppPermModelSideslider from './app-perm-model-sideslider.vue'

    export default {
        components: {
            AppPermModelSideslider
        },
        data () {
            return {
                isLoading: false,
                isShowSideslider: false,
                curUpdate: {},
                isDefaultAction: false,
                iamAppPermActionList: [],
                iamAppPerm: {},
                IAM_APP_PERM_BUILDIN_ACTION: IAM_APP_PERM_BUILDIN_ACTION,
                delObj: {
                    action: {},
                    loading: false,
                    show: false
                }
            }
        },

        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            }
        },

        async created () {
            this.isLoading = true
            await Promise.all([
                this.fetchIamAppPerm(),
                this.fetchIamAppPermAction()
            ])
            this.isLoading = false
        },

        methods: {
            async fetchIamAppPerm () {
                try {
                    const res = await this.$store.dispatch('iam/getIamAppPerm', { projectId: this.projectId })
                    this.iamAppPerm = Object.assign({}, res)
                } catch (e) {
                    console.error(e)
                }
            },

            async fetchIamAppPermAction () {
                try {
                    const list = await this.$store.dispatch('iam/getIamAppPermAction', { projectId: this.projectId })
                    list.forEach(item => {
                        item.pageComponentRefStrList = (item.pageComponentRef || []).map(
                            ref => `页面【${ref.pageCode}】内的【${ref.componentId}】组件`
                        )
                    })
                    this.iamAppPermActionList.splice(0, this.iamAppPermActionList.length, ...list)
                } catch (e) {
                    console.error(e)
                }
            },

            showCreate () {
                this.isDefaultAction = false
                this.isShowSideslider = true
            },

            showUpdate (row) {
                this.isDefaultAction = row.actionId === IAM_APP_PERM_BUILDIN_ACTION
                this.isShowSideslider = true
                this.curUpdate = Object.assign({}, row)
            },

            hideSideslider () {
                this.isDefaultAction = false
                this.isShowSideslider = false
                this.curUpdate = Object.assign({}, {})
            },

            async sidesliderSuccess () {
                this.hideSideslider()
                this.isLoading = true
                await this.fetchIamAppPermAction()
                this.isLoading = false
            },

            goSystemManager () {
                window.open(`${BK_IAM_HOST}/administrator`, '_blank')
            },

            showDelete (row) {
                if (row.actionId === IAM_APP_PERM_BUILDIN_ACTION) {
                    return
                }
                this.delObj.show = true
                this.delObj.action = Object.assign({}, row)
                this.delObj.nameTips = `删除操作【${row.actionName}】`
            },

            async deleteAction () {
                this.delObj.loading = true
                try {
                    // 之前没有部署过的操作，直接删除
                    if (this.delObj.action.registeredStatus === 0) {
                        await this.$store.dispatch('iam/deleteIamAppPermAction', {
                            projectId: this.projectId,
                            actionId: this.delObj.action.id
                        })
                    } else {
                        // 之前部署过，删除即是把 deleteFlag 置为 -1
                        const params = {
                            // 这里传入 projectId 是为了 /iam/app-perm-model-action 接口 权限中心鉴权
                            projectId: this.projectId,
                            actionId: this.delObj.action.id,
                            fields: {
                                deleteFlag: 1
                            }
                        }
                        await this.$store.dispatch('iam/updateIamAppPermAction', { data: params })
                    }
                    this.delObj.action = Object.assign({}, {})
                    this.delObj.show = false
                    this.messageSuccess('删除成功')
                    this.sidesliderSuccess()
                } catch (e) {
                    console.error(e)
                } finally {
                    this.delObj.loading = false
                }
            },

            renderHeader (h, data) {
                const directive = {
                    name: 'bkTooltips',
                    content: '应用部署生产环境后会自动同步至权限中心',
                    placement: 'top'
                }
                return <a class="custom-header-cell" v-bk-tooltips={ directive }>{ data.column.label }</a>
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .app-perm-model-main {
        padding: 16px 24px;
    }
    .system-manager-wrapper {
        width: 500px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 16px;
        .already-deploy-msg {
            color: #3a84ff;
            cursor: pointer;
        }
        .label {
            flex-basis: 16%;
            flex-grow: 0;
            flex-shrink: 0;
        }
        .inner {
            flex-basis: 84%;
            flex-grow: 0;
            flex-shrink: 0;
            position: relative;
            display: flex;
            align-items: center;
        }
    }
    .app-perm-model-head {
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        .tips {
            margin-top: 10px;
            line-height: 20px;
            color: #63656e;
            font-weight: 400;
        }
    }
    .app-perm-model-table {
        height: calc(100% - 46px);
        /deep/ .bk-table-body-wrapper {
            height: calc(100% - 43px);
            overflow-y: auto;
        }
        th.is-leaf {
            border: none;
        }
        &:before {
            height: 0;
        }

        .buildin {
            position: absolute;
            display: inline-block;
            padding: 0 10px;
            line-height: 20px;
            background-color: #f0f1f5;
            border-radius: 2px;
            font-size: 12px;
            height: 22px;
            margin-left: 4px;
            top: 11px;
        }

        .table-btn {
            color: #3a84ff;
            margin-right: 12px;
            display: inline-block;
            cursor: pointer;
            &.disable {
                color: #b9bbc1;
                cursor: not-allowed;
            }
        }

        .related-resource-wrapper {
            display: flex;
            flex-flow: wrap;
            margin-top: 6px;
        }
        .related-resource-item {
            position: relative;
            display: inline-block;
            margin: 0 6px 6px 0;
            padding: 0 10px;
            line-height: 22px;
            background-color: #f0f1f5;
            border-radius: 2px;
            font-size: 12px;
            .item-name {
                display: inline-block;
                max-width: 200px;
                line-height: 13px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                vertical-align: text-top;
            }
        }

        /deep/ .custom-header-cell {
            color: inherit;
            text-decoration: underline;
            text-decoration-style: dashed;
            text-underline-position: under;
        }
    }
</style>
