<template>
    <article class="api-manage-home">
        <section class="api-main">
            <h3 class="api-head">
                <section>
                    <bk-button theme="primary" @click="handleCreateApi">新建</bk-button>
                </section>

                <bk-input
                    class="head-input"
                    placeholder="请输入"
                    right-icon="bk-icon icon-search"
                    clearable
                    v-model="searchApiStr"
                ></bk-input>
            </h3>

            <bk-table
                class="api-table"
                :data="computedApiList"
                :outer-border="false"
                :header-border="false"
                :header-cell-style="{ background: '#f0f1f5' }"
                :size="tableSetting.size"
                v-bkloading="{ isLoading }"
            >
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'name')"
                    label="名称"
                    prop="name"
                    show-overflow-tooltip
                    sortable
                >
                    <template slot-scope="props">
                        <span>{{ props.row.name || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'code')"
                    label="标识"
                    prop="code"
                    show-overflow-tooltip
                    sortable
                >
                    <template slot-scope="props">
                        <span>{{ props.row.code || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'categoryName')"
                    label="所属分类"
                    min-width="100px"
                    show-overflow-tooltip
                    sortable
                >
                    {{ categoryName }}
                </bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'method')"
                    label="方法"
                    prop="method"
                    show-overflow-tooltip
                    sortable
                >
                    <template slot-scope="props">
                        <span :class="[props.row.method, 'api-type']">{{ firstUpperCase(props.row.method) }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'url')"
                    label="路径"
                    prop="url"
                    show-overflow-tooltip
                    sortable
                >
                    <template slot-scope="props">
                        <span>{{ props.row.url || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'query')"
                    label="默认请求参数"
                    min-width="110px"
                    show-overflow-tooltip
                >
                    <template slot-scope="props">
                        <bk-button :text="true" title="primary" @click="showParamModel(props.row)">
                            查看
                        </bk-button>
                    </template>
                </bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'response')"
                    label="请求响应示例"
                    min-width="110px"
                    show-overflow-tooltip
                >
                    <template slot-scope="props">
                        <bk-button :text="true" title="primary" @click="showResponseModel(props.row)">
                            查看
                        </bk-button>
                    </template>
                </bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'useInfo')"
                    label="引用"
                    show-overflow-tooltip
                >
                    <template slot-scope="props">
                        <span
                            v-bk-tooltips.light="{
                                content: getUseInfoTips(props.row.useInfo).join('<br>'),
                                disabled: !getUseInfoTips(props.row.useInfo).length
                            }"
                            class="use-info"
                        >
                            {{ getUseInfoTips(props.row.useInfo).length }}
                        </span>
                    </template>
                </bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'funcSummary')"
                    label="备注"
                    prop="funcSummary"
                    show-overflow-tooltip
                    sortable
                >
                    <template slot-scope="props">
                        <span>{{ props.row.summary || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'updateUser')"
                    label="更新人"
                    min-width="90px"
                    prop="updateUser"
                    sortable
                    show-overflow-tooltip
                ></bk-table-column>
                <bk-table-column
                    v-if="tableSetting.selectedFields.find((selectedField) => selectedField.id === 'updateTime')"
                    label="更新时间"
                    min-width="100px"
                    prop="updateTime"
                    :formatter="timeFormatter"
                    show-overflow-tooltip
                    sortable
                ></bk-table-column>
                <bk-table-column
                    label="操作"
                    width="200"
                    fixed="right"
                >
                    <template slot-scope="props">
                        <span class="table-btn" @click="handleEditApi(props.row)">编辑</span>
                        <span class="table-btn" @click="handleCopyApi(props.row)">复制</span>
                        <span class="table-btn" @click="handleCreateFunction(props.row)">生成函数</span>
                        <span class="table-btn" @click="handleDeleteApi(props.row)">删除</span>
                    </template>
                </bk-table-column>
                <bk-table-column
                    type="setting"
                    :tippy-options="{ zIndex: 3000 }"
                >
                    <bk-table-setting-content
                        :fields="tableSetting.fields"
                        :selected="tableSetting.selectedFields"
                        :max="tableSetting.max"
                        :size="tableSetting.size"
                        @setting-change="handleTableSettingChange">
                    </bk-table-setting-content>
                </bk-table-column>
                <empty-status slot="empty" :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
            </bk-table>
        </section>

        <create-api-sideslider
            :title="apiData.title"
            :is-edit="apiData.isEdit"
            :form.sync="apiData.form"
            :is-show.sync="apiData.isShow"
            @success-submit="freshList"
        />

        <edit-func-sideslider
            title="添加函数"
            :is-show="editFuncObj.isShow"
            :is-edit="false"
            :func-data="editFuncObj.funcData"
            @close="handleCloseFunction"
        />

        <bk-dialog
            v-model="delObj.show"
            render-directive="if"
            theme="primary"
            ext-cls="delete-dialog-wrapper"
            title="确定删除？"
            width="400"
            footer-position="center"
            :mask-close="false"
            :auto-close="false"
        >
            <p class="delete-content">{{ delObj.nameTips }}</p>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="danger"
                    :loading="delObj.loading"
                    @click="requestDelete">删除</bk-button>
                <bk-button @click="delObj.show = false" :disabled="delObj.loading">取消</bk-button>
            </div>
        </bk-dialog>

        <bk-dialog
            width="1000"
            header-position="left"
            :title="apiModel.title"
            v-model="apiModel.show"
        >
            <monaco
                height="600"
                :read-only="true"
                :value="apiModel.jsonValue"
            />
        </bk-dialog>
    </article>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'
    import dayjs from 'dayjs'
    import CreateApiSideslider from '@/components/api/create-api-sideslider/index.vue'
    import Monaco from '@/components/monaco'
    import EditFuncSideslider from '@/components/methods/forms/edit-func-sideslider.vue'
    import {
        METHODS_WITHOUT_DATA,
        parseQueryScheme2QueryString,
        parseScheme2Value,
        parseScheme2UseScheme
    } from 'shared/api'
    import {
        getDefaultFunction,
        FUNCTION_TYPE,
        FUNCTION_TIPS
    } from 'shared/function'

    const tableFields = [
        { id: 'name', label: '名称', disabled: true },
        { id: 'code', label: '标识' },
        { id: 'categoryName', label: '所属分类' },
        { id: 'method', label: '方法' },
        { id: 'url', label: '路径' },
        { id: 'query', label: '默认请求参数' },
        { id: 'response', label: '请求响应示例' },
        { id: 'useInfo', label: '引用' },
        { id: 'funcSummary', label: '备注' },
        { id: 'updateUser', label: '更新人' },
        { id: 'updateTime', label: '更新时间' },
    ]

    export default {
        components: {
            CreateApiSideslider,
            Monaco,
            EditFuncSideslider
        },

        props: {
            categoryId: [String, Number],
            categoryName: String
        },

        data () {
            return {
                searchApiStr: '',
                isLoading: false,
                delObj: {
                    id: '',
                    loading: false,
                    show: false
                },
                apiData: {
                    title: '',
                    isShow: false,
                    isEdit: false,
                    form: {}
                },
                apiList: [],
                selectionData: [],
                isUploading: false,
                showImport: false,
                apiModel: {
                    title: '',
                    show: false,
                    jsonValue: ''
                },
                editFuncObj: {
                    isShow: false,
                    funcData: {}
                },
                tableSetting: {
                    max: 3,
                    fields: tableFields,
                    selectedFields: tableFields,
                    size: 'small'
                }
            }
        },

        computed: {
            ...mapGetters(['user']),

            projectId () {
                return parseInt(this.$route.params.projectId)
            },

            computedApiList () {
                const searchReg = new RegExp(this.searchApiStr, 'i')
                return this.apiList.filter((api) => searchReg.test(api.name))
            },
            emptyType () {
                if (this.searchApiStr?.length > 0) {
                    return 'search'
                }
                return 'noData'
            }
        },

        watch: {
            categoryId: {
                handler (val) {
                    if (![undefined, ''].includes(val)) {
                        this.initData()
                    }
                },
                immediate: true
            }
        },

        methods: {
            ...mapActions('api', [
                'getApiList',
                'deleteApi'
            ]),

            initData () {
                this.isLoading = true
                this.getApiList({
                    categoryId: this.categoryId,
                    projectId: this.projectId
                }).then((res) => {
                    this.apiList = res
                }).catch((err) => {
                    this.messageError(err.message || err)
                }).finally(() => {
                    this.isLoading = false
                })
            },

            handleCreateFunction (row) {
                this.editFuncObj.isShow = true
                this.editFuncObj.funcData = getDefaultFunction({
                    projectId: this.projectId,
                    funcType: FUNCTION_TYPE.REMOTE,
                    funcBody: FUNCTION_TIPS[FUNCTION_TYPE.REMOTE] + 'return res\n',
                    funcApiUrl: row.url,
                    funcMethod: row.method,
                    apiQuery: row.query.map(parseScheme2UseScheme),
                    apiBody: parseScheme2UseScheme(row.body)
                })
            },

            handleCloseFunction () {
                this.editFuncObj.isShow = false
                this.editFuncObj.funcData = {}
            },

            handleCreateApi () {
                this.apiData.isShow = true
                this.apiData.isEdit = false
                this.apiData.title = '新增 API'
                this.apiData.form = {
                    categoryId: this.categoryId,
                    projectId: this.projectId
                }
            },

            handleEditApi (row) {
                this.apiData.isShow = true
                this.apiData.isEdit = true
                this.apiData.title = '编辑 API'
                this.apiData.form = row
            },

            freshList () {
                this.$emit('freshList')
                this.initData()
            },

            handleCopyApi (row) {
                this.apiData.isShow = true
                this.apiData.isEdit = false
                this.apiData.title = '复制 API'
                const date = new Date()
                let name = row.name
                const apiList = this.apiList
                let repeatName = apiList.find(x => x.name === name)
                while (repeatName) {
                    name = `${name}Copy`
                    repeatName = apiList.find(x => x.name === name)
                }
                let code = row.code
                let repeatCode = apiList.find(x => x.code === code)
                while (repeatCode) {
                    code = `${code}Copy`
                    repeatCode = apiList.find(x => x.code === code)
                }
                this.apiData.form = Object.assign({}, row, {
                    id: undefined,
                    name,
                    updateUser: '',
                    createUser: '',
                    updateTime: '',
                    code,
                    createTime: date
                })
            },

            handleDeleteApi (row) {
                const isDisable = this.getDeleteStatus(row)
                if (isDisable) return

                this.delObj.show = true
                this.delObj.id = row.id
                this.delObj.nameTips = `删除 API【${row.name}】`
            },

            requestDelete () {
                this.delObj.loading = true
                this.deleteApi(this.delObj.id).then(() => {
                    this.delObj.show = false
                    this.freshList()
                    this.messageSuccess('删除成功')
                }).finally(() => {
                    this.delObj.loading = false
                })
            },

            timeFormatter (obj, con, val) {
                return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'
            },

            getUseInfoTips ({ funcCodes }) {
                const tips = []
                funcCodes?.forEach((funcCode) => {
                    tips.push(`函数标识【${funcCode}】`)
                })
                return tips
            },

            getDeleteStatus (row) {
                let tip = ''
                if (row.useInfo?.funcCodes?.length > 0) tip = '该 API 被函数引用，无法删除'
                return tip
            },

            showParamModel (row) {
                if (METHODS_WITHOUT_DATA.includes(row.method)) {
                    this.showModel(parseQueryScheme2QueryString(row.query), '默认请求参数（query）')
                } else {
                    this.showModel(parseScheme2Value(row.body), '默认请求参数（body）')
                }
            },

            showResponseModel (row) {
                this.showModel(parseScheme2Value(row.response), '请求响应示例')
            },

            showModel (jsonValue, title) {
                this.apiModel.title = title
                this.apiModel.show = true
                this.apiModel.jsonValue = JSON.stringify(jsonValue, null, 4)
            },

            firstUpperCase (val) {
                return val?.replace(/.?/, x => x.toUpperCase())
            },

            handleTableSettingChange ({ fields, size }) {
                this.tableSetting.size = size
                this.tableSetting.selectedFields = fields
            },

            handlerClearSearch (searchEmpty) {
                this.searchApiStr = searchEmpty
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .add-footer {
        margin-left: 30px;
        button {
            margin-right: 10px;
        }
    }

    .use-info {
        color: #3a84ff;
        cursor: pointer;
    }

    .api-main {
        width: 100%;
        height: 100%;
        padding: 16px 24px 16px 14px;
        .api-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 0 0 14px;
            padding: 0;
            font-weight: normal;
            .head-input {
                width: 400px;
            }
        }
        .api-table {
            height: calc(100% - 46px);
            /deep/ .bk-table-body-wrapper {
                height: calc(100% - 43px);
                overflow-y: auto;
            }
            th.is-leaf {
                border: none;
            }
            &:before {
                height: 0;
            }
            .max-tabel-prop {
                display: block;
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal;
            }
        }
        .table-btn {
            color: #3a84ff;
            margin-right: 17px;
            display: inline-block;
            cursor: pointer;
            &.disable {
                color: #b9bbc1;
                cursor: not-allowed;
            }
        }
    }

    /deep/ .delete-dialog-wrapper {
        .delete-content {
            text-align: center;
            font-size: 14px;
            color: #63656e;
            margin: 0;
            word-break: break-all;
        }
        .bk-dialog-footer {
            text-align: center;
            padding: 0 65px 30px;
            background-color: #fff;
            border: none;
            border-radius: 0;
        }
        .dialog-footer {
            button {
                width: 86px;
                &:first-child {
                    margin-right: 10px;
                }
            }
        }
    }

    .api-type {
        display: inline-block;
        text-align: center;
        width: 48px;
        height: 22px;
        line-height: 22px;
        border-radius: 2px;
        background: #cde8fb;
        &.delete {
            background: #f8d8d4;
        }
        &.put {
            background: #fff2c9;
        }
        &.post {
            background: #dbd4ed;
        }
    }
</style>
