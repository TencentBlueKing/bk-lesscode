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

<script lang="ts">
    import { mapGetters } from 'vuex'
    import { defineComponent } from '@vue/composition-api'
    import dayjs from '@/common/dayjs'

    export default defineComponent({
        name: 'project-list-table',
        props: {
            projectList: {
                type: Array,
                default: () => []
            },
            pageMap: {
                type: Object,
                default: () => ({})
            },
            emptyType: {
                type: String,
                default: 'noData'
            },
            filter: {
                type: String,
                default: ''
            }
        },
        inject: ['getUpdateInfo'],
        computed: {
            ...mapGetters(['iamNoResourcesPerm'])
        },
        setup (props, { emit }) {
            const handleCreate = () => {
                emit('create')
            }
            const handlePreview = (projectId) => {
                emit('preview', projectId)
            }
            const handleGotoPage = (projectId) => {
                emit('to-page', projectId)
            }
            const handleCopy = (project) => {
                emit('copy', project)
            }
            const handleExport = (project) => {
                emit('export', project)
            }
            const handleArchive = (projectId) => {
                emit('archive', projectId)
            }
            const handleReset = (projectId) => {
                emit('reset', projectId)
            }
            const handleRename = (project) => {
                emit('rename', project)
            }
            const handleDownloadSource = (project) => {
                emit('download', project)
            }
            const handleSetTemplate = (project) => {
                emit('set-template', project)
            }
            const handleClickFavorite = (project) => {
                emit('collect', project)
            }
            const handleRelease = (projectId) => {
                emit('release', projectId)
            }
            const handlerClearSearch = (searchName) => {
                emit('clearSearch', searchName)
            }
            const getFormatTime = (time) => {
                return window.i18n.t('{0}更新', [dayjs(time).fromNow()])
            }

            return {
                handleCreate,
                handlePreview,
                handleGotoPage,
                handleCopy,
                handleExport,
                handleArchive,
                handleReset,
                handleRename,
                handleDownloadSource,
                handleSetTemplate,
                handleClickFavorite,
                handleRelease,
                handlerClearSearch,
                getFormatTime
            }
        }
    })
</script>

<template>
    <div class="list-table">
        <bk-table
            class="project-table"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            :data="projectList">
            <bk-table-column :label="$t('table_应用名称')" prop="projectName" min-width="210" show-overflow-tooltip>
                <template v-slot="{ row }" v-if="filter !== 'archive'">
                    <div :class="['name-content', { favorite: row.favorite }]">
                        <auth-button
                            text
                            :permission="row.canDevelop"
                            auth="develop_app"
                            :resource-id="row.id"
                            :disabled="row.isExecuteDisable"
                            class="projectname"
                            @click="handleGotoPage(row.id)">
                            {{row.projectName}}
                        </auth-button>
                        <span class="favorite-btn" v-if="row.canDevelop">
                            <i :class="['bk-drag-icon', `bk-drag-favorite${row.favorite ? '' : '-o' }`]"
                                v-bk-tooltips.top="{ content: row.favorite ? $t('取消收藏') : $t('添加收藏') }"
                                @click.stop="handleClickFavorite(row)"
                            ></i>
                        </span>
                    </div>
                </template>
                <template v-else v-slot="{ row }">
                    {{ row.projectName }}
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('VUE 版本')" prop="framework" min-width="90" show-overflow-tooltip>
                <template v-slot="{ row }">
                    {{ row.framework || 'vue2' }}
                </template>
            </bk-table-column>
            <template v-if="filter !== 'archive'">
                <bk-table-column :label="$t('table_更新人')" prop="updateUser" min-width="90" show-overflow-tooltip>
                    <template v-slot="{ row }">
                        {{getUpdateInfo(row).updateUser}}
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('table_更新时间')" prop="updateTime" min-width="200" show-overflow-tooltip>
                    <template v-slot="{ row }">
                        {{getUpdateInfo(row).updateTimeFromNow}}
                    </template>
                </bk-table-column>
            </template>
            <template v-else>
                <bk-table-column :label="$t('归档人')" prop="updateUser" min-width="90" show-overflow-tooltip>
                    <template v-slot="{ row }">
                        {{ row.updateUser }}
                    </template>
                </bk-table-column>
                <bk-table-column :label="$t('归档时间')" prop="updateTime" min-width="200" show-overflow-tooltip>
                    <template v-slot="{ row }">
                        {{ getFormatTime(row.updateTime) }}
                    </template>
                </bk-table-column>
            </template>
            <bk-table-column :label="$t('操作')" min-width="150">
                <template v-slot="{ row }">
                    <template v-if="filter !== 'archive'">
                        <auth-button
                            text
                            :permission="row.canDevelop"
                            auth="develop_app"
                            :resource-id="row.id"
                            :disabled="row.isExecuteDisable"
                            class="edit-btn"
                            @click="handleGotoPage(row.id)">
                            {{ $t('开发应用') }} </auth-button>
                        <auth-button
                            text
                            :permission="row.canDevelop"
                            auth="develop_app"
                            :resource-id="row.id"
                            :disabled="row.isExecuteDisable"
                            class="preview-btn"
                            @click.stop="handlePreview(row.id)">
                            {{ $t('预览') }} </auth-button>
                        <auth-button
                            text
                            :permission="row.canDeploy"
                            auth="deploy_app"
                            :resource-id="row.id"
                            @click.stop="handleRelease(row.id)">
                            {{ $t('部署') }} </auth-button>
                        <bk-popover class="more-dot-menu"
                            placement="bottom-start"
                            theme="project-manage-more-dot-menu light"
                            :arrow="false"
                            offset="15"
                            :distance="0">
                            <span class="more-menu-trigger">
                                <i class="bk-drag-icon bk-drag-more-dot"></i>
                            </span>
                            <ul class="menu-list" slot="content">
                                <li>
                                    <auth-component :permission="row.canDevelop" auth="develop_app" :resource-id="row.id">
                                        <a href="javascript:;" slot="forbid">{{ $t('下载源码') }}</a>
                                        <a href="javascript:;" slot="allow" @click="handleDownloadSource(row)">{{ $t('下载源码') }}</a>
                                    </auth-component>
                                </li>
                                <li>
                                    <auth-component :permission="row.canDevelop" auth="develop_app" :resource-id="row.id">
                                        <a href="javascript:;" slot="forbid">{{ $t('页面管理') }}</a>
                                        <a href="javascript:;" slot="allow" @click="handleGotoPage(row.id)">{{ $t('页面管理') }}</a>
                                    </auth-component>
                                </li>
                                <li>
                                    <auth-component :permission="row.canDevelop" auth="develop_app" :resource-id="row.id">
                                        <a href="javascript:;" slot="forbid">{{ $t('重命名') }}</a>
                                        <a href="javascript:;" slot="allow" @click="handleRename(row)">{{ $t('重命名') }}</a>
                                    </auth-component>
                                </li>
                                <li>
                                    <auth-component :permission="row.canDevelop" auth="develop_app" :resource-id="row.id">
                                        <a href="javascript:;" slot="forbid">{{ $t('复制') }}</a>
                                        <a href="javascript:;" slot="allow" @click="handleCopy(row)">{{ $t('复制') }}</a>
                                    </auth-component>
                                </li>
                                <li>
                                    <auth-component :permission="row.canDevelop" auth="develop_app" :resource-id="row.id">
                                        <a href="javascript:;" slot="forbid">{{ $t('导出') }}</a>
                                        <a href="javascript:;" slot="allow" @click="handleExport(row)">{{ $t('导出') }}</a>
                                    </auth-component>
                                </li>
                                <li>
                                    <auth-component :permission="row.canDevelop" auth="develop_app" :resource-id="row.id">
                                        <a href="javascript:;" slot="forbid">{{ $t('归档') }}</a>
                                        <a href="javascript:;" slot="allow" @click="handleArchive(row.id)">{{ $t('归档') }}</a>
                                    </auth-component>
                                </li>
                                <li v-if="iamNoResourcesPerm[$IAM_ACTION.manage_template[0]]">
                                    <a href="javascript:;" @click="handleSetTemplate(row)">{{ $t('设为模板') }}</a>
                                </li>
                            </ul>
                        </bk-popover>
                    </template>
                    <template v-else>
                        <auth-button
                            text
                            :permission="row.canDevelop"
                            auth="develop_app"
                            :resource-id="row.id"
                            :disabled="row.isExecuteDisable"
                            class="edit-btn"
                            @click="handleReset(row.id)">
                            {{ $t('恢复') }} </auth-button>
                    </template>
                </template>
            </bk-table-column>
            <template v-slot:empty>
                <empty-status :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
            </template>
        </bk-table>
    </div>
