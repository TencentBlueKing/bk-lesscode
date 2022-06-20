<template>
    <div class="process-form-comp">
        <template v-if="!showSuccess">
            <template v-if="fields.length > 0">
                <form-fields
                    :fields="fields"
                    :value="value"
                    @change="(key,$event) => value = $event">
                </form-fields>
                <div class="operate-btns">
                    <bk-button
                        theme="primary"
                        style="min-width: 88px; margin-right: 4px;"
                        :loading="submitPending"
                        @click="handleSubmit">
                        提交
                    </bk-button>
                    <bk-button>暂存</bk-button>
                </div>
            </template>
            <bk-exception v-else type="empty" class="empty-form-fields">暂无数据</bk-exception>
        </template>
        <div class="create-ticket-success" v-else>
            <div class="success-tip-content">
                <div class="icon-wrapper">
                    <i class="bk-icon icon-check-circle"></i>
                    <p class="success-tips">提单成功</p>
                    <p class="success-desc">数据已提交并保持，接下来你可以继续提单</p>
                </div>
                <div class="btn-action">
                    <bk-button @click="showSuccess = false">继续提单</bk-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import { FIELDS_TYPES } from './form/constants/forms.js'
    import FormFields from './form/index.vue'

    export default {
        name: 'ProcessForm',
        components: {
            FormFields
        },
        props: {
            type: {
                type: String,
                default: ''
            },
            fields: {
                type: Array,
                default: () => []
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
            // 字段的value
            getFormData () {
                return this.fields.map((item) => {
                    const { choice, id, key, type } = item
                    let value = this.value[key]
                    if (type === 'IMAGE') {
                        value = this.value[key].map(item => item.path)
                    } else if (['MULTISELECT', 'CHECKBOX', 'MEMBER', 'MEMBERS'].includes(type)) {
                        value = Array.isArray(this.value[key]) ? this.value[key].join(',') : this.value[key]
                    }
                    return { choice, id, key, type, value }
                })
            },
            getFormDefaultValue () {
                const value = {}
                this.fields.forEach((item) => {
                    if ('default' in item) {
                        if (['MULTISELECT', 'CHECKBOX', 'MEMBER', 'MEMBERS', 'TABLE', 'IMAGE'].includes(item.type)) {
                            value[item.key] = item.default ? item.default.split(',') : []
                        } else {
                            value[item.key] = item.default
                        }
                    } else {
                        value[item.key] = cloneDeep(FIELDS_TYPES.find(item => item.type === this.field.type).default)
                    }
                })
                return value
            },
            async handleSubmit () {
                // 校验多值类型的表单配置值的数目范围后，用户填写的值数目是否范围内
                let formValNumRangeValid = true
                this.fields.some((field) => {
                    const fieldVal = this.value[field.key]
                    if ('num_range' in field) {
                        let msg = ''
                        if (typeof field.num_range[0] === 'number' && fieldVal.length < field.num_range[0]) {
                            msg = `${field.name}表单的值数目不能小于${field.num_range[0]}`
                        }
                        if (typeof field.num_range[1] === 'number' && fieldVal.length > field.num_range[1]) {
                            msg = `${field.name}表单的值数目不能大于${field.num_range[1]}`
                        }
                        if (msg) {
                            formValNumRangeValid = false
                            this.$bkMessage({
                                theme: 'error',
                                message: msg
                            })
                            return true
                        }
                    }
                })
                if (!formValNumRangeValid) {
                    return
                }

                try {
                    this.submitPending = true
                    const formData = this.getFormData()
                    const res = await this.$store.dispatch('nocode/form/createOpenApiTicket', formData)
                    if (res.result) {
                        this.value = this.getFormDefaultValue()
                        this.showSuccess = true
                    }
                } catch (e) {
                    console.error(e)
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
        align-items: center;
        justify-content: center;
        height: 100%;
        .success-tip-content {
            text-align: center;
        }
        .icon-wrapper {
            & > i {
                font-size: 56px;
                color: #2dcb56;
            }
            .success-tips {
                margin: 30px 0 16px;
                color: #313238;
                font-size: 24px;
                line-height: 1;
            }
            .success-desc {
                color: #63656e;
                font-size: 14px;
            }
        }
        .btn-action {
            margin-top: 40px;
        }
    }
</style>
