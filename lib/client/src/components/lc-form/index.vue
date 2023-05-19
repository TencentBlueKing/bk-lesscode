<template>
    <div
        ref="form"
        class="lc-form"
        @click="handleApplyChange">
        <bk-form
            ref="bkForm"
            :model="model"
            v-bind="$attrs">
            <slot />
        </bk-form>
    </div>
</template>
<script>
    export default {
        name: 'LcForm',
        inheritAttrs: false,
        props: {
            model: {
                type: Object
            }
        },
        data () {
            return {
                max: 0,
                isApplyChange: false
            }
        },
        watch: {
            model: {
                handler () {
                    setTimeout(() => {
                        if (this.isApplyChange) {
                            window.leaveConfirm = true
                        }
                    })
                },
                deep: true
            }
        },
        methods: {
            /**
             * @desc 标记用户是否主动操作过表单项
             */
            handleApplyChange () {
                this.isApplyChange = true
            },
            /**
             * @desc 验证表单
             */
            validate () {
                return this.$refs.bkForm.validate().catch((error) => {
                    this.$refs.form.querySelector('.lc-form-item.is-error')?.scrollIntoView()
                    return Promise.reject(error)
                })
            },
            /**
             * @desc 清除表单验证信息
             */
            clearError () {
                this.$refs.bkForm.clearError()
            }
        }
    }
</script>
