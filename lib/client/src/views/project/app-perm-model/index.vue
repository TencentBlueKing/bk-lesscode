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
                        <p>3. 系统管理员可以管理本应用各个操作的权限，默认为本应用创建者</p>
                        <p>4. 应用未部署至生产环境时，系统管理员不可修改；部署至生产环境之后，修改系统管理员需要去权限中心设置</p>
                    </div>
                </template>
            </bk-alert>
        </section>
        <div class="system-manager-wrapper">
            <div class="label">系统管理员: </div>
            <div class="inner">
                <div style="display: flex; align-items: center;" v-if="String(currentProject.isRegistryInIam) === '0'">
                    <span>{{currentProject.createUser}}</span>
                </div>
                <div v-else>
                    应用已部署至生产环境，请去<span class="already-deploy-msg" @click="goSystemManager">权限中心</span>查看或修改系统管理员
                </div>
            </div>
        </div>
        <bk-button theme="primary" title="新建" style="margin-bottom: 16px;" @click="createNewPerm">
            新建
        </bk-button>

        <bk-table :data="iamAppPermModelList"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            v-bkloading="{ isLoading }"
            class="app-perm-model-table">
            <!-- { actionName: '页面访问', actionId: 'access_page', actionType: '查看(view)', actionDesc: '页面访问权限', relatedResource: ''} -->
            <bk-table-column label="操作名称" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    {{row.actionName}}<span class="buildin" v-if="row.actionId === 'access_page'">内置</span>
                </template>
            </bk-table-column>
            <bk-table-column label="操作ID" prop="actionId" show-overflow-tooltip></bk-table-column>
            <bk-table-column label="操作类型" prop="actionType" show-overflow-tooltip></bk-table-column>
            <bk-table-column label="操作描述" prop="actionDesc" show-overflow-tooltip></bk-table-column>
            <bk-table-column label="关联资源">
                <template slot-scope="{ row }">
                    <div class="related-resource-wrapper" v-if="row.actionRelatedResourceId.length">
                        <div class="related-resource-item" v-for="(item, index) in row.actionRelatedResourceId" :key="index">
                            <span class="item-name">{{item.pageName}}</span>
                        </div>
                    </div>
                    <div v-else>--</div>
                </template>
            </bk-table-column>
            <bk-table-column label="操作">
                <template slot-scope="{ row }">
                    <span class="table-btn" @click="showUpdate(row)">编辑</span>
                    <span class="table-btn" :class="row.actionId === 'access_page' ? 'disable' : ''" v-bk-tooltips="{
                        content: '内置权限，无法删除',
                        placements: ['right'],
                        disabled: row.actionId !== 'access_page'
                    }" @click="deleteAction(row)">删除</span>
                </template>
            </bk-table-column>
        </bk-table>
        <app-perm-model-sideslider
            :is-show="isShowSideslider"
            :cur-update="curUpdate"
            :is-default-action="true"
            @hide-sideslider="hideSideslider"
            @success="sidesliderSuccess"
        />
    </article>
</template>

<script>
    import { mapGetters } from 'vuex'

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
                iamAppPermModelList: []
            }
        },

        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            ...mapGetters('project', ['currentProject']),
            projectId () {
                return this.$route.params.projectId
            }
        },

        async created () {
            await this.fetchIamAppPermModel()
        },

        methods: {
            async fetchIamAppPermModel () {
                this.isLoading = true
                try {
                    const list = await this.$store.dispatch('iam/getIamAppPermModel', { projectId: this.projectId })
                    this.iamAppPermModelList.splice(0, this.iamAppPermModelList.length, ...list)
                } catch (e) {
                    console.error(e)
                } finally {
                    this.isLoading = false
                }
            },

            createNewPerm () {
                this.isShowSideslider = true
            },

            showUpdate (row) {
                this.isShowSideslider = true
                this.curUpdate = Object.assign({}, row)
            },

            hideSideslider () {
                console.error('hideSideslider')
                this.isShowSideslider = false
                this.curUpdate = Object.assign({}, {})
            },

            async sidesliderSuccess () {
                console.error(1)
                this.hideSideslider()
            },

            goSystemManager () {
                window.open(`${BK_IAM_HOST}/administrator`, '_blank')
            },

            deleteAction (row) {
                if (row.actionId === 'access_page') {
                    return
                }
                console.error(row)
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
            line-height: 18px;
            color: #ea3636;
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
    }
</style>
