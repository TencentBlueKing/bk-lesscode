<template>
    <div :class="$style['component-manage-useing-page']">
        <div :class="$style['search']">
            <div :class="$style['version-selector']">
                {{ $t('应用版本：') }}：<project-version-selector :bordered="false" :popover-width="200" v-model="projectVersionId" />
            </div>
            <div :class="$style['comp-type-select']">
                <type-select @select-change="handleSelectChange"></type-select>
                <bk-input
                    :class="$style['search-input']"
                    right-icon="bk-icon icon-search"
                    :placeholder="$t('请输入组件名称')"
                    v-model.trim="keyword"
                    @clear="handleSearch"
                    @enter="handleSearch"
                    :clearable="true" />
            </div>
        </div>
        <div :class="$style['data-list']" v-bkloading="{ isLoading, opacity: 0.1 }">
            <bk-table
                class="g-hairless-table"
                :outer-border="false"
                :header-border="false"
                :header-cell-style="{ background: '#f0f1f5' }"
                :data="list"
                v-show="!isLoading">
                <bk-table-column :label="$t('table_组件名称')" prop="compName" min-width="180" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        <span :class="$style['comp-type']">
                            <i v-if="row.compType === 'MOBILE'" class="bk-drag-icon bk-drag-mobilephone"> </i>
                            <i v-else class="bk-drag-icon bk-drag-pc"> </i>
                        </span>
                        <span :class="$style['component-name']">{{ row.displayName }}({{ row.name }})</span>
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('table_来源应用')" prop="compSource" min-width="140" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        <span>{{row.belongProjectId !== row.sourceProject.id ? row.sourceProject.projectName : $t('本应用')}}</span>
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('所属分类')" prop="category" min-width="120" sortable show-overflow-tooltip />
                <!-- <bk-table-column label="是否公开" prop="isPublic" show-overflow-tooltip>
                </bk-table-column> -->
                <bk-table-column :label="$t('使用版本')" prop="currentVersion" width="150" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        <div :class="[$style['component-version'], { [$style['outdate']]: row.useingVersion.versionId !== row.versionId }]"
                            @click="handleVersionDetail(row, 1)">
                            <span>{{ row.useingVersion.version }}</span>
                            <i class="bk-drag-icon bk-drag-info-fill" style="margin-left: 8px" />
                        </div>
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('table_最新版本')" prop="latestVersion" width="150" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        <div :class="$style['component-version']" @click="handleVersionDetail(row)">
                            <span>{{ row.version }}</span>
                            <i class="bk-drag-icon bk-drag-info-fill" style="margin-left: 8px" />
                        </div>
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('table_使用页面')" prop="usingPage" min-width="280" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        <span :class="$style['component-pages']">
                            <span>{{ (row.pageList || []).map(_ => _.pageName).join('、') }}</span>
                        </span>
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('操作')" width="120">
                    <template slot-scope="{ row }">
                        <span v-bk-tooltips="{ content: $t('已升级到最新版本'), placements: ['top'], disabled: row.useingVersion.versionId !== row.versionId }">
                            <bk-button
                                text
                                :disabled="row.useingVersion.versionId === row.versionId"
                                @click="handleUpdate(row)">
                                {{ $t('升级') }} </bk-button>
                        </span>
                    </template>
                </bk-table-column>
                <empty-status slot="empty" :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
            </bk-table>
        </div>

        <bk-dialog v-model="updateDialog.visible"
            render-directive="if"
            theme="primary"
            ext-cls="confirm-dialog-wrapper"
            :title="$t('确认升级组件')"
            width="400"
            footer-position="center"
            :mask-close="false"
            :auto-close="false">
            <p class="tips-content">
                {{ $t('将会把该应用“{0}”版本里所有页面中使用到的【{1}】组件统一升级到【{2}】版本，请谨慎操作', [selectedProjectVersionName, updateDialog.data.displayName, updateDialog.data.version]) }} </p>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :loading="updateDialog.loading"
                    @click="handleUpdateConfirm">{{ $t('升级') }}</bk-button>
                <bk-button @click="updateDialog.visible = false" :disabled="updateDialog.loading">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>

        <version-log
            :is-show.sync="isShowVersionLog"
            :data="verionDetail" />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import VersionLog from '@/components/version-log'
    import typeSelect from '@/components/project/type-select'

    export default {
        name: '',
        components: {
            VersionLog,
            typeSelect
        },
        data () {
            return {
                isLoading: false,
                data: [],
                list: [],
                keyword: '',
                isShowVersionLog: false,
                isShowUpdateDialog: false,
                updateDialog: {
                    visible: false,
                    loading: false,
                    data: {}
                },
                verionDetail: {},
                selectedProjectVersionId: '',
                compType: 'ALL',
                emptyType: 'noData'
            }
        },
        computed: {
            ...mapGetters('projectVersion', ['getVersionById']),
            projectVersionId: {
                get () {
                    return this.getInitialVersion().id
                },
                set (id) {
                    this.selectedProjectVersionId = id
                }
            },
            selectedProjectVersionName () {
                return this.getVersionById(this.selectedProjectVersionId).version
            }
        },
        watch: {
            keyword (val) {
                if (!val) {
                    this.handleSearch()
                }
            },
            selectedProjectVersionId () {
                this.fetchData()
            }
        },
        methods: {
            async fetchData () {
                this.isLoading = true
                this.data = await this.$store.dispatch('components/useing', {
                    belongProjectId: parseInt(this.$route.params.projectId),
                    projectVersionId: this.selectedProjectVersionId || ''
                })
                this.list = this.data
                this.isLoading = false
            },
            async handleUpdateConfirm () {
                this.updateDialog.loading = true
                try {
                    await this.$store.dispatch('components/updatePageComp', {
                        projectId: parseInt(this.$route.params.projectId),
                        projectVersionId: this.selectedProjectVersionId || '',
                        compId: this.updateDialog.data.id,
                        versionId: this.updateDialog.data.versionId,
                        displayName: this.updateDialog.data.displayName
                    })
                    this.updateDialog.visible = false
                    this.fetchData()
                    this.messageSuccess(window.i18n.t('升级成功'))
                } catch (e) {
                    console.error(e)
                } finally {
                    this.updateDialog.loading = false
                }
            },
            handleUpdate (payload) {
                this.updateDialog.visible = true
                this.updateDialog.data = payload
            },
            handleVersionDetail (comp, isCurrent) {
                this.verionDetail = isCurrent ? { ...comp, ...comp.useingVersion } : comp
                this.isShowVersionLog = true
            },
            handleSearch () {
                if (!this.keyword) {
                    this.list = this.data
                    this.emptyType = 'noData'
                } else {
                    this.list = this.data.filter(item => {
                        return item.displayName.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1
                            || item.name.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1
                    })
                    this.emptyType = 'search'
                }
                this.handleTypeChange()
            },
            handleTypeChange () {
                if (this.compType === 'PC') {
                    this.list = this.list.filter(item => item.compType !== 'MOBILE')
                } else if (this.compType === 'MOBILE') {
                    this.list = this.list.filter(item => item.compType === 'MOBILE')
                }
            },
            getInitialVersion () {
                return this.$store.getters['projectVersion/initialVersion']()
            },
            handleSelectChange (type) {
                this.compType = type
                this.handleSearch()
            },
            handlerClearSearch (searchName) {
                this.keyword = searchName
            }
        }
    }
</script>
<style lang="postcss" module>
    .component-manage-useing-page {
        padding: 14px 27px 22px 32px;

        .search {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;

            .version-selector {
                display: flex;
                align-items: center;
            }

            .search-input {
                width: 400px;
            }

            .comp-type-select{
                display: flex;
            }
        }

        .data-list {
            min-height: calc(100vh - 250px);

            .comp-type {
                font-size: 16px;
                color: #979ba5;
                margin-right: 10px;
            }
        }

        .component-version {
            display: flex;
            align-items: center;
            height: 24px;
            padding-left: 3px;
            color: #3A84FF;
            font-weight: bold;
            background: #e1ecff;
            border-radius: 2px;
            cursor: pointer;
            &:hover{
                background: #A2C5FD;
            }

            &.outdate {
                background: #F0F1F5;
                &:hover {
                    background: #DCDEE5;
                }
            }
        }
    }

    :global {
        .confirm-dialog-wrapper {
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
                }
            }
        }
    }
</style>
