<template>
    <div class="process-form-comp">
        <div v-show="!showSuccess">
            <template v-if="fields.length > 0">
                <form-fields
                    style="width: 50%"
                    :fields="fields"
                    v-model="value">
                </form-fields>
                <div class="operate-btns">
                    <bk-button
                        v-bk-tooltips="{
                            disabled: viewType === 'projectCode' || type === 'FORM' || flowDeployed,
                            content: $t('流程有更新未部署，提单或流程执行可能会失败'),
                            maxWidth: 400
                        }"
                        theme="primary"
                        style="min-width: 88px; margin-right: 4px;"
                        :loading="submitPending"
                        @click="handleSubmit">
                        {{ $t('提交') }} </bk-button>
                    <bk-button @click="value = {}">{{ $t('清空') }}</bk-button>
                </div>
            </template>
            <bk-exception v-else type="empty" class="empty-form-fields">{{ $t('暂无数据') }}</bk-exception>
        </div>
        <div class="create-ticket-success" v-if="showSuccess">
            <div class="success-tip-content">
                <div class="icon-wrapper">
                    <i class="bk-icon icon-check-circle"></i>
                    <p class="title">{{ $t('提单完成') }}</p>
                    <p class="desc">{{ $t('数据已提交并保存，接下来你可以继续提单') }}</p>
                </div>
                <div class="btn-action">
                    <bk-button theme="primary" @click="handleContinue">{{ $t('继续提单') }}</bk-button>
                </div>
            </div>
        </div>
        <float-workbench-block v-if="type === 'FLOW'"></float-workbench-block>
    </div>
</template>
<script>
    import FormFields from './form/index.vue'
    import FloatWorkbenchBlock from './components/float-workbench-block.vue'
    import { isValEmpty } from '@/common/util'

    export default {
        name: 'ProcessForm',
        components: {
            FormFields,
            FloatWorkbenchBlock
        },
        props: {
            type: String,
            fields: {
                type: Array,
                default: () => []
            },
            formId: Number,
            serviceId: Number,
            versionId: Number,
            tableName: String,
            flowDeployed: Boolean,
            viewType: {
                type: String,
                default: 'projectCode'
            }
        },
        data () {
            return {
                value: {},
                showSuccess: false,
                submitPending: false
            }
        },
        methods: {
            getFieldsData () {
                return this.fields.map((item) => {
                    const { choice, key, type } = item
                    let value = this.value[key]
                    if (type === 'IMAGE') {
                        value = this.value[key].map(item => item.path)
                    } else if (['MULTISELECT', 'CHECKBOX', 'MEMBER', 'MEMBERS'].includes(type)) {
                        value = Array.isArray(this.value[key]) ? this.value[key].join(',') : this.value[key]
                    }
                    const dataItem = { key, value }
                    if (['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'TABLE'].includes(type)) {
                        dataItem.choice = choice
                    }
                    return dataItem
                })
            },
            handleContinue () {
                this.value = {}
                this.showSuccess = false
            },
            validate () {
                let valid = true
                this.fields.some((field) => {
                    // 隐藏的表单不校验
                    if (field.isHide) {
                        return
                    }
                    // 校验多值类型的表单配置值的数目范围后，用户填写的值数目是否范围内
                    const fieldVal = this.value[field.key]
                    if ('num_range' in field) {
                        let msg = ''
                        if (typeof field.num_range[0] === 'number' && fieldVal.length < field.num_range[0]) {
                            msg = this.$t('{0}表单的值数目不能小于{1}', [field.name, field.num_range[0]])
                        }
                        if (typeof field.num_range[1] === 'number' && fieldVal.length > field.num_range[1]) {
                            msg = this.$t('{0}表单的值数目不能大于{1}', [field.name, field.num_range[1]])
                        }
                        if (msg) {
                            valid = false
                            this.$bkMessage({
                                theme: 'error',
                                message: msg
                            })
                            return true
                        }
                    }
                    if (field.validate_type === 'REQUIRE' && isValEmpty(fieldVal)) {
                        valid = false
                        this.$bkMessage({
                            theme: 'error',
                            message: this.$t('字段【{0}】为必填项', [field.name])
                        })
                        return true
                    }
                    if ('imageRange' in field && ['MULTISELECT', 'CHECKBOX', 'IMAGE'].includes(field.type)) {
                        let msg = ''
                        if (field.imageRange?.isMin && fieldVal.length < Number(field.imageRange.minNum)) {
                            msg = this.$t('{0}表单的选项值数目不能小于{1}', [field.name, field.imageRange.minNum])
                        }
                        if (field.imageRange?.isMax && fieldVal.length > Number(field.imageRange.maxNum)) {
                            msg = this.$t('{0}表单的选项值数目不能大于{1}', [field.name, field.imageRange.maxNum])
                        }
                        if (msg) {
                            valid = false
                            this.$bkMessage({
                                theme: 'error',
                                message: msg
                            })
                            return true
                        }
                    }
                })
                return valid
            },
            async handleSubmit () {
                if (!this.validate()) {
                    return
                }

                try {
                    this.submitPending = true
                    const self = this
                    const data = this.getFieldsData()
                    if (this.type === 'FLOW') {
                        const params = {
                            fields: [{ key: 'title', value: this.$t('lesscode 提单') }, ...data],
                            creator: this.$store.state.user.username,
                            service_id: this.serviceId,
                            tag: this.viewType === 'preview' ? 'preview' : BKPAAS_ENVIRONMENT,
                            meta: {
                                envs: {
                                    appApigwPrefix: BK_APP_APIGW_PREFIX,
                                    creatorUsername: this.$store.state.user.username
                                }
                            }
                        }
                        if (this.versionId) {
                            params.flow_id = this.versionId
                        }
                        const reqConfig = {
                            handingError (message) {
                                if (typeof message === 'string' && message.includes('服务未启用')) {
                                    return self.$t('当前流程未部署，请部署后提单')
                                }
                                return message
                            }
                        }
                        await this.$http.post('/nocode/ticket/create_ticket_with_version/', params, reqConfig)
                    } else {
                        await this.$http.post(`/data-source/user/tableName/${this.tableName}?formId=${this.formId}`, data)
                    }
                    this.showSuccess = true
                } catch (e) {
                    console.error(e.messsage || e)
                } finally {
                    this.submitPending = false
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .process-form-comp {
        padding: 24px;
        height: 100%;
        background: #ffffff;
        overflow: auto;
    }
    .empty-form-fields {
        padding: 200px 0 140px;
        >>> .bk-exception-text {
            margin-top: -40px;
            font-size: 14px;
        }
    }
    .operate-btns {
        margin-top: 32px;
    }
    .create-ticket-success {
        display: flex;
        justify-content: center;
        padding-top: 168px;
        height: 100%;
        .success-tip-content {
            text-align: center;
        }
        .icon-wrapper {
            & > i {
                font-size: 72px;
                color: #2dcb56;
            }
            .title {
                margin: 32px 0 16px;
                color: #313238;
                font-size: 24px;
                line-height: 32px;
            }
            .desc {
                margin-top: 16px;
                color: #63656e;
                font-size: 14px;
                line-height: 22px;
            }
        }
        .btn-action {
            margin-top: 40px;
        }
    }
</style>
