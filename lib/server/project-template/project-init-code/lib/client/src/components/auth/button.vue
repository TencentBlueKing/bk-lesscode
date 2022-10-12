<template>
    <bk-button v-if="showRaw" v-bind="$attrs" v-on="$listeners">
        <slot />
    </bk-button>
    <bk-button
        v-else
        v-cursor
        v-bind="$attrs"
        :loading="isLoading"
        class="permission-disable"
        @click.stop="handleRequestPermission">
        <slot />
    </bk-button>
</template>
<script>
    import { permissionDialog } from '@/common/bkmagic'

    export default {
        name: 'AuthButton',
        inheritAttrs: false,
        props: {
            // true: 有权限
            // false: 无权限，点击才会请求鉴权
            // 不传: 直接发请求鉴权
            permission: {
                type: [
                    Boolean, String
                ],
                default: ''
            },
            auth: {
                type: String,
                required: true
            }
        },
        data () {
            return {
                isLoading: false,
                hasPermission: false
            }
        },
        computed: {
            showRaw () {
                if (this.permission) {
                    return true
                }
                if (this.hasPermission) {
                    return true
                }
                return false
            }
        },
        watch: {
            resourceId (resourceId) {
                this.checkPermission()
            }
        },
        created () {
            this.checkPermission()
            this.authResult = {}
        },
        methods: {
            /**
             * @desc 主动鉴权，指定资源和资源权限
             */
            async fetchPermission () {
                this.isLoading = true
                try {
                    const resData = await this.$store.dispatch('iam/checkBatch', {
                        data: {
                            actions: this.auth.split(',')
                        }
                    })
                    console.error(resData)
                    this.hasPermission = resData.pass
                    this.authResult = resData
                } catch (e) {
                    console.error(e)
                } finally {
                    this.isLoading = false
                }
            },
            /**
             * @desc 判断预鉴权逻辑
             */
            checkPermission () {
                if (this.permission === '' && this.auth) {
                    this.fetchPermission()
                }
            },
            /**
             * @desc 无权限时弹框提示资源权限申请
             */
            handleRequestPermission () {
                if (this.isLoading) {
                    return
                }
                permissionDialog({
                    actions: this.auth.split(',')
                }, this.authResult)
            }
        }
    }
</script>
<style lang='postcss' scoped>
    .permission-disable {
        color: #fff !important;
        background-color: #dcdee5 !important;
        border-color: #dcdee5 !important;

        &.bk-button-text {
            color: #c4c6cc !important;
            background: none !important;
        }
    }
</style>
