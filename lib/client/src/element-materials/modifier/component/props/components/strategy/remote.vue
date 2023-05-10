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
    <section>
        <div
            class="remote-title"
            v-bk-tooltips="{
                content: tips,
                disabled: !tips,
                width: 290
            }">
            <span :class="{ 'under-line': tips }">
                {{ title === undefined ? ((name === 'remoteOptions' ? $t('动态配置') : $t('函数'))) : title }}
            </span>
            <span
                class="remote-example"
                @click="handleShowExample">
                {{$t('数据示例')}}
            </span>
        </div>
        <div class="remote-content">
            <choose-function
                :choosen-function="remoteData"
                @change="changeFunc"
                @clear="handleClear"
            ></choose-function>
            <bk-button
                @click="getApiData"
                :loading="isLoadingData"
                theme="primary"
                class="mt12"
                size="small">
                {{$t('获取数据')}}
            </bk-button>
        </div>
        <remote-example
            ref="example"
            :data="exampleData" />
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import ChooseFunction from '@/components/methods/choose-function/index.vue'
    import { bus } from '@/common/bus'
    import { evalWithSandBox } from 'shared/function'
    import remoteExample from './remote-example'
    export default {
        components: {
            ChooseFunction,
            remoteExample
        },
        props: {
            name: String,
            type: String,
            componentType: {
                type: String
            },
            payload: {
                type: Object,
                default: () => ({})
            },
            defaultValue: {
                type: [Object, Array, Number, String]
            },
            change: {
                type: Function,
                default: () => {}
            },
            remoteValidate: {
                type: Function,
                default: () => {}
            },
            autoGetData: {
                type: Boolean,
                default: true
            },
            title: {
                type: String
            },
            tips: {
                type: String
            },
            describe: {
                type: Object
            },
            isLoading: {
                type: Boolean
            }
        },
        data () {
            return {
                remoteData: {
                    methodCode: '',
                    params: []
                },
                isLoadingData: false
            }
        },
        computed: {
            ...mapGetters('functions', ['functionList']),
            ...mapGetters('variable', ['variableList']),
            exampleData () {
                return { name: this.name, value: this.describe.example || this.describe.val }
            }
        },
        watch: {
            isLoading: {
                handler (val) {
                    this.isLoadingData = val
                },
                immediate: true
            }
        },
        created () {
            this.remoteData = Object.assign({}, this.remoteData, this.payload)
            if (this.autoGetData && this.remoteData.methodCode) {
                this.getApiData()
            }
        },
        methods: {
            changeFunc (val) {
                this.remoteData = Object.assign({}, val)
                this.change(this.name, this.defaultValue, this.type, val)
                if (this.autoGetData) {
                    this.getApiData()
                }
            },
            handleClear () {
                this.remoteData = Object.assign(this.remoteData, { methodCode: '' })
                this.change(this.name, this.defaultValue, this.type, this.remoteData)
            },
            async getApiData () {
                if (!this.remoteData.methodCode) {
                    this.$bkMessage({
                        theme: 'error',
                        message: this.$t('请先选择函数'),
                        limit: 1
                    })
                    return
                }
                try {
                    this.toggleLoading(true)
                    const apiList = await this.$store.dispatch('api/getApiList')
                    const result = await evalWithSandBox(
                        this.remoteData.methodCode,
                        this.remoteData.params,
                        this.functionList,
                        this.variableList,
                        apiList,
                        {
                            $store: this.$store,
                            $http: this.$http
                        }
                    )
                    let message = this.remoteValidate(result)
                    if (message) {
                        // 选择函数已经成功设置 payload，rendervalue 因为数据校验问题没有同步过去。所以该函数选择成功，但是有异常提示
                        message = this.$t('数据源设置成功，以下问题可能会导致组件表现异常，请检查：') + message
                        this.messageWarn(message)
                    } else {
                        this.change(this.name, result, this.type, JSON.parse(JSON.stringify(this.remoteData)))
                        if (this.name === 'options' && this.componentType === 'bk-charts') {
                            this.$bkMessage({
                                theme: 'success',
                                message: this.$t('图表配置已更新，{0}选项已被远程数据覆盖', [Object.keys(result).join('、')])
                            })
                            return
                        }
                        if (this.name === 'remoteOptions') {
                            bus.$emit('update-chart-options', result)
                        }
                    }
                } catch (error) {
                    this.$bkMessage({
                        theme: 'error',
                        message: error.message || error || this.$t('获取数据失败，请检查函数是否正确'),
                        limit: 1
                    })
                } finally {
                    this.toggleLoading(false)
                }
            },
            handleShowExample () {
                this.$refs.example.isShow = true
            },
            toggleLoading (val) {
                this.isLoadingData = val
                this.$emit('update:isLoading', val)
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .remote-title {
        display: flex;
        justify-content: space-between;
        margin: 12px 0 6px;
        line-height: 20px;
        font-size: 12px;
    }
    .under-line {
        line-height: 24px;
        border-bottom: 1px dashed #979ba5;
    }
    .remote-example {
        color: #3a84ff;
        cursor: pointer;
        font-size: 12px
    }
    .form-title {
        font-weight: bold;
        color: #63656E;
        height: 22px;
        .form-tip {
            font-weight: normal;
            color: #979ba5;
        }
    }
    .mt12 {
        margin-top: 12px;
    }
</style>
