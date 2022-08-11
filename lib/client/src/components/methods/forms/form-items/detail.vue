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
            :rules="[getParamRule('函数调用参数')]"
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
                property="apiChoosePath"
                error-display-type="normal"
                desc="使用 Api 管理的 api 做为模板，快速生成远程函数"
            >
                <choose-api
                    :value="form.apiChoosePath"
                    :disabled="disabled"
                    @change="handleSelectApi"
                ></choose-api>
            </bk-form-item>
            <bk-form-item
                label="请求地址"
                property="funcApiUrl"
                error-display-type="normal"
                desc="请求地址中可以使用 {变量标识} 的格式来使用变量。注意：如果地址中有*，表示可以匹配任意字符串，请替换成真实的路径"
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
            <bk-button
                class="get-remote-response bk-form-item"
                size="small"
                :loading="isLoadingResponse"
                @click="getRemoteResponse"
            >获取接口返回数据</bk-button>
            <bk-form-item
                v-if="METHODS_WITHOUT_DATA.includes(form.funcMethod)"
                label="请求参数"
                property="remoteParams"
                error-display-type="normal">
                <query-params
                    class="mt38"
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
                    class="mt38"
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
                :rules="[getParamRule('接口返回数据参数名')]">
                <dynamic-tag
                    :disabled="disabled"
                    v-model="form.remoteParams"
                    @change="(val) => tagChange('remoteParams', val)">
                </dynamic-tag>
            </bk-form-item>
        </template>
        <bk-dialog
            width="1000"
            title="查看接口返回值"
            v-model="showFuncResponse.show"
        >
            <monaco
                height="600"
                :read-only="true"
                :value="showFuncResponse.code"
            />
        </bk-dialog>
    </bk-form>
</template>

<script>
    import { mapGetters } from 'vuex'
    import mixins from './form-item-mixins'
    import DynamicTag from '@/components/dynamic-tag.vue'
    import QueryParams from './children/query-params.vue'
    import BodyParams from './children/body-params.vue'
    import monaco from '@/components/monaco'
    import ChooseApi from '@/components/api/choose-api.vue'
    import {
        FUNCTION_TYPE,
        replaceFuncParam
    } from 'shared/function/'
    import {
        METHODS_WITHOUT_DATA,
        API_METHOD,
        parseScheme2UseScheme,
        parseScheme2Value,
        LCGetParamsVal
    } from 'shared/api'
    import {
        getVariableValue
    } from 'shared/variable'

    export default {
        components: {
            DynamicTag,
            QueryParams,
            BodyParams,
            monaco,
            ChooseApi
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
                isLoadingResponse: false,
                METHODS_WITHOUT_DATA,
                API_METHOD,
                showFuncResponse: {
                    show: false,
                    code: ''
                }
            }
        },

        computed: {
            ...mapGetters('projectVersion', ['currentVersionId']),

            projectId () {
                return parseInt(this.$route.params.projectId)
            }
        },

        methods: {
            tagChange (key, val) {
                this.updateValue({ [key]: val })
                this.$nextTick(() => {
                    this.$refs[key] && this.$refs[key].validate()
                })
            },

            handleSelectApi (api) {
                this.updateValue({
                    apiChoosePath: api.path,
                    funcApiUrl: api.url,
                    funcMethod: api.method,
                    funcSummary: api.summary,
                    apiQuery: api.query.map(parseScheme2UseScheme),
                    apiBody: parseScheme2UseScheme(api.body)
                })
            },

            getRemoteResponse () {
                this
                    .$refs
                    .funcForm
                    .validate()
                    .then(() => {
                        this.isLoadingResponse = true
                        let apiData = {}
                        if (METHODS_WITHOUT_DATA.includes(this.form.funcMethod)) {
                            this.form.apiQuery.forEach((queryItem) => {
                                apiData[queryItem.name] = parseScheme2Value(queryItem, LCGetParamsVal(this.variableList))
                            })
                        } else {
                            apiData = parseScheme2Value(this.form.apiBody, LCGetParamsVal(this.variableList))
                        }
                        const url = replaceFuncParam(this.form.funcApiUrl, (variableCode) => {
                            const variable = this.variableList.find((variable) => (variable.variableCode === variableCode))
                            if (variable) {
                                return getVariableValue(variable)
                            } else {
                                throw new Error(`函数请求地址里引用的变量【${variableCode}】不存在，请检查并创建该变量`)
                            }
                        })
                        const httpData = {
                            url,
                            type: this.form.funcMethod,
                            apiData,
                            withToken: this.form.withToken
                        }
                        return this
                            .$store
                            .dispatch('getApiData', httpData)
                            .then((res) => {
                                this.showFuncResponse.show = true
                                this.showFuncResponse.code = JSON.stringify(res, null, 4)
                            })
                            .catch((err) => {
                                this.messageError(err.message || err)
                            })
                    })
                    .catch((err) => {
                        this.messageError(err.content || err.message || err)
                    })
                    .finally(() => {
                        this.isLoadingResponse = false
                    })
            },

            getParamRule (label) {
                return {
                    validator: (val) => (val.length <= 0 || val.every(x => /^[A-Za-z_0-9]+$/.test(x))),
                    message: `${label}由大小写英文字母、下划线、数字组成`,
                    trigger: 'blur'
                }
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .func-form-item {
        position: relative;
    }
    .func-temp {
        width: 140px;
        max-width: calc(50% - 5px);
        /deep/ .bk-radio-button-text {
            width: 140px;
            font-size: 12px;
        }
        /deep/ .bk-radio-button-input:disabled+.bk-radio-button-text {
            border-left: 1px solid #dcdee5;
        }
    }
    .get-remote-response {
        position: absolute;
        left: 60px;
        z-index: 2;
        margin-top: 10px !important;
    }
    .add-api-link {
        /deep/ .bk-link-text {
            font-size: 12px;
        }
        .bk-icon {
            margin-right: 5px;
        }
    }
    .mt38 {
        margin-top: 38px;
    }
</style>
