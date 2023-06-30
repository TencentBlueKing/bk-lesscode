<template>
    <bk-dialog
        v-model:is-show="isShowDialog"
        class="apply-permission-dialog"
        title=""
        :mask-close="false"
        :esc-close="false"
        :width="768">
        <ask-permission
            v-if="isShowDialog"
            :loading="isLoading"
            :permission-list="permissionList"
            :max-height="360" />
        <template #footer>
            <template v-if="!isLoading">
                <bk-button
                    theme="primary"
                    class="mr10"
                    @click="handleApply"
                    v-if="isAppleFlag">
                    {{ applyText }}
                </bk-button>
                <bk-button
                    theme="primary"
                    class="mr10"
                    @click="handleHasApplyed"
                    v-else>
                    {{ appliedText }}
                </bk-button>
            </template>
            <bk-button @click="handleCancle">{{ cancelText }}</bk-button>
        </template>
    </bk-dialog>
</template>
<script>
    import AskPermission from './ask-permission'

    import store from '@/store'

    export default {
        components: {
            AskPermission
        },
        props: {
            authParams: Array,
            authResult: Object
        },
        data () {
            return {
                isLoading: false,
                isShowDialog: false,
                isAppleFlag: true
            }
        },
        computed: {
            permissionList () {
                if (this.isLoading) {
                    return []
                }
                if (this.authResult.requiredPermissions) {
                    return this.authResult.requiredPermissions
                }
                return []
            }
        },
        created () {
            this.applyText = '去申请'
            this.appliedText = '已申请'
            this.cancelText = '取消'
        },
        methods: {
            /**
             * @desc 申请资源权限
             */
            async fetchPermission () {
                this.isLoading = true
                try {
                    const resData = await store.dispatch('iam/checkBatch', {
                        data: this.authParams
                    })
                    this.hasPermission = resData.pass
                    this.authResult = resData
                } catch (e) {
                    console.error(e)
                } finally {
                    this.isLoading = false
                }
            },
            /**
             * @desc 供外部调用，显示权限申请弹框
             */
            show () {
                this.isShowDialog = true
                if (this.authParams && !this.authResult.requiredPermissions) {
                    this.fetchPermission()
                }
            },
            /**
             * @desc 跳转权限中心
             */
            handleApply () {
                window.open(this.authResult.applyUrl, '_blank')
                this.isAppleFlag = false
            },
            /**
             * @desc 权限已申请刷新页面
             */
            handleHasApplyed () {
                this.handleCancle()
                window.location.reload()
            },
            handleCancle () {
                this.isAppleFlag = true
                this.isShowDialog = false
                this.authResult = {}
            }
        }
    }
</script>
