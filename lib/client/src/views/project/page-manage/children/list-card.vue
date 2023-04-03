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
    <div class="list-card">
        <template v-if="pageList.length">
            <div class="page-item" v-for="(page, index) in pageList" :key="index">
                <div class="item-bd">
                    <div class="preview" @click="handleEditPage(page)">
                        <flow-page-preview v-if="page.nocodeType === 'FLOW'" :flow-name="page.flowName"></flow-page-preview>
                        <page-preview-thumb v-else :alt="$t('页面缩略预览')" :page-id="page.id" />
                        <div class="mask">
                            <div class="operate-btns">
                                <bk-button class="edit-btn" theme="primary">{{ $t('编辑') }}</bk-button>
                                <bk-button class="preview-btn" @click.stop="handlePreview(page)">{{ $t('预览') }}</bk-button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="item-ft">
                    <div class="col">
                        <div class="page-name">
                            <span class="page-type">
                                <i v-if="page.pageType === 'MOBILE'" class="bk-drag-icon bk-drag-mobilephone"> </i>
                                <i v-else class="bk-drag-icon bk-drag-pc"> </i>
                            </span>
                            <div class="name" v-bk-tooltips="{ content: page.pageName, disabled: !(page.pageName && page.pageName.length > 17) }">{{page.pageName}}</div>
                        </div>
                        <div class="route">
                            <svg class="label" width="22" height="14" viewBox="0 0 22 14">
                                <rect x="0" width="22" height="14" rx="2" fill="#F0F1F5" />
                                <text font-family="'PingFang SC','Microsoft Yahei'" fill="#979ba5" style="text-anchor: middle" font-size="8" x="11" y="10">{{ $t('路由') }}</text>
                            </svg>
                            <div class="path" v-bk-tooltips="{ content: routeMap[page.id].fullPath, disabled: !(routeMap[page.id].fullPath && routeMap[page.id].fullPath.length > 32) }">
                                <span class="fullpath" v-if="routeMap[page.id].id">
                                    {{routeMap[page.id].fullPath}}
                                </span>
                                <span class="unset" v-else>{{ $t('未配置') }}</span>
                            </div>
                        </div>
                        <div class="stat">{{ page.updateUser || page.createUser }} {{ getRelativeTime(page.updateTime) }}{{$t('更新')}}</div>
                    </div>
                    <div class="col" v-if="page.nocodeType !== 'FLOW'">
                        <bk-dropdown-menu :ref="`moreActionDropdown${page.id}`">
                            <span slot="dropdown-trigger" class="more-menu-trigger">
                                <i class="bk-drag-icon bk-drag-more-dot"></i>
                            </span>
                            <ul class="bk-dropdown-list" slot="dropdown-content" @click="hideDropdownMenu(page.id)">
                                <li v-if="!page.nocodeType"><a href="javascript:;" @click="handleDownloadSource(page)">{{ $t('下载源码') }}</a></li>
                                <li><a href="javascript:;" @click="handleRename(page)">{{ $t('重命名') }}</a></li>
                                <li v-if="!page.nocodeType"><a href="javascript:;" @click="handleCopy(page)">{{ $t('复制') }}</a></li>
                                <li><a href="javascript:;" @click="handleEditRoute(page)">{{ $t('修改路由') }}</a></li>
                                <li v-if="page.nocodeType === 'FORM'"><a href="javascript:;" @click="handleCreateFormManage(page)">{{ $t('生成数据管理页') }}</a></li>
                                <li><a href="javascript:;" @click="handleDelete(page)">{{ $t('删除') }}</a></li>
                            </ul>
                        </bk-dropdown-menu>
                    </div>
                </div>
                <span v-if="page.nocodeType" class="nocode-type-tag" :style="{ background: nocodeTypeMap.bgColor[page.nocodeType], color: nocodeTypeMap.color[page.nocodeType] }">
                    <bk-popover
                        v-if="page.nocodeType === 'FORM' && getFormManagePages(page.formId).length"
                        ext-cls="form-manage-page-list"
                        placement="right-start"
                        theme="light"
                        width="300">
                        <section style="display: flex; align-items: center;">
                            {{nocodeTypeMap.title[page.nocodeType] || page.nocodeType}}
                            <i class="bk-drag-icon bk-drag-data-source-manage" style="margin: 0 2px;"></i>
                            <span>{{getFormManagePages(page.formId).length}}</span>
                        </section>
                        <div slot="content" class="form-manage-list">
                            <div class="list-title"><span>{{ $t('关联的表单数据管理页') }}</span></div>
                            <ul class="list-ul">
                                <li v-for="item in getFormManagePages(page.formId)" :key="item.id">
                                    <i class="bk-drag-icon bk-drag-page"></i>
                                    <span class="name">{{item.pageName}}</span>
                                    <i :title="$t('预览')" class="bk-icon icon-eye click-icon" @click="handlePreview(item)"></i>
                                    <i :title="$t('编辑')" class="bk-drag-icon bk-drag-edit click-icon" style="font-size: 16px;" @click="handleEditPage(item)"></i>
                                </li>
                            </ul>
                        </div>
                    </bk-popover>
                    <section v-else>{{nocodeTypeMap.title[page.nocodeType] || page.nocodeType}}</section>
                </span>
            </div>
        </template>
        <div class="empty" v-else>
            <empty-status :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
        </div>
    </div>
