<template>
    <bk-form :label-width="180" :model="form" ref="funcForm" :form-type="formType" class="func-form-item">
        <bk-form-item label="函数类型" property="funcType">
            <bk-radio-group
                :value="form.funcType"
                @change="(funcType) => updateValue({ funcType })"
            >
                <bk-radio-button
                    v-for="temp in tempList"
                    :value="temp.id"
                    :key="temp.id"
                    :disabled="disabled && form.funcType !== temp.id"
                    class="func-temp"
                >
                    {{ temp.name }}
                    <i
                        class="bk-icon icon-info ml5"
                        v-if="temp.info"
                        v-bk-tooltips="{ content: `<pre class='component-method-tip'>${temp.info}</pre>` }"
                    ></i>
                </bk-radio-button>
            </bk-radio-group>
        </bk-form-item>
        <bk-form-item
            label="函数调用参数"
            ref="funcParams"
            property="funcParams"
            error-display-type="normal"
            :rules="[nameRule]"
            :desc="{ width: 350, content: '调用该函数传入的参数列表，如果函数用于组件事件，则这里是组件事件回调的参数，组件事件回调参数具体可见组件文档。' }">
            <dynamic-tag
                :disabled="disabled"
                v-model="form.funcParams"
                @change="(val) => tagChange('funcParams', val)">
            </dynamic-tag>
        </bk-form-item>
        <template v-if="form.funcType === 1">
            <bk-form-item
                label="Api"
                property="apiCode"
                error-display-type="normal"
                desc="使用Api管理的api做为模板，快速生成远程函数"
            >
                <bk-select
                    :value="form.apiCode"
                    :clearable="false"
                    :popover-options="{ appendTo: 'parent' }"
                    :disabled="disabled"
                    :loading="isLoading"
                    @toggle="handleToggle"
                    @selected="handleSelectApi"
                >
                    <bk-option v-for="api in apiList"
                        :key="api.code"
                        :id="api.code"
                        :name="`${api.name}（${api.url}）`">
                    </bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item
                label="请求地址"
                property="funcApiUrl"
                error-display-type="normal"
                :required="true"
                :rules="[requireRule('请求地址')]"
            >
                <bk-input
                    :value="form.funcApiUrl"
                    @change="(funcApiUrl) => updateValue({ funcApiUrl })"
                ></bk-input>
            </bk-form-item>
            <bk-form-item
                label="请求类型"
                property="funcMethod"
                error-display-type="normal"
                :required="true"
                :rules="[requireRule('请求类型')]"
            >
                <bk-select
                    :value="form.funcMethod"
                    :clearable="false"
                    :popover-options="{ appendTo: 'parent' }"
                    :disabled="disabled"
                    @selected="(funcMethod) => updateValue({ funcMethod })"
                >
                    <bk-option v-for="(apiMethodKey, apiMethodName) in API_METHOD"
                        :key="apiMethodKey"
                        :id="apiMethodKey"
                        :name="apiMethodName">
                    </bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item
                v-if="METHODS_WITHOUT_DATA.includes(form.funcMethod)"
                label="请求参数"
                property="remoteParams"
                error-display-type="normal">
                <query-params
                    :query="form.apiQuery"
                    :disabled="disabled"
                    :variable-list="variableList"
                    @change="(apiQuery) => updateValue({ apiQuery })"
                ></query-params>
            </bk-form-item>
            <bk-form-item
                v-else
                label="请求参数"
                property="remoteParams"
                error-display-type="normal">
                <body-params
                    :body="form.apiBody"
                    :disabled="disabled"
                    :variable-list="variableList"
                    @change="(apiBody) => updateValue({ apiBody })"
                >
                </body-params>
            </bk-form-item>
            <bk-form-item
                label="接口返回数据参数名"
                ref="remoteParams"
                property="remoteParams"
                error-display-type="normal"
                desc="该参数用于接收Api返回数据，在函数中直接可使用该变量名来操作Api返回数据"
                :rules="[nameRule]">
                <dynamic-tag
                    :disabled="disabled"
                    v-model="form.remoteParams"
                    @change="(val) => tagChange('remoteParams', val)">
                </dynamic-tag>
            </bk-form-item>
        </template>
    </bk-form>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'
    import mixins from './form-item-mixins'
    import DynamicTag from '@/components/dynamic-tag.vue'
    import QueryParams from './children/query-params.vue'
    import BodyParams from './children/body-params.vue'
    import {
        FUNCTION_TYPE
    } from 'shared/function/'
    import {
        METHODS_WITHOUT_DATA,
        API_METHOD,
        parseScheme2UseScheme
    } from 'shared/api'

    export default {
        components: {
            DynamicTag,
            QueryParams,
            BodyParams
        },

        mixins: [mixins],

        props: {
            requireSummary: {
                type: Boolean,
                default: false
            },
            variableList: {
                type: Array,
                default: () => ([])
            }
        },

        data () {
            return {
                tempList: [
                    { id: FUNCTION_TYPE.EMPTY, name: '空白函数' },
                    { id: FUNCTION_TYPE.REMOTE, name: '远程函数', info: '建议以下几种情况使用 "远程函数":\n1、远程API需要携带用户登录态认证\n2、远程API无法跨域或纯前端访问' }
                ],
                nameRule: {
                    validator: (val) => (val.length <= 0 || val.every(x => /^[A-Za-z_0-9]+$/.test(x))),
                    message: '由大小写英文字母、下划线、数字组成',
                    trigger: 'blur'
                },
                apiList: [],
                isLoading: false,
                METHODS_WITHOUT_DATA,
                API_METHOD
            }
        },

        computed: {
            ...mapGetters('projectVersion', ['currentVersionId']),

            projectId () {
                return parseInt(this.$route.params.projectId)
            },

            choosenApi () {
                return this.apiList.find(api => {
                    return api.code === this.form.apiCode
                }) || {}
            }
        },

        created () {
            this.getApiListFromApi()
        },

        methods: {
            ...mapActions('api', ['getApiList']),

            handleToggle (isOpen) {
                if (isOpen) {
                    this.getApiListFromApi()
                }
            },

            getApiListFromApi () {
                this.isLoading = true
                this.getApiList({
                    projectId: this.projectId,
                    versionId: this.currentVersionId
                }).then((res) => {
                    this.apiList = res
                }).finally(() => {
                    this.isLoading = false
                })
            },

            tagChange (key, val) {
                this.updateValue({ [key]: val })
                this.$nextTick(() => {
                    this.$refs[key] && this.$refs[key].validate()
                })
            },

            handleSelectApi (apiCode) {
                const api = this.apiList.find(api => api.code === apiCode)
                this.updateValue({
                    apiCode,
                    funcApiUrl: api.url,
                    funcMethod: api.method,
                    apiQuery: api.query.map(parseScheme2UseScheme),
                    apiBody: parseScheme2UseScheme(api.body)
                })
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .func-form-item .func-temp {
        width: 140px;
        max-width: calc(50% - 5px);
        /deep/ .bk-radio-button-text {
            width: 140px;
        }
        /deep/ .bk-radio-button-input:disabled+.bk-radio-button-text {
            border-left: 1px solid #dcdee5;
        }
    }
</style>
