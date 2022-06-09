<template>
    <article v-bkloading="{ isLoading }" :class="$style['credential-manage']">
        <section :class="$style['setting']">
            <span :class="$style['label']"><span v-bk-tooltips="bindInfoTips" :class="$style['bind-label']">绑定蓝鲸应用模块</span>：</span>
            <app-module-select></app-module-select>
        </section>

        <bk-table :data="tokenList"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            ext-cls="token-table"
            v-bkloading="{ isLoading: isLoadingToken }"
        >
            <span slot="empty" :class="$style['empty-tip']">
                <i class="bk-drag-icon bk-drag-info-tips" :class="$style['info-tips']"></i>
                <span>请先绑定蓝鲸应用模块后，</span><bk-button text @click="generateToken" :disabled="!currentAppInfo.appCode || !currentAppInfo.moduleCode">点击获取</bk-button>
            </span>
            <bk-table-column label="凭证Token" prop="token" show-overflow-tooltip>
                <template slot-scope="props">
                    <span v-if="props.row.token" class="token-wrap"><span class="token-txt">{{ props.row.token }}</span><i :class="[$style['fresh-token'], 'bk-drag-icon', 'bk-drag-reflash-line']" @click="generateToken" v-if="currentAppInfo.appCode && currentAppInfo.moduleCode"></i></span>
                    <span v-else>--</span>
                </template>
            </bk-table-column>
            <bk-table-column label="生成时间" prop="updateTime" :formatter="timeFormatter" show-overflow-tooltip></bk-table-column>
            <bk-table-column label="操作人" prop="tokenUser" show-overflow-tooltip></bk-table-column>
            <bk-table-column label="过期时间" prop="expiresTime" show-overflow-tooltip>
                <template slot-scope="props">
                    <span v-if="!props.row.expiresTime">--</span>
                    <span v-else-if="isAfterNow(props.row.expiresTime)">{{ timeFormatter('', '', props.row.expiresTime) }}</span>
                    <span v-else :class="$style['outdate-token']">{{ timeFormatter('', '', props.row.expiresTime) }}（已过期，请刷新）</span>
                </template>
            </bk-table-column>
        </bk-table>

        <span :class="$style['token-tip']">注：凭证 Token 用于页面预览时需要进行“蓝鲸应用认证”的远程函数调用。Token 根据登录用户和应用绑定应用 ID 生成，重新绑定应用或 Token 过期后必须重新生成</span>
    </article>
</template>

<script>
    import AppModuleSelect from '@/components/project/app-module-select'
    import dayjs from 'dayjs'

    export default {
        components: {
            AppModuleSelect
        },
        data () {
            return {
                isLoading: false,
                tokenList: [],
                isLoadingToken: false,
                currentAppInfo: {
                    appCode: '',
                    moduleCode: ''
                }
            }
        },

        computed: {
            projectId () {
                return this.$route.params.projectId
            },

            bindInfoTips () {
                return {
                    placement: 'top',
                    width: '284px',
                    content: '必须绑定“源码管理”方式为“蓝鲸可视化开发平台提供源码包”的蓝鲸应用模块'
                }
            }
        },

        created () {
            this.init()
        },

        methods: {
            init () {
                this.getProjectDetail()
                this.getTokenList()
            },

            getProjectDetail () {
                this.isLoading = true
                return this.$store.dispatch('project/detail', { projectId: this.projectId }).then((projectDetail) => {
                    this.currentAppInfo.appCode = projectDetail.appCode || ''
                    this.currentAppInfo.moduleCode = projectDetail.moduleCode || ''
                }).finally(() => {
                    this.isLoading = false
                })
            },

            getTokenList () {
                this.isLoadingToken = true
                this.$store.dispatch('functions/getTokenList').then((res) => {
                    this.tokenList = res.data || []
                }).finally(() => {
                    this.isLoadingToken = false
                })
            },

            generateToken () {
                this.isLoadingToken = true
                const tokenData = this.tokenList[0] || {}
                this.$store.dispatch('functions/generateToken', { appCode: this.currentAppInfo.appCode, id: tokenData.id }).then((res) => {
                    this.getTokenList()
                }).finally(() => {
                    this.isLoadingToken = false
                })
            },

            isAfterNow (val) {
                return dayjs(val).isAfter(dayjs())
            },

            timeFormatter (obj, con, val) {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'
            }
        }
    }
</script>

<style lang="postcss" module>
    .credential-manage {
        padding: 20px 24px;
        font-size: 12px;
        min-height: 100%;
    }
    .label {
        font-weight: bold;
    }
    .bind-label {
        width: 112px;
        cursor: default;
        padding-bottom: 3px;
        border-bottom: 1px dashed #979797;
    }
    .info-tips {
        color: orange;
    }
    .token-tip {
        font-size: 12px;
        color: #979ba5;
        line-height: 16px;
    }
    .fresh-token {
        color: #3a84ff;
        cursor: pointer;
        margin-left: 7px;
        font-size: 14px;
    }
    .outdate-token {
        color: #ea3536;
    }
    .setting {
        display: flex;
        align-items: center;
        height: 70px;
        background: #ffffff;
        box-shadow: 0px 2px 2px 0px rgba(0,0,0,0.1);
        padding-left: 30px;
        margin-bottom: 16px;
    }
</style>
<style lang="postcss">
    .token-table {
        margin-bottom: 16px;
        box-shadow: 0px 2px 2px 0px rgba(0,0,0,0.1);
        th.is-leaf {
            border: none;
        }
        &:before {
            height: 0;
        }
        .bk-table-empty-block {
            background: #ffffff;
            height: 42px;
            min-height: 42px;
            .bk-table-empty-text {
                padding: 0;
            }
        }
        .token-wrap {
            display: flex;
            align-items: center;
            .token-txt {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
</style>
