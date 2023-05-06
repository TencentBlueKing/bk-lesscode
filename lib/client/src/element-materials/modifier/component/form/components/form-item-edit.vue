<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <bk-sideslider
        :is-show="isShow"
        :title="title"
        :width="696"
        :before-close="beforeClose"
        :quick-clos="true"
        ext-cls="form-item-edit">
        <section slot="content" class="item-container">
            <div class="form-item-title">{{ $t('基本信息') }}</div>
            <bk-form
                ref="operation"
                :model="formItemData"
                :rules="rules"
                :label-width="100">
                <bk-form-item
                    :label="$t('form_字段名称')"
                    required
                    property="property"
                    error-display-type="normal">
                    <bk-input
                        v-model="formItemData.property"
                        :placeholder="$t('以英文字符、下划线开头；只允许英文字符、数字、下划线、和 -')" />
                </bk-form-item>
                <bk-form-item
                    label="Label"
                    required
                    property="label"
                    error-display-type="normal">
                    <bk-input v-model="formItemData.label" />
                </bk-form-item>
                <bk-form-item
                    :label="$t('form_表单项类型')"
                    error-display-type="normal">
                    <bk-select v-model="formItemData.type">
                        <bk-option
                            v-for="item in formItemTypeList"
                            :id="item.id"
                            :name="`${item.id}(${item.name})`"
                            :key="item.id" />
                    </bk-select>
                </bk-form-item>
                <div v-if="isShow" style="margin: 30px 0">
                    <form-item-validate
                        :default-value="formItemData.validate"
                        :change="itemChange"
                        name="validate" />
                </div>
                <div>
                    <bk-button
                        class="mr5"
                        theme="primary"
                        :title="$t('提交')"
                        @click="handleSave">
                        {{ $t('提交') }} </bk-button>
                    <bk-button
                        class="mr5"
                        theme="default"
                        :title="$t('取消')"
                        @click="beforeClose">
                        {{ $t('取消') }} </bk-button>
                </div>
            </bk-form>
        </section>
    </bk-sideslider>
</template>

<script>
    import formItemValidate from './form-item-validate'
    export default {
        components: {
            formItemValidate
        },
        props: {
            isShow: {
                type: Boolean
            },
            defaultValue: {
                type: Object,
                required: true
            },
            submit: {
                type: Function,
                required: true
            },
            close: {
                type: Function
            }

        },
        data () {
            return {
                changeCount: 0,
                formItemData: {},
                title: window.i18n.t('表单项配置'),
                formItemTypeList: [
                    { id: 'input', name: window.i18n.t('输入框') },
                    { id: 'select', name: window.i18n.t('下拉选框') },
                    { id: 'date-picker', name: window.i18n.t('日期选择') },
                    { id: 'time-picker', name: window.i18n.t('时间选择') },
                    { id: 'switcher', name: window.i18n.t('开关') },
                    { id: 'radio-group', name: window.i18n.t('单选框') },
                    { id: 'checkbox-group', name: window.i18n.t('多选框') },
                    { id: 'checkbox', name: window.i18n.t('复选框') }
                ],
                rules: {
                    label: [
                        {
                            required: true,
                            message: window.i18n.t('Label必填'),
                            trigger: 'blur'
                        }
                    ],
                    property: [
                        {
                            required: true,
                            message: window.i18n.t('字段名称名称必填'),
                            trigger: 'blur'
                        },
                        {
                            validator: value => /^[a-zA-Z_][0-9a-zA-Z_]{0,29}$/.test(value),
                            message: window.i18n.t('字段名称：以英文字符、下划线开头；只允许英文字符、数字、下划线'),
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        watch: {
            isShow: {
                handler () {
                    this.formItemData = {
                        ...this.defaultValue
                    }
                    // 重置编辑状态
                    setTimeout(() => {
                        this.changeAlert = false
                    })
                },
                immdite: true
            },
            formItemData: {
                handler () {
                    this.changeAlert = true
                },
                deep: true
            }
        },
        created () {
            this.changeAlert = false
        },
        methods: {
            handleSave () {
                this.$refs.operation.validate()
                    .then(() => {
                        this.$bkMessage({
                            theme: 'success',
                            message: this.$t('修改成功')
                        })
                        this.submit(this.formItemData)
                    })
            },
            itemChange (name, value) {
                Object.assign(this.formItemData, {
                    [name]: value
                })
            },
            beforeClose () {
                if (this.changeAlert) {
                    this.$bkInfo({
                        subTitle: this.$t('弹窗关闭后未保存的数据将会丢失，请确认关闭'),
                        okText: this.$t('确认'),
                        cancelText: this.$t('取消'),
                        closeIcon: false,
                        confirmFn: this.close
                    })
                    return
                }
                this.close()
            }
        }
    }
</script>

<style lang="postcss">
    .form-item-title {
        height: 28px;
        font-size: 14px;
        font-weight: bold;
        color: #63656E;
    }
    .form-item-edit {
        .item-container {
            margin: 18px 30px;
        }
    }
</style>
