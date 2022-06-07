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
                v-bkloading="{ isLoading }"
            >
                <bk-table-column label="名称" prop="name" show-overflow-tooltip>
                    <template slot-scope="props">
                        <span>{{ props.row.name || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column label="标识" prop="code" show-overflow-tooltip>
                    <template slot-scope="props">
                        <span>{{ props.row.code || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column label="所属分类" show-overflow-tooltip>
                    {{ categoryName }}
                </bk-table-column>
                <bk-table-column label="方法" prop="method" show-overflow-tooltip>
                    <template slot-scope="props">
                        <span>{{ props.row.method || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column label="路径" prop="url" show-overflow-tooltip>
                    <template slot-scope="props">
                        <span>{{ props.row.url || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column label="请求参数模型" show-overflow-tooltip>
                    <template slot-scope="props">
                        <bk-button :text="true" title="primary" @click="showParamModel(props.row)">
                            查看
                        </bk-button>
                    </template>
                </bk-table-column>
                <bk-table-column label="返回结果模型" show-overflow-tooltip>
                    <template slot-scope="props">
                        <bk-button :text="true" title="primary" @click="showModel(props.row.response, '返回结果模型')">
                            查看
                        </bk-button>
                    </template>
                </bk-table-column>
                <bk-table-column label="备注" prop="funcSummary" show-overflow-tooltip>
                    <template slot-scope="props">
                        <span>{{ props.row.summary || '--' }}</span>
                    </template>
                </bk-table-column>
                <bk-table-column label="更新人" prop="updateUser"></bk-table-column>
                <bk-table-column label="更新时间" prop="updateTime" :formatter="timeFormatter" show-overflow-tooltip sortable></bk-table-column>
                <bk-table-column label="操作" width="180">
                    <template slot-scope="props">
                        <span class="table-btn" @click="handleEditApi(props.row)">编辑</span>
                        <span class="table-btn" @click="handleCopyApi(props.row)">复制</span>
                        <span @click="handleDeleteApi(props.row)"
                            v-bk-tooltips="{ content: getDeleteStatus(props.row), disabled: !getDeleteStatus(props.row) }"
                            :class="{ 'table-btn': true, disable: getDeleteStatus(props.row) }"
                        >删除</span>
                    </template>
                </bk-table-column>
            </bk-table>
        </section>

        <create-api-sideslider
            :title="apiData.title"
            :is-edit="apiData.isEdit"
            :form.sync="apiData.form"
            :is-show.sync="apiData.isShow"
            @success-submit="freshList"
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
            width="800"
            :title="apiModel.title"
            v-model="apiModel.show"
        >
            <monaco
                :read-only="true"
                :value="apiModel.jsonValue"
            />
        </bk-dialog>
    </article>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'
    import dayjs from 'dayjs'
    import CreateApiSideslider from './create-api-sideslider/index.vue'
    import {
        METHODS_WITHOUT_DATA,
        parseJsonScheme2JsonValue
    } from 'shared/api'
    import monaco from '@/components/monaco'

    export default {
        components: {
            CreateApiSideslider,
            monaco
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
                }
            }
        },

        computed: {
            ...mapGetters(['user']),
            ...mapGetters('member', ['userPerm']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId', versionName: 'currentVersionName' }),

            projectId () {
                return parseInt(this.$route.params.projectId)
            },

            computedApiList () {
                const searchReg = new RegExp(this.searchApiStr, 'i')
                return this.apiList.filter((api) => searchReg.test(api.name))
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
                    projectId: this.projectId,
                    versionId: this.versionId
                }).then((res) => {
                    this.apiList = res
                }).catch((err) => {
                    this.messageError(err.message || err)
                }).finally(() => {
                    this.isLoading = false
                })
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

            getUseInfoTips ({ funcCodes, pageNames, variableCodes }) {
                const tips = []
                funcCodes?.forEach((funcCode) => {
                    tips.push(`API 标识【${funcCode}】`)
                })
                pageNames?.forEach((pageName) => {
                    tips.push(`页面名称【${pageName}】`)
                })
                variableCodes?.forEach((variableCode) => {
                    tips.push(`变量标识【${variableCode}】`)
                })
                return tips
            },

            getDeleteStatus (row) {
                const user = this.user || {}
                const username = user.bk_username || user.username
                let tip = ''
                if (this.userPerm.roleId !== 1 && username !== row.createUser) tip = '只有管理员或自己创建的才有删除权限'
                return tip
            },

            showParamModel (row) {
                if (METHODS_WITHOUT_DATA.includes(row.method)) {
                    this.showModel(row.query, '请求参数模型（query）')
                } else {
                    this.showModel(row.body, '请求参数模型（body）')
                }
            },

            showModel (model, title) {
                this.apiModel.title = title
                this.apiModel.show = true
                this.apiModel.jsonValue = JSON.stringify(parseJsonScheme2JsonValue(model), null, 4)
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
</style>