</template>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
 
    .list-table {
        width: 100%;
        height: 100%;
        padding: 8px 0;

        .name-content {
            display: flex;
            align-items: center;

            .bk-drag-folder-fill {
                font-size: 16px;
                line-height: 18px;
                height: 20px;
                width: 20px;
                text-align: center;
                color: #979ba5;
                border-radius: 2px;
                background: #f0f1f5;
                margin-right: 8px;
            }

            ::v-deep .bk-link {
                &.projectname {
                    max-width: calc(100% - 22px);
                    justify-content: flex-start;
                    white-space: nowrap;
                }

                .bk-link-text {
                    font-size: 12px;
                    width: 100%;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
            }

            &.favorite {
                .favorite-btn {
                    opacity: 1;
                }
            }
        }

        .project-table {
            height: 100%;
            color: #63656E;
        }
        ::v-deep .bk-table-body-wrapper {
            height: calc(100% - 43px);
            overflow-y: auto;
            @mixin scroller;
        }
        /deep/.bk-table-empty-block{
            height: 280px;
        }
      
    }
    .bk-table-row {
        .bk-button-text + .bk-button-text {
            margin-left: 10px;
        }
        .more-dot-menu {
            margin-left: 8px;
        }

        .favorite-btn {
            opacity: 0;
            margin-left: 8px;
            transition: all .3s ease;

            .bk-drag-icon {
                font-size: 14px;
                color: #979BA5;
                cursor: pointer;

                &:hover {
                    color: #63656E;
                }
            }
            .bk-drag-favorite {
                color: #FE9C00;
                &:hover {
                    color: #E68C01;
                }
            }
        }

        &.hover-row {
            .favorite-btn {
                opacity: 1;
            }
        }
    }

    .more-menu-trigger {
        .bk-drag-more-dot {
            display: block;
            width: 24px;
            height: 24px;
            line-height: 26px;
            text-align: center;
            border-radius: 50%;
            cursor: pointer;
            font-size: 12px;
            color: #979BA5;
            &:hover {
                background: #EAEBF0;
            }
        }
    }
</style>
<style lang="postcss">
    .project-manage-more-dot-menu-theme {
        &.tippy-tooltip {
            background: #fff !important;
            padding: 5px 0 !important;
        }

        .menu-list {
            & > li {
                a {
                    display: block;
                    height: 32px;
                    line-height: 33px;
                    padding: 0 16px;
                    color: #63656e;
                    font-size: 12px;
                    white-space: nowrap;

                    &:hover {
                        background-color: #eaf3ff;
                        color: #3a84ff;
                    }
                }
            }
        }
    }
</style>
