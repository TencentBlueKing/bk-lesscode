<template>
    <div class="go-back-icon-wrapper">
        <i class="bk-drag-icon bk-drag-arrow-back" @click="handleBackClick"></i>
        <bk-dialog
            :title="$t('流程未部署，确认离开？')"
            ext-cls="deploy-confirm-popover"
            :value="isShow"
            :width="420"
            :quick-close="false"
            :mask-close="false"
            :show-footer="false"
            @cancel="isShow = false">
            <div class="deploy-tips-content">
                {{ $t('当前流程未部署，需部署后，预览环境方可生效；如果需要该流程在应用预发布环境或生产环境生效，需将整个应用部署至对应环境。') }} <div class="action-btns">
                    <bk-button
                        style="margin-right: 4px"
                        theme="primary"
                        :loading="deployPending"
                        @click="handleDeployClick">
                        {{ $t('部署流程') }} </bk-button>
                    <bk-button
                        style="margin-right: 4px"
                        @click="$router.push({ name: 'release', params: { projectId } })">
                        {{ $t('部署应用') }} </bk-button>
                    <bk-button @click="jumpPage">{{ $t('离开') }}</bk-button>
                </div>
            </div>
        </bk-dialog>
    </div>
</template>
<script>
    export default {
        name: 'BackBtn',
        props: {
            fromPageList: Boolean,
            deployPending: Boolean,
            flowConfig: {
                type: Object,
                default () {
                    return {}
                }
            }
        },
        data () {
            return {
                isShow: false
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },
        methods: {
            handleBackClick () {
                if ('deployed' in this.flowConfig && !this.flowConfig.deployed) {
                    this.isShow = true
                } else {
                    this.jumpPage()
                }
            },
            handleDeployClick () {
                this.$emit('deploy')
                this.isShow = false
            },
            jumpPage () {
                if (this.fromPageList) {
                    this.$router.push({ name: 'pageList' })
                } else {
                    this.$router.push({ name: 'flowList' })
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    i {
        font-size: 13px;
        color: #3a84ff;
        cursor: pointer;
    }
    .deploy-tips-content {
        font-size: 14px;
        color: #63656e;
        text-align: left;
        .action-btns {
            margin-top: 30px;
            text-align: center
        }
    }
</style>
<style lang="postcss">
.deploy-confirm-popover {
    .bk-dialog .bk-dialog-header {
        padding-bottom: 16px;
        .bk-dialog-header-inner {
            font-size: 20px;
            font-weight: normal;
            color: #313238;
        }
    }
}
</style>
