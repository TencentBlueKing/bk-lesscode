<template>
    <bk-sideslider
        ref="bkSideslider"
        v-bind="$attrs"
        class="lc-sideslider"
        :is-show="isShow"
        quick-close
        transfer
        :before-close="beforeClose"
        @update:isShow="updateShow">
        <template slot="header">
            <slot name="header">
                {{ title }}
            </slot>
        </template>
        <template slot="content">
            <slot name="content" />
        </template>
        <template
            v-if="$slots.footer"
            #footer>
            <slot name="footer" />
        </template>
    </bk-sideslider>
</template>
<script>
    import { leaveConfirm } from '@/common/leave-confirm'
    export default {
        name: 'LcSideslider',
        inheritAttrs: false,
        props: {
            isShow: {
                type: Boolean,
                required: true
            },
            title: String
        },
        data () {
            return {}
        },
        watch: {
            isShow: {
                handler (val) {
                    if (val) {
                        // 当页面可以进行编辑时，其中一项是通过sideslider来编辑的，需要先记录页面的编辑状态
                        this.pageLeaveConfirmMemo = window.leaveConfirm
                        window.leaveConfirm = 'dialog'
                    }
                },
                immediate: true
            }
        },
        created () {
            this.pageLeaveConfirmMemo = false
        },
        methods: {
            beforeClose () {
                console.log('sideslier before close', window.leaveConfirm)
                return leaveConfirm()
            },
            /**
             * @desc 关闭弹层
             */
            updateShow () {
                window.leaveConfirm = this.pageLeaveConfirmMemo
                this.$emit('update:isShow', false)
            }
        }
    }
</script>