</template>

<script>
    import pagePreviewThumb from '@/components/project/page-preview-thumb.vue'
    import flowPagePreview from './flow-page-preview'

    export default {
        name: 'page-list-card',
        components: {
            pagePreviewThumb,
            flowPagePreview
        },
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
        methods: {
            hideDropdownMenu (pageId) {
                this.$refs[`moreActionDropdown${pageId}`][0].hide()
            },
            handleCreate () {
                this.$emit('create')
            },
            handlePreview (page) {
                this.$emit('preview', page)
            },
            handleCopy (page) {
                this.$emit('copy', page)
            },
            handleEditPage (page) {
                this.$emit('edit', page)
            },
            handleRename (page) {
                this.$emit('rename', page)
            },
            handleEditRoute (page) {
                this.$emit('edit-route', page)
            },
            handleDelete (page) {
                this.$emit('delete', page)
            },
            handleDownloadSource (targetData, pageId, styleSetting) {
                this.$emit('download', targetData, pageId, styleSetting)
            },
            handleCreateFormManage (page) {
                this.$emit('create-form', page)
            },
            handlerClearSearch (searchName) {
                this.$emit('clear-search', searchName)
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .list-card {
        display: grid;
        gap: 16px 12px;
        grid-template-columns: repeat(auto-fill, minmax(312px, 1fr));
        width: 100%;
        align-content: flex-start;
        padding: 8px;
        overflow-y: auto;
        overflow-x: hidden;
        @mixin scroller;

        .page-item {
            position: relative;
            height: 262px;
            margin: 0;
            padding: 6px;
            background: #fff;
            border-radius: 0px 6px 6px 6px;
            box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.11);
            cursor: pointer;

            &:hover {
                box-shadow: 1px 2px 8px 2px rgba(0, 0 ,0 , 0.11);

                .desc {
                    display: block;
                }
                .preview {
                    .mask {
                        background: rgba(0, 0, 0, 0.1);
                        .operate-btns {
                            display: block;
                            opacity: 1;
                            z-index: 3;
                        }
                    }
                }
            }
            .more-menu-trigger {
                .bk-drag-more-dot {
                    display: block;
                    width: 32px;
                    height: 32px;
                    line-height: 34px;
                    text-align: center;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    color: #979BA5;
                    &:hover {
                        background: #F0F1F5;
                    }
                }
            }

            .item-bd {
                flex: none;
                position: relative;
                height: 166px;
                background: #fff;
                border-radius: 4px 4px 0px 0px;
            }
            .item-ft {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 14px 10px 0 10px;
            }

            .nocode-type-tag {
                position: absolute;
                right: 6px;
                top: 6px;
                height: 22px;
                line-height: 22px;
                text-align: center;
                border-radius: 2px;
                font-size: 12px;
                color: #fff;
                padding: 0 6px;
            }

            .preview {
                position: relative;
                height: 100%;
                overflow: hidden;
                border-radius: 4px 4px 0px 0px;

                .mask {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.02);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    .operate-btns {
                        display: none;
                        .edit-btn {
                            width: 86px;
                        }
                        .preview-btn {
                            width: 86px;
                            margin-left: 10px;
                        }
                    }
                }

                /* &::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.2);
                } */
            }
            .desc {
                display: none;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                padding: 28px 26px 28px 21px;

                .desc-text {
                    font-size: 12px;
                    color: #fff;
                    margin: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 5;
                    -webkit-box-orient: vertical;
                }
            }
            .empty {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 700;
                color: #C4C6CC;
                height: 100%;
                background: #f0f1f5;
                border-radius: 4px 4px 0px 0px;
            }
            .page-name {
                display: flex;
                align-items: center;
                margin: -2px 0 0 0;

                .name {
                    font-size: 12px;
                    font-weight: 700;
                    color: #63656E;
                    width: 215px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    margin-left: 7px;
                }

                .page-type {
                    font-size: 16px;
                    line-height: 18px;
                    height: 20px;
                    width: 20px;
                    text-align: center;
                    margin-left: -2px;
                    color: #979ba5;
                    border-radius: 2px;
                    background: #f0f1f5;
                }
            }
            .stat {
                font-size: 12px;
                color: #979BA5;
                margin: 4px 0;
            }
            .route {
                display: flex;
                align-items: center;
                margin: 7px 0;
                .label {
                    margin-top: 1px;
                    margin-left: -2px;
                }
                .path {
                    width: 212px;
                    font-size: 12px;
                    color: #63656E;
                    margin-left: 5px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;

                    .unset {
                        color: #FF9C01;
                    }
                }
            }
        }

        .empty {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            .empty-page {
                display: flex;
                align-items: center;
            }
        }
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

    @media screen and (max-width: 1336px) {
        .list-card {
            grid-template-columns: repeat(3, minmax(304px, 1fr));
        }
    }
</style>
