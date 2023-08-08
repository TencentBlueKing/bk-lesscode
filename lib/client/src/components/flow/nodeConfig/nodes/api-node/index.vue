<template>
    <div class="api-node-form">
        <form-section :title="$t('基础配置')">
            <bk-form
                ref="basicForm"
                form-type="vertical"
                style="width: 656px;"
                :model="formData"
                :rules="rules">
                <div class="select-api">
                    <bk-form-item :label="$t('form_节点名称')" property="nodeName" :required="true">
                        <bk-input v-model="formData.nodeName" @change="handleNameChange"></bk-input>
                    </bk-form-item>
                    <bk-form-item :label="$t('处理人')" :required="true">
                        <processors
                            ref="processorsForm"
                            :value="processorData"
                            :workflow-id="nodeData.workflow"
                            :node-id="nodeData.id"
                            :exclude-type="excludeRoleType"
                            @change="handleProcessorChange">
                        </processors>
                    </bk-form-item>
                    <bk-form-item label="API">
                        <choose-api
                            :use-flow-esb-api="true"
                            :excluded="['apigateway-api']"
                            :value="formData.selectedApi"
                            @change="handleSelectApi">
                        </choose-api>
                    </bk-form-item>
                    <bk-form-item
                        :label="$t('form_请求地址')"
                        property="url"
                        desc-type="icon"
                        :desc="apiURLTips"
                        :required="true">
                        <div class="url-edit-input">
                            <bk-input v-model="formData.url" :disabled="urlEditDisabled" @change="update"></bk-input>
                            <i
                                v-if="lesscodeApiUrlToUpdate"
                                v-bk-tooltips.top="$t('接口路径有变更，点击更新')"
                                class="bk-drag-icon bk-drag-refresh-line refresh-icon"
                                @click="handleApiUrlUpdate">
                            </i>
                        </div>
                        <view-flow-variables :open-var-list.sync="openVarList"></view-flow-variables>
                        <div id="request-url-tips">
                            <p>{{`1.${$t('非蓝鲸网关API，请先接入')}【${$t('蓝鲸网关')}】`}}</p>
                            <p>{{`2.${$t('确保选择的蓝鲸网关API给蓝鲸应用ID')}【${BKPAAS_ENGINE_REGION === 'default' ? 'bk-itsm' : 'bkc-itsm'}】${$t('已授权并设置了用户免认证策略')}`}}</p>
                            <p>{{`3.${$t('请求地址可使用\{\{变量名\}\}引用流程上下文变量，比如')}http://host/\$\{id\}`}}
                                <bk-button
                                    style="padding: 0; height: initial; line-height: 14px;"
                                    size="small"
                                    :text="true"
                                    @click="openVarList = true">
                                    {{ $t('查看可用变量') }} </bk-button>
                            </p>
                        </div>
                    </bk-form-item>
                    <bk-form-item
                        :label="$t('form_请求类型')"
                        property="method"
                        :required="true">
                        <bk-select
                            v-model="formData.method"
                            :clearable="false"
                            :popover-options="{ appendTo: 'parent' }"
                            :disabled="!editable"
                            @selected="update">
                            <bk-option v-for="(apiMethodKey, apiMethodName) in API_METHOD"
                                :key="apiMethodKey"
                                :id="apiMethodKey"
                                :name="apiMethodName">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                </div>
            </bk-form>
        </form-section>
        <form-section
            :title="$t('请求头')"
            class="no-content-padding"
            style="margin-top: 16px;">
            <div class="headers-data" style="width: 83%; margin-top: 22px;">
                <headers-config ref="headerRef" :headers="apiHeaders" @update="handleParamsChange('apiHeaders', $event)"></headers-config>
            </div>
        </form-section>
        <form-section
            :title="$t('请求参数')"
            :desc="`（${$t('调用该API需要传递的参数信息')}）`"
            class="no-content-padding"
            style="margin-top: 16px;">
            <debug-api @extractScheme="handleExtractResponseFields"></debug-api>
            <div class="api-data" style="width: 83%; margin-top: 22px;">
                <query-params
                    v-if="METHODS_WITHOUT_DATA.includes(formData.method)" :variable-list="variableList"
                    ref="queryRef"
                    :query="apiQuery"
                    @update="handleParamsChange('apiQuery', $event)">
                </query-params>
                <body-params
                    v-else
                    ref="bodyRef"
                    :variable-list="variableList"
                    :body="apiBody"
                    @update="handleParamsChange('apiBody', $event)">
                </body-params>
            </div>
        </form-section>
        <!-- 返回数据 -->
        <form-section
            :title="$t('请求响应')"
            :desc="`（${$t('设置该API请求响应数据中的字段为全局变量，全局变量可在该API节点之后的流程节点中使用')}）`"
            class="no-content-padding"
            style="margin-top: 16px;">
            <div class="response-data" style="width: 83%; margin-top: 22px;">
                <response-variable
                    ref="responseRef"
                    :response="apiResponse"
                    @update="handleParamsChange('apiResponse', $event)">
                </response-variable>
            </div>
        </form-section>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import FormSection from '../../components/form-section.vue'
    import Processors from '../../components/processors.vue'
    import ChooseApi from '@/components/api/choose-api.vue'
    import ViewFlowVariables from './view-flow-variables.vue'
    import DebugApi from './debug-api.vue'
    import HeadersConfig from './headers-config'
    import QueryParams from './query-params.vue'
    import BodyParams from './body-params.vue'
    import ResponseVariable from './response-variable.vue'
    import { API_METHOD, METHODS_WITHOUT_DATA, parseScheme2UseScheme } from 'shared/api'
    import { transformItsmHeader2Scheme } from 'shared/no-code'
    import { messageError } from '@/common/bkmagic'

    export default {
        name: 'ApiNode',
        components: {
            FormSection,
            Processors,
            ChooseApi,
            ViewFlowVariables,
            DebugApi,
            HeadersConfig,
            QueryParams,
            BodyParams,
            ResponseVariable
        },
        props: {
            editable: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                API_METHOD,
                METHODS_WITHOUT_DATA,
                BKPAAS_ENGINE_REGION,
                apiListLoading: false,
                apiList: [],
                variableList: [],
                variableListLoading: false,
                formData: {
                    nodeName: '',
                    selectedApi: [],
                    url: '',
                    method: 'get'
                },
                apiHeaders: [],
                apiQuery: [],
                apiBody: {},
                apiResponse: {},
                excludeRoleType: ['CMDB', 'GENERAL', 'EMPTY', 'OPEN', 'BY_ASSIGNOR', 'IAM', 'API', 'ORGANIZATION'],
                openVarList: false,
                lesscodeApiUrlToUpdate: '', // 记录当前选中的应用自建API变更后的url
                apiURLTips: {
                    placement: 'right',
                    allowHtml: true,
                    zIndex: 2000,
                    content: '#request-url-tips'
                },
                rules: {
                    nodeName: [
                        {
                            required: true,
                            message: this.$t('节点名称为必填项'),
                            trigger: 'blur'
                        }
                    ],
                    url: [
                        {
                            required: true,
                            message: this.$t('必填项'),
                            trigger: 'blur'
                        }
                    ],
                    method: [
                        {
                            required: true,
                            message: this.$t('必填项'),
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        computed: {
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig']),
            ...mapGetters('projectVersion', ['currentVersionId']),
            ...mapGetters('nocode/nodeConfig', ['processorData']),
            projectId () {
                return parseInt(this.$route.params.projectId)
            },
            // 请求地址编辑禁用
            urlEditDisabled () {
                return this.formData.selectedApi.some(item => ['datasource-api', 'lesscode-api'].includes(item.id))
            }
        },
        created () {
            // webhook节点处理人不能为不限，但是创建节点时默认返回的不限，需要在编辑时清除
            if (this.excludeRoleType.includes(this.processorData.type)) {
                this.handleProcessorChange({ type: '', processors: '' })
            }
            const { api_info: apiInfo } = this.nodeData.extras
            this.formData.nodeName = this.nodeData.name
            if (apiInfo.url) {
                const { selectedApi, url, method, headers, query, body, response } = apiInfo
                this.formData = { ...this.formData, selectedApi, url, method }
                this.apiHeaders = this.transOldHeaderData(headers || [])
                this.apiQuery = query
                this.apiBody = body
                this.apiResponse = response
                if (selectedApi[0]?.id === 'lesscode-api') {
                    this.getLesscodeApiDetail(selectedApi[2].code)
                }
            }
            this.getApiList()
            this.getVariableList()
        },
        methods: {
            // 获取接口列表
            async getApiList () {
                try {
                    this.apiListLoading = true
                    const list = await this.$store.dispatch('api/getApiList', { projectId: this.projectId, versionId: this.versionId })
                    list.forEach(item => {
                        item.name = `${item.name}(${item.url})`
                    })
                    this.apiList = list
                } catch (e) {
                    console.error(e)
                } finally {
                    this.apiListLoading = false
                }
            },
            async getVariableList () {
                try {
                    const params = {
                        state: this.nodeData.id,
                        workflow: this.nodeData.workflow
                    }
                    const list = await this.$store.dispatch('nocode/flow/getNodeVars', params)
                    this.variableList = list.map(item => {
                        const { key, name } = item
                        return { variableCode: `{{${key}}`, variableName: name }
                    })
                } catch (e) {
                    messageError(e.message || e)
                }
            },
            // 获取当前选择的自建API详情，比较url是否发生修改
            async getLesscodeApiDetail (code) {
                const apiData = await this.$store.dispatch('api/getApiDetail', { code })
                if (apiData.url !== this.formData.url) {
                    this.lesscodeApiUrlToUpdate = apiData.url
                }
            },
            // 兼容旧数据
            // 旧版本header配置未使用统一组件，数据以itsm格式保存
            transOldHeaderData (headers) {
                if (headers.length > 0 && headers[0].hasOwnProperty('key') && !headers[0].hasOwnProperty('id')) {
                    return transformItsmHeader2Scheme(headers)
                }
                return headers
            },
            handleNameChange (val) {
                this.$store.commit('nocode/nodeConfig/setNodeName', val)
            },
            handleProcessorChange (val) {
                this.$store.commit('nocode/nodeConfig/updateProcessor', val)
            },
            // 选择接口
            handleSelectApi (api) {
                const { path, url, method, query, body, response } = api
                this.formData.selectedApi = path
                this.formData = { ...this.formData, url, method }
                this.apiQuery = query.map(parseScheme2UseScheme)
                this.apiBody = parseScheme2UseScheme(body)
                response.disabled = true
                this.apiResponse = response
                this.lesscodeApiUrlToUpdate = ''
                this.update()
            },
            // 更新应用自建api路径
            handleApiUrlUpdate () {
                this.formData.url = this.lesscodeApiUrlToUpdate
                this.lesscodeApiUrlToUpdate = ''
                this.update()
            },
            handleParamsChange (type, val) {
                this[type] = val
                this.update()
            },
            // 提取调试api返回的响应数据，生成响应参数scheme
            handleExtractResponseFields (scheme) {
                this.handleParamsChange('apiResponse', scheme)
            },
            validate () {
                const paramsRef = METHODS_WITHOUT_DATA.includes(this.formData.method) ? this.$refs.queryRef : this.$refs.bodyRef
                return Promise.all([
                    this.$refs.basicForm.validate(),
                    this.$refs.processorsForm.validate(),
                    this.$refs.headerRef.validate(),
                    paramsRef.validate(),
                    this.$refs.responseRef.validate()
                ]).then((result) => {
                    console.log('validate result: ', result)
                    return result.every(item => item === true)
                }).catch((e) => {
                    console.log('validate error: ', e)
                    return false
                })
            },
            update () {
                const { selectedApi, url, method } = this.formData
                const apiInfo = {
                    selectedApi,
                    method,
                    url,
                    headers: this.apiHeaders,
                    query: this.apiQuery,
                    body: this.apiBody,
                    response: this.apiResponse
                }

                this.$store.commit('nocode/nodeConfig/setApiNodeConfig', { projectId: this.projectId, data: apiInfo })
            }
        }
    }
</script>
<style lang="postcss" scoped>
.no-content-padding {
    >>> .section-content {
        padding: 0;
    }
}
>>> .bk-form {
    .bk-form-item + .bk-form-item {
        margin-top: 15px;
    }
    .bk-label {
        width: auto !important;
    }
}
.bk-form-radio {
    margin-right: 20px;
}
.api-node-form {
  .url-edit-input {
    position: relative;
    .refresh-icon {
        position: absolute;
        top: 9px;
        right: -20px;
        cursor: pointer;
        &:hover {
            color: #3a84ff;
        }
    }
  }
  .response-data {
    /deep/ .key-col {
      font-size: 12px;
      .cell {
        -webkit-line-clamp: initial;
        text-overflow: initial;
        white-space: nowrap;
      }
    }
    .key {
      position: relative;
      .fold-icon {
        position: absolute;
        top: 2px;
        left: -15px;
        display: inline-block;
        color: #c0c4cc;
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.2s ease-in-out;
        &:hover {
          color: #3a84ff;
        }
        &.extend {
          transform: rotate(90deg);
        }
      }
    }
    .set-global-var {
      display: flex;
      align-items: center;
    }
  }
}
.condition-group-wrapper {
  position: relative;
  margin-top: 10px;
  .group-title {
    margin-bottom: 6px;
    color: #63656e;
    font-weight: 700;
    font-size: 14px;
  }
  .condition-content {
    padding: 24px;
    background: #fafbfd;
    border: 1px solid #dcdee5;
    .field-relation {
      display: flex;
      align-items: center;
      & > span {
        margin-right: 30px;
        font-size: 14px;
        color: #63656e;
        white-space: nowrap;
      }
    }
    .expression-item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:not(:first-of-type) {
        margin-top: 16px;
      }
    }
    .opt-btns {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 40px;
      i {
        color: #c4c6cc;
        cursor: pointer;
        &:not(.disabled):hover {
          color: #979ba5;
        }
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
  }
  .delete-icon {
    position: absolute;
    top: 40px;
    right: 6px;
    font-size: 18px;
    color: #c4c6cc;
    cursor: pointer;
    &:not(.disabled):hover {
      color: #3a84ff;
    }
    &.disabled {
      cursor: not-allowed;
    }
  }
}
.create-group-btn {
  & > span {
    display: inline-flex;
    align-items: center;
    margin-top: 15px;
    font-size: 14px;
    line-height: 1;
    color: #3a84ff;
    cursor: pointer;
  }
}
.poll-form-area {
  margin-top: 10px;
  .poll-setting {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    .bk-form-item {
      flex: 1;
      margin-top: 0;
      &.time-interval-form {
        margin-right: 24px;
        /deep/.bk-form-control {
          position: relative;
          padding-right: 42px;
        }
      }
      .time-unit {
        position: absolute;
        top: 1px;
        right: 1px;
        display: inline-block;
        width: 42px;
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        text-align: center;
        color: #63656e;
        border: 1px solid #c4c6cc;
        border-left: none;
        border-radius: 0 2px 2px 0;
      }
    }
  }
}
</style>
