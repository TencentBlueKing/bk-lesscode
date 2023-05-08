<template>
    <article class="auth-manage-main">
        <section class="auth-manage-head">
            <bk-alert type="info" :title="$t('应用管理权限：即在平台中对该应用进行开发、部署、权限模型设计等的应用级管理权限')" closable style="flex: 1"></bk-alert>
        </section>

        <bk-table :data="renderList"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            v-bkloading="{ isLoading }"
            class="auth-manage-table">
            <bk-table-column :label="$t('table_操作类型')" prop="actionName" show-overflow-tooltip></bk-table-column>
            <bk-table-column :label="$t('table_权限说明')" prop="actionDesc" show-overflow-tooltip></bk-table-column>
            <bk-table-column :label="$t('table_关联用户组')" prop="createUser" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    <div class="group-wrapper" v-if="row.groups.length">
                        <div class="group-item" v-for="(item, index) in row.groups" :key="index">
                            <span class="group-name">
                                <i class="bk-drag-icon bk-drag-user-group group-icon"></i>
                                <span @click="goIamUserGroup(item)" :title="item.name" class="group-name-text">
                                    {{item.name}}
                                </span>
                            </span>
                        </div>
                    </div>
                    <div v-else>--</div>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('人员')" prop="updateTime" show-overflow-tooltip>
                <template slot-scope="{ row }">
                    <div class="user-wrapper" v-if="row.users.length">
                        <div class="user-item" v-for="(item, index) in row.users" :key="index">
                            <span class="user-name">{{item.id}}</span>
                        </div>
                    </div>
                    <div v-else>--</div>
                </template>
            </bk-table-column>
        </bk-table>
    </article>
</template>

<script>
    export default {
        data () {
            return {
                isLoading: false,
                name: '',
                queryActionList: [],
                renderList: []
            }
        },

        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },

        async created () {
            this.queryActionList.splice(0, this.queryActionList.length, ...[
                { actionId: this.$IAM_ACTION.develop_app[0], resourceId: this.projectId },
                { actionId: this.$IAM_ACTION.deploy_app[0], resourceId: this.projectId },
                { actionId: this.$IAM_ACTION.manage_perms_in_app[0], resourceId: this.projectId },
                { actionId: this.$IAM_ACTION.manage_app[0], resourceId: this.projectId }
            ])

            await this.getMember()
        },

        methods: {
            async getMember () {
                this.isLoading = true
                const params = {
                    projectId: this.projectId,
                    actions: this.queryActionList
                }
                try {
                    const data = await this.$store.dispatch('iam/getAuthSubject', {
                        data: params
                    })
                    const renderList = []
                    Object.keys(data).forEach(key => {
                        const v = data[key]
                        renderList.push({
                            actionName: v.actionName,
                            actionDesc: v.actionDesc,
                            groups: v.subject.filter(item => item.type === 'group'),
                            users: v.subject.filter(item => item.type === 'user')
                        })
                    })
                    this.renderList.splice(0, this.renderList.length, ...renderList)
                } catch (err) {
                    this.$bkMessage({ message: err.message || err, theme: 'error' })
                } finally {
                    this.isLoading = false
                }
            },
            goIamUserGroup (item) {
                window.open(`${BK_IAM_HOST}/user-group-detail/${item.id}`, '_blank')
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .auth-manage-main {
        padding: 16px 24px;
    }
    .auth-manage-head {
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        .auth-manage-head-input {
            width: 400px;
        }
    }
    .auth-manage-table {
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
        .max-tabel-prop {
            display: block;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: normal;
        }
        .user-wrapper {
            display: flex;
            flex-flow: wrap;
            margin-top: 6px;
        }
        .user-item {
            position: relative;
            display: inline-block;
            margin: 0 6px 6px 0;
            padding: 0 10px;
            line-height: 22px;
            background: #f0f1f5;
            border-radius: 2px;
            font-size: 12px;
            .user-name {
                display: inline-block;
                max-width: 200px;
                line-height: 13px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                vertical-align: text-top;
            }
        }

        .group-wrapper {
            display: flex;
            flex-flow: wrap;
            margin-top: 6px;
        }
        .group-item {
            position: relative;
            display: inline-block;
            margin: 0 6px 6px 0;
            padding: 0 10px;
            border-radius: 2px;
            font-size: 12px;
            .group-name {
                display: inline-block;
                max-width: 220px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                vertical-align: text-top;
                color: #3a84ff;
                .group-icon {
                    color: #3a84ff;
                    font-size: 14px;
                }
                .group-name-text {
                    font-size: 12px;
                    cursor: pointer;
                }
            }
        }
    }
</style>
