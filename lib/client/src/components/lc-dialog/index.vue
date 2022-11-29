<template>
    <bk-dialog
        ref="dialog"
        v-bind="$attrs"
        v-on="$listeners"
        class="lc-dialog"
        :before-close="beforeClose"
        :value="value"
        @input="handleInputValue">
        <slot />
        <template
            v-if="$slots.footer"
            #footer>
            <slot name="footer" />
        </template>
    </bk-dialog>
</template>
<script>
    import { leaveConfirm } from '@/common/leave-confirm'

    export default {
        name: 'LcDialog',
        inheritAttrs: false,
        props: {
            value: Boolean
        },
        data () {
            return {}
        },
        watch: {
            value: {
                handler (val) {
                    if (val) {
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
                return leaveConfirm()
            },
            /**
             * @desc 关闭弹框
             */
            handleInputValue () {
                window.leaveConfirm = this.pageLeaveConfirmMemo
                this.$emit('input', false)
                this.$emit('change', false)
            }
        }
    }
</script>
