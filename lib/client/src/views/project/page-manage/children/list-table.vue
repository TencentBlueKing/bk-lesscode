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
    import { defineComponent } from '@vue/composition-api'

    export default defineComponent({
        name: 'page-list-table',
        props: {
            pageList: {
                type: Array,
                default: () => []
            },
            routeMap: {
                type: Object,
                default: () => ({})
            },
            nocodeTypeMap: {
                type: Object,
                default: () => ({})
            },
            emptyType: {
                type: String,
                default: 'noData'
            }
        },
        inject: ['getRelativeTime', 'getFormManagePages'],
        setup (props, { emit }) {
            const handleCreate = () => {
                emit('create')
            }
            const handlePreview = (page) => {
                emit('preview', page)
            }
            const handleEditPage = (page) => {
                emit('edit', page)
            }
            const handleCopy = (page) => {
                emit('copy', page)
            }
            const handleRename = (page) => {
                emit('rename', page)
            }
            const handleEditRoute = (page) => {
                emit('edit-route', page)
            }
            const handleDelete = (page) => {
                emit('delete', page)
            }
            const handleDownloadSource = (targetData, pageId, styleSetting) => {
                emit('download', targetData, pageId, styleSetting)
            }
            const handleCreateFormManage = (page) => {
                emit('create-form', page)
            }
            const handlerClearSearch = (searchName) => {
                emit('clear-search', searchName)
            }

            return {
                handleCreate,
                handlePreview,
                handleEditPage,
                handleCopy,
                handleRename,
                handleEditRoute,
                handleDelete,
                handleDownloadSource,
                handleCreateFormManage,
                handlerClearSearch
            }
        }
    })
</script>

