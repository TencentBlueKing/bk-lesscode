<template>
    <lc-sideslider
        :is-show="isShow"
        :quick-close="true"
        :width="1200"
        :title="form.id ? $t('编辑函数') : $t('新建函数')"
        @update:isShow="close">
        <section class="func-form-home" slot="content">
            <form-name :form.sync="form" ref="name" :function-list="functionList"></form-name>
            <form-detail :form.sync="form" ref="detail"></form-detail>
            <form-summary :form.sync="form" :require-summary="true" ref="summary"></form-summary>
            <form-monaco :form.sync="form" :function-list="[]" class="monaco" ref="monaco"></form-monaco>
        </section>
        <section slot="footer" class="add-footer">
            <bk-button theme="primary" @click="submitAddMarketFunc" :loading="isLoading">{{ $t('提交') }}</bk-button>
            <bk-button @click="handleClose">{{ $t('取消') }}</bk-button>
        </section>
    </lc-sideslider>
</template>

<script>
    import mixins from './form-mixins'
    import { mapActions } from 'vuex'
    import { leaveConfirm } from '@/common/leave-confirm'

    export default {
        mixins: [mixins],

        props: {
            functionList: Array,
            isShow: Boolean,
            title: String
        },

        data () {
            return {
                isLoading: false
            }
        },

        methods: {
            ...mapActions('functionMarket', [
                'createFunction',
                'updateFunction'
            ]),
            close () {
                this.$emit('update:isShow', false)
                this.$emit('update:funcData', {})
            },

            submitAddMarketFunc () {
                this.validate().then((postData) => {
                    this.isLoading = true
                    const curMethod = this.form.id
                        ? this.updateFunction
                        : this.createFunction
                    curMethod(postData).then(() => {
                        window.leaveConfirm = false
                        this.$emit('refresh')
                        this.close()
                    }).catch((err) => {
                        if (err?.code === 499) {
                            this
                                .$refs
                                .monaco
                                .fixMethod()
                                .then(this.submitAddMarketFunc)
                                .catch(() => {
                                    this.messageHtmlError(err.message || err)
                                })
                        } else {
                            this.messageError(err.message || err)
                        }
                    }).finally(() => {
                        this.isLoading = false
                    })
                }).catch((validator) => {
                    this.$bkMessage({
                        message: validator.content || validator,
                        theme: 'error'
                    })
                })
            },

            handleClose () {
                leaveConfirm('存在未保存的函数，关闭后不会保存更改')
                    .then(() => {
                        this.close()
                    })
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .func-form-home {
        padding: 20px 30px;
        /deep/ .func-form-item {
            margin-top: 20px;
        }
        /deep/ .func-form-bottom {
            margin-bottom: 20px;
        }
    }
    .add-footer {
        margin-left: 30px;
        button {
            margin-right: 10px;
        }
    }
    .monaco {
        margin-top: 20px;
    }
</style>
