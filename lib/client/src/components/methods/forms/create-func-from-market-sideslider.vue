<template>
    <lc-sideslider
        :title="$t('添加至应用')"
        :is-show="isShow"
        :quick-close="true"
        :width="1200"
        @update:isShow="close">
        <section class="func-form-home" slot="content">
            <form-project
                ref="project"
                :form.sync="form"
            ></form-project>
            <form-name
                ref="name"
                :form.sync="form"
                :function-list="functionList"
                v-bkloading="{ isLoading }"
            ></form-name>
            <form-code
                ref="code"
                :form.sync="form"
                :function-list="functionList"
                v-bkloading="{ isLoading }"
            ></form-code>
            <form-group
                ref="group"
                :form.sync="form"
            ></form-group>
            <form-detail
                ref="detail"
                :form.sync="form"
                :variable-list="variableList"
                :show-token="true"
            ></form-detail>
            <form-summary
                ref="summary"
                :form.sync="form"
            ></form-summary>
            <form-monaco
                class="monaco"
                ref="monaco"
                :form.sync="form"
                :function-list="functionList"
                :variable-list="variableList"
            ></form-monaco>
        </section>
        <section slot="footer" class="add-footer">
            <bk-button theme="primary" @click="submitAddFuncFromMarket" :loading="isSubmitting">{{ $t('提交') }}</bk-button>
            <bk-button @click="handleClose">{{ $t('取消') }}</bk-button>
        </section>
    </lc-sideslider>
</template>

<script>
    import mixins from './form-mixins'
    import { mapGetters, mapActions } from 'vuex'
    import { leaveConfirm } from '@/common/leave-confirm'

    export default {
        mixins: [mixins],

        props: {
            isShow: Boolean
        },

        data () {
            return {
                functionList: [],
                variableList: [],
                isLoading: false,
                isSubmitting: false
            }
        },

        computed: {
            ...mapGetters('projectVersion', ['currentVersionId'])
        },

        watch: {
            'form.projectId' (val) {
                if (val) {
                    this.freshList()
                } else {
                    this.clearData()
                }
            }
        },

        methods: {
            ...mapActions('functions', ['getFunctionList']),
            ...mapActions('functionMarket', ['createFunctionFromMarket']),
            ...mapActions('variable', ['getAllProjectVariable']),

            freshList () {
                this.isLoading = true
                const query = {
                    projectId: this.form.projectId,
                    versionId: this.currentVersionId
                }
                Promise.all([
                    this.getFunctionList(query),
                    this.getAllProjectVariable({
                        ...query,
                        effectiveRange: 0
                    })
                ]).then(([functionList, variableList]) => {
                    this.functionList = functionList || []
                    this.variableList = variableList || []
                }).catch((err) => {
                    this.messageError(err.message || err)
                }).finally(() => {
                    this.isLoading = false
                })
            },

            clearData () {
                this.functionList = []
                this.variableList = []
            },

            submitAddFuncFromMarket () {
                this.validate().then(({ id: funcMarketId, ...functionData }) => {
                    this.isSubmitting = true
                    const postData = {
                        functionData,
                        funcMarketId
                    }
                    this.createFunctionFromMarket(postData).then(() => {
                        window.leaveConfirm = false
                        this.messageSuccess(this.$t('添加成功'))
                        this.close()
                    }).catch((err) => {
                        if (err?.code === 499) {
                            this
                                .$refs
                                .monaco
                                .fixMethod()
                                .then(() => this.submitAddFuncFromMarket())
                                .catch(() => {
                                    this.messageHtmlError(err.message || err)
                                })
                        } else {
                            this.messageError(err.message || err)
                        }
                    }).finally(() => {
                        this.isSubmitting = false
                    })
                }).catch((validator) => {
                    this.$bkMessage({ message: validator.content || validator, theme: 'error' })
                })
            },

            close () {
                this.$emit('update:isShow', false)
                this.$emit('update:funcData', {})
            },

            handleClose () {
                leaveConfirm(this.$t('存在未保存的函数，关闭后不会保存更改'))
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