<template>
    <div class="list-table">
        <bk-table
            class="page-table"
            :outer-border="false"
            :header-border="false"
            :header-cell-style="{ background: '#f0f1f5' }"
            :data="pageList">
            <bk-table-column :label="$t('table_页面名称')" prop="pageName" min-width="210" show-overflow-tooltip>
                <template v-slot="{ row }">
                    <div class="pagename-content">
                        <span class="page-type">
                            <i v-if="row.pageType === 'MOBILE'" class="bk-drag-icon bk-drag-mobilephone"></i>
                            <i v-else class="bk-drag-icon bk-drag-pc"></i>
                        </span>
                        <bk-link theme="primary" class="pagename"
                            @click="handleEditPage(row)">
                            {{row.pageName}}
                        </bk-link>
                    </div>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('table_页面类型')" prop="nocodeType" min-width="120">
                <template v-slot="{ row }">
                    <span
                        class="nocode-type-tag"
                        :style="{
                            background: nocodeTypeMap.bgColor[row.nocodeType] || '#eaebf0',
                            color: nocodeTypeMap.color[row.nocodeType] || '#8a8a8a'
                        }">
                        <bk-popover
                            v-if="row.nocodeType === 'FORM' && getFormManagePages(row.formId).length"
                            ext-cls="form-manage-page-list"
                            placement="right-start"
                            theme="light"
                            width="300">
                            <section style="display: flex; align-items: center; cursor: pointer;">
                                {{nocodeTypeMap.title[row.nocodeType] || row.nocodeType}}
                                <i class="bk-drag-icon bk-drag-data-source-manage" style="margin: 0 2px;"></i>
                                <span>{{getFormManagePages(row.formId).length}}</span>
                            </section>
                            <div slot="content" class="form-manage-list">
                                <div class="list-title"><span>{{ $t('关联的表单数据管理页') }}</span></div>
                                <ul class="list-ul">
                                    <li v-for="item in getFormManagePages(row.formId)" :key="item.id">
                                        <i class="bk-drag-icon bk-drag-page"></i>
                                        <span class="name">{{item.pageName}}</span>
                                        <i :title="$t('预览')" class="bk-icon icon-eye click-icon" @click="handlePreview(item)"></i>
                                        <i :title="$t('编辑')" class="bk-drag-icon bk-drag-edit click-icon" style="font-size: 16px;" @click="handleEditPage(item)"></i>
                                    </li>
                                </ul>
                            </div>
                        </bk-popover>
                        <section style="cursor: default;" v-else>{{nocodeTypeMap.title[row.nocodeType] || $t('自定义页')}}</section>
                    </span>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('路由')" min-width="150" show-overflow-tooltip>
                <template v-slot="{ row }">
                    <div class="route-content">
                        <span class="fullpath" :title="routeMap[row.id].fullPath" v-if="routeMap[row.id].id">
                            {{routeMap[row.id].fullPath}}
                        </span>
                        <span class="unset" v-else>{{ $t('未配置') }}</span>
                    </div>
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('table_更新人')" prop="updateUser" min-width="90" show-overflow-tooltip>
                <template v-slot="{ row }">
                    {{row.updateUser || row.createUser}}
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('table_更新时间')" prop="updateTime" min-width="200" show-overflow-tooltip>
                <template v-slot="{ row }">
                    {{getRelativeTime(row.updateTime)}}
                </template>
            </bk-table-column>
            <bk-table-column :label="$t('操作')" min-width="150">
                <template v-slot="{ row }">
                    <bk-button class="edit-btn" text theme="primary" @click="handleEditPage(row)">{{ $t('编辑') }}</bk-button>
                    <bk-button class="preview-btn" text @click.stop="handlePreview(row)">{{ $t('预览') }}</bk-button>
                    <bk-popover class="more-dot-menu"
                        placement="bottom-start"
                        theme="page-manage-more-dot-menu light"
                        :arrow="false"
                        offset="15"
                        :distance="0">
                        <span class="more-menu-trigger">
                            <i class="bk-drag-icon bk-drag-more-dot"></i>
                        </span>
                        <ul class="menu-list" slot="content">
                            <li v-if="!row.nocodeType"><a href="javascript:;" @click="handleDownloadSource(row)">{{ $t('下载源码') }}</a></li>
                            <li><a href="javascript:;" @click="handleRename(row)">{{ $t('重命名') }}</a></li>
                            <li v-if="!row.nocodeType"><a href="javascript:;" @click="handleCopy(row)">{{ $t('复制') }}</a></li>
                            <li><a href="javascript:;" @click="handleEditRoute(row)">{{ $t('修改路由') }}</a></li>
                            <li v-if="row.nocodeType === 'FORM'"><a href="javascript:;" @click="handleCreateFormManage(row)">{{ $t('生成数据管理页') }}</a></li>
                            <li><a href="javascript:;" @click="handleDelete(row)">{{ $t('删除') }}</a></li>
                        </ul>
                    </bk-popover>
                </template>
            </bk-table-column>
            <template #empty>
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
        padding: 8px;

        .pagename-content {
            display: flex;
            align-items: center;

            .page-type {
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
                &.pagename {
                    width: calc(100% - 28px);
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
        }

        .route-content {
            .unset {
                color: #FF9C01;
            }
        }

        .page-table {
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
    }

    .more-menu-trigger {
        position: relative;
        top: -1px;

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

    .nocode-type-tag {
        display: inline-flex;
        height: 22px;
        line-height: 22px;
        text-align: center;
        border-radius: 2px;
        font-size: 12px;
        color: #fff;
        padding: 0 6px;
    }

    .form-manage-page-list {
        .form-manage-list {
            font-size: 12px;
            color: #63656E;
            cursor: default;
            .list-title {
                height: 24px;
                font-weight: bold;
            }
            .list-ul {
                li {
                    display: flex;
                    align-items: center;
                    height: 28px;
                    i {
                        margin-right: 6px;
                    }
                    .click-icon {
                        cursor: pointer;
                    }
                    .name {
                        display: inline-block;
                        width: 220px;
                    }
                    &:hover {
                        color: #3A84FF;
                        background: #E1ECFF;
                    }
                }
            }
        }
    }
</style>
<style lang="postcss">
    .page-manage-more-dot-menu-theme {
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
