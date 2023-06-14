<template>
    <article class="function-market-home">
        <section class="function-market-title">
            <section v-if="iamNoResourcesPerm[$IAM_ACTION.manage_function[0]]">
                <bk-button
                    class="mr5"
                    theme="primary"
                    @click="showMarketFunc.isShow = true"
                >{{ $t('新建函数') }}</bk-button>
                <bk-button
                    class="mr5"
                    @click="importData.show = true"
                >{{ $t('导入') }}</bk-button>
                <bk-button
                    class="mr5"
                    @click="exportMarketFuncs"
                >{{ $t('导出') }}</bk-button>
            </section>
            <bk-input class="fun-search" right-icon="bk-icon icon-search" v-model="searchStr" clearable :placeholder="$t('函数关键字')"></bk-input>
        </section>

        <section class="card-list" v-bkloading="{ isLoading }">
            <bk-card
                v-for="(card, index) in computedCardList"
                :key="index"
                :show-foot="true"
                :show-head="false"
                :border="false"
                class="function-card"
                @click.native="handleShowSource(card)">
                <h3 class="card-title">{{ card.funcName }}</h3>
                <p class="card-body" v-bk-overflow-tips>{{ $t(card.funcSummary) }}</p>
                <bk-popconfirm
                    v-if="iamNoResourcesPerm[$IAM_ACTION.manage_function[0]]"
                    :content="$t('确定删除该函数？')"
                    width="280"
                    @confirm="handleDeleteFunc(card)">
                    <i class="bk-icon icon-close delete-card"></i>
                </bk-popconfirm>

                <div slot="footer" class="foot-main">
                    <bk-button text class="foot-btn" v-enStyle="'flex:1.2'" @click.stop="handleShowSource(card)">{{ $t('查看源码') }}</bk-button>
                    <bk-divider direction="vertical"></bk-divider>
                    <bk-button text class="foot-btn" @click.stop="handleShowAddFuncFromMarket(card)">{{ $t('添加至应用') }}</bk-button>
                    <template v-if="iamNoResourcesPerm[$IAM_ACTION.manage_function[0]]">
                        <bk-divider direction="vertical"></bk-divider>
                        <bk-button text class="foot-btn" @click.stop="handleShowEditFunc(card)">{{ $t('编辑') }}</bk-button>
                    </template>
                </div>
            </bk-card>
        </section>
        <empty-status v-if="computedCardList.length <= 0" :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>

        <edit-market-func-sideslider
            :is-show.sync="showMarketFunc.isShow"
            :func-data.sync="showMarketFunc.func"
            :title="showMarketFunc.func.id ? $t('编辑函数') : $t('新建函数')"
            :function-list="cardList"
            @refresh="getCardList"
        />

        <create-func-from-market-sideslider
            :is-show.sync="showAddFuncFromMarket.isShow"
            :func-data.sync="showAddFuncFromMarket.func"
        />

        <show-func-dialog
            :is-show.sync="showSource.isShow"
            :func-data="showSource.func"
            :is-show-export="iamNoResourcesPerm[$IAM_ACTION.manage_function[0]]"
        />

        <import-function-dialog
            :show.sync="importData.show"
            :loading="importData.loading"
            @import="handleImport"
        >
            <bk-button @click="exportDemoFunction">{{ $t('示例') }}</bk-button>
        </import-function-dialog>
    </article>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ShowFuncDialog from '@/components/methods/forms/show-func-dialog.vue'
    import EditMarketFuncSideslider from '@/components/methods/forms/edit-market-func-sideslider'
    import CreateFuncFromMarketSideslider from '@/components/methods/forms/create-func-from-market-sideslider'
    import ImportFunctionDialog from '@/components/methods/import-function-dialog'
    import { getExportFunction } from 'shared/function'
    import { downloadFile } from '@/common/util.js'

    export default {
        components: {
            ShowFuncDialog,
            EditMarketFuncSideslider,
            CreateFuncFromMarketSideslider,
            ImportFunctionDialog
        },

        data () {
            return {
                searchStr: '',
                cardList: [],
                isLoading: false,
                showSource: {
                    isShow: false,
                    func: {}
                },
                showMarketFunc: {
                    isShow: false,
                    func: {}
                },
                showAddFuncFromMarket: {
                    isShow: false,
                    func: {}
                },
                importData: {
                    show: false,
                    loading: false
                }
            }
        },

        computed: {
            ...mapGetters(['iamNoResourcesPerm']),
            computedCardList () {
                return this.cardList.filter(card => (card.funcName || '').includes(this.searchStr))
            },
            emptyType () {
                if (this.searchStr?.length > 0) {
                    return 'search'
                }
                return 'noData'
            }
        },
        created () {
            this.initData()
        },

        methods: {
            ...mapActions('functionMarket', [
                'getFunctionList',
                'bulkCreateFunction',
                'deleteFunction'
            ]),

            initData () {
                this.getCardList()
            },

            getCardList () {
                this.isLoading = true
                this.getFunctionList().then((res) => {
                    this.cardList = res
                }).catch((err) => {
                    this.messageError(err.message || err)
                }).finally(() => {
                    this.isLoading = false
                })
            },

            handleDeleteFunc (func) {
                this.deleteFunction(func.id).then(() => {
                    this.messageSuccess(window.i18n.t('删除成功'))
                    this.getCardList()
                }).catch((err) => {
                    this.messageError(err.message || err)
                })
            },

            handleShowAddFuncFromMarket (func) {
                this.showAddFuncFromMarket.isShow = true
                this.showAddFuncFromMarket.func = func
            },

            handleShowEditFunc (func) {
                this.showMarketFunc.isShow = true
                this.showMarketFunc.func = func
            },

            handleShowSource (card) {
                this.showSource.isShow = true
                this.showSource.func = card
            },

            handleImport (funcList) {
                try {
                    if (funcList.length <= 0) {
                        throw new Error(window.i18n.t('JSON文件为空，暂无导入数据'))
                    }
                    this.importData.loading = true
                    this.bulkCreateFunction(funcList).then(() => {
                        this.importData.show = false
                        this.getCardList()
                    }).catch((err) => {
                        if (err.code === 499) {
                            this.messageHtmlError(err.message)
                        } else {
                            this.messageError(err.message || err)
                        }
                    }).finally(() => {
                        this.importData.loading = false
                    })
                } catch (err) {
                    this.messageError(err.message || err)
                }
            },

            exportDemoFunction () {
                const demoExportFunc = {
                    'funcName': 'getApiData',
                    'funcParams': [],
                    'funcBody': 'const data = res.data || []\r\nreturn data\r\n',
                    'funcSummary': window.i18n.t('远程函数，获取数据'),
                    'funcType': 1,
                    'funcMethod': 'get',
                    'withToken': 0,
                    'funcApiData': null,
                    'funcApiUrl': `${location.origin}/api/data/getMockData`,
                    'remoteParams': [
                        'res'
                    ]
                }
                downloadFile(getExportFunction(demoExportFunc), 'bklesscode-export-demo-market-func.json')
            },

            exportMarketFuncs () {
                downloadFile(getExportFunction(this.cardList), 'bklesscode-market-func.json')
            },
            handlerClearSearch (searchName) {
                this.searchStr = searchName
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .function-market-home {
        padding: 24px;
    }
    .function-market-title {
        display: flex;
        justify-content: space-between;
    }
    .fun-search {
        width: 400px;
    }
    .card-list {
        display: grid;
        grid-gap: 16px 12px;
        gap: 16px 12px;
        grid-template-columns: repeat(auto-fill,minmax(312px,1fr));
        width: 100%;
        -ms-flex-line-pack: start;
        align-content: flex-start;
        padding: 8px 0;
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: 16px;
        .exception-wrap-item {
            margin-top: calc(50vh - 180px);
        }
        &::after {
            content: '';
            clear: both;
            display: table;
        }
    }
    .function-card {
        height: 197px;
        float: left;
        box-shadow: 0px 2px 2px 0px rgb(0 0 0 / 11%);
        &:hover {
            box-shadow: 1px 2px 8px 2px rgb(0 0 0 / 11%);
            /deep/ .bk-tooltip {
                display: block;
            }
        }
        /deep/ .bk-tooltip {
            display: none;
            position: absolute;
            font-size: 20px;
            right: 6px;
            top: 2px;
        }
        /deep/ .bk-card-body {
            height: 150px;
            padding: 16px;
            line-height: 20px;
        }
        .card-title {
            margin: 0;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .card-body {
            font-size: 12px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 4;
            overflow: hidden;
            word-break: break-all;
        }
        .foot-main {
            line-height: 46px;
            height: 46px;
            display: flex;
            align-items: center;
            .foot-btn {
                flex: 1;
                height: auto;
                font-size: 12px;
            }
            /deep/ .bk-divider {
                margin: 0 !important;
                font-size: 20px;
            }
        }
    }
    .add-footer {
        margin-left: 30px;
        button {
            margin-right: 10px;
        }
    }
</style>
