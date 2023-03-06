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
        <template v-if="projectList.length">
            <div :class="['project-item', { favorite: project.favorite }]" v-for="project in projectList" :key="project.id">
                <div class="item-bd">
                    <template v-if="pageMap[project.id] && pageMap[project.id].length > 0">
                        <div class="preview">
                            <page-preview-thumb alt="应用缩略预览" :project-id="project.id" :img-src="project.templateImg" />
                        </div>
                    </template>
                    <div class="empty" v-else>
                        暂无页面
                    </div>
                    <div class="operate-btns">
                        <!-- <bk-button class="edit-btn" theme="primary" @click="handleGotoPage(project.id)">开发应用</bk-button>
                        <bk-button class="preview-btn" @click="handlePreview(project.id)">预览</bk-button> -->
                        <auth-button
                            :permission="project.canDevelop"
                            auth="develop_app"
                            :resource-id="project.id"
                            class="edit-btn"
                            theme="primary"
                            @click="handleGotoPage(project.id)">
                            开发应用
                        </auth-button>
                        <auth-button
                            :permission="project.canDevelop"
                            auth="develop_app"
                            :resource-id="project.id"
                            class="preview-btn"
                            @click.stop="handlePreview(project.id)">
                            预览
                        </auth-button>
                        <auth-button
                            :permission="project.canDeploy"
                            auth="deploy_app"
                            :resource-id="project.id"
                            class="preview-btn"
                            @click.stop="handleRelease(project.id)">
                            部署
                        </auth-button>
                    </div>
                </div>
                <div class="item-ft">
                    <div class="col">
                        <h3 class="name" v-bk-tooltips="{
                            content: project.projectName,
                            disabled: !(project.projectName && project.projectName.length > 20)}"
                        >{{project.projectName}}</h3>
                        <div class="stat">{{getUpdateInfoMessage(project)}}</div>
                    </div>
                    <div class="col">
                        <bk-dropdown-menu :ref="`moreActionDropdown${project.id}`">
                            <span slot="dropdown-trigger" class="more-menu-trigger">
                                <i class="bk-drag-icon bk-drag-more-dot"></i>
                            </span>
                            <ul class="bk-dropdown-list card-operation-list" slot="dropdown-content" @click="hideDropdownMenu(project.id)">
                                <!-- <li><a href="javascript:;" @click="handleDownloadSource(project)">下载源码</a></li> -->
                                <!-- <li><a href="javascript:;" @click="handleGotoPage(project.id)">页面管理</a></li> -->
                                <!-- <li><a href="javascript:;" @click="handleRename(project)">重命名</a></li> -->
                                <!-- <li><a href="javascript:;" @click="handleRelease(project.id)">部署</a></li> -->
                                <!-- <li><a href="javascript:;" @click="handleCopy(project)">复制</a></li> -->
                                <!-- <li v-if="iamNoResourcesPerm[$IAM_ACTION.manage_template[0]]"><a href="javascript:;" @click="handleSetTemplate(project)">设为模板</a></li> -->
                                <li>
                                    <auth-component :permission="project.canDevelop" auth="develop_app" :resource-id="project.id">
                                        <a href="javascript:;" slot="forbid">下载源码</a>
                                        <a href="javascript:;" slot="allow" @click="handleDownloadSource(project)">下载源码</a>
                                    </auth-component>
                                </li>
                                <li>
                                    <auth-component :permission="project.canDevelop" auth="develop_app" :resource-id="project.id">
                                        <a href="javascript:;" slot="forbid">页面管理</a>
                                        <a href="javascript:;" slot="allow" @click="handleGotoPage(project.id)">页面管理</a>
                                    </auth-component>
                                </li>
                                <li>
                                    <auth-component :permission="project.canDevelop" auth="develop_app" :resource-id="project.id">
                                        <a href="javascript:;" slot="forbid">重命名</a>
                                        <a href="javascript:;" slot="allow" @click="handleRename(project)">重命名</a>
                                    </auth-component>
                                </li>
                                <li>
                                    <auth-component :permission="project.canDevelop" auth="develop_app" :resource-id="project.id">
                                        <a href="javascript:;" slot="forbid">复制</a>
                                        <a href="javascript:;" slot="allow" @click="handleCopy(project)">复制</a>
                                    </auth-component>
                                </li>
                                <li>
                                    <auth-component :permission="project.canDevelop" auth="develop_app" :resource-id="project.id">
                                        <a href="javascript:;" slot="forbid">导出</a>
                                        <a href="javascript:;" slot="allow" @click="handleExport(project)">导出</a>
                                    </auth-component>
                                </li>
                                <li v-if="iamNoResourcesPerm[$IAM_ACTION.manage_template[0]]">
                                    <a href="javascript:;" @click="handleSetTemplate(project)">设为模板</a>
                                </li>
                            </ul>
                        </bk-dropdown-menu>
                    </div>
                </div>
                <span class="favorite-btn">
                    <i class="bk-icon icon-info-circle" v-bk-tooltips.top="{ content: project.projectDesc, allowHTML: false }"></i>
                    <!-- <i :class="['bk-drag-icon', `bk-drag-favorite${project.favorite ? '' : '-o' }`]"
                        v-bk-tooltips.top="{ content: project.favorite ? '取消收藏' : '添加收藏' }"
                        @click.stop="handleClickFavorite(project)"
                    ></i> -->
                    <auth-component :permission="project.canDevelop" auth="develop_app" :resource-id="project.id">
                        <i slot="forbid" custom-forbid-container-cls="forbid-container-cls" :class="['bk-drag-icon', `bk-drag-favorite${project.favorite ? '' : '-o' }`]"
                            v-bk-tooltips.top="{ content: project.favorite ? '取消收藏' : '添加收藏' }"
                        ></i>
                        <i slot="allow" :class="['bk-drag-icon', `bk-drag-favorite${project.favorite ? '' : '-o' }`]"
                            v-bk-tooltips.top="{ content: project.favorite ? '取消收藏' : '添加收藏' }"
                            @click.stop="handleClickFavorite(project)"
                        ></i>
                    </auth-component>
                </span>
                <span v-if="project.isOffcial" class="default-tag">应用模板</span>
            </div>
        </template>
        <div class="empty" v-else>
            <empty-status :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import pagePreviewThumb from '@/components/project/page-preview-thumb.vue'

    export default {
        name: 'project-list-card',
        components: {
            pagePreviewThumb
        },
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
        inject: ['getUpdateInfoMessage'],
        computed: {
            ...mapGetters(['iamNoResourcesPerm'])
        },
        methods: {
            hideDropdownMenu (projectId) {
                this.$refs[`moreActionDropdown${projectId}`][0].hide()
            },
            handleCreate () {
                this.$emit('create')
            },
            handleGotoPage (projectId) {
                this.$emit('to-page', projectId)
            },
            handleDownloadSource (project) {
                this.$emit('download', project)
            },
            handlePreview (projectId) {
                this.$emit('preview', projectId)
            },
            handleRename (project) {
                this.$emit('rename', project)
            },
            handleCopy (project) {
                this.$emit('copy', project)
            },
            handleExport (project) {
                this.$emit('export', project)
            },
            handleSetTemplate (project) {
                this.$emit('set-template', project)
            },
            handleClickFavorite (project) {
                this.$emit('collect', project)
            },
            handleRelease (projectId) {
                this.$emit('release', projectId)
            },
            handlerClearSearch (searchName) {
                this.$emit('clearSearch', searchName)
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";
    @import "@/css/mixins/scroller";

    .list-card {
        display: grid;
        gap: 26px 12px;
        grid-template-columns: repeat(auto-fill, minmax(312px, 1fr));
        width: 100%;
        align-content: flex-start;
        margin-top: 10px;
        padding: 8px;
        overflow-y: auto;
        overflow-x: hidden;
        @mixin scroller;

        .project-item {
            position: relative;
            height: 240px;
            margin: 0;
            padding: 6px;
            background: #fff;
            border-radius: 0px 6px 6px 6px;
            box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.11);
            cursor: pointer;

            &::before {
                content: "";
                position: absolute;
                top: -10px;
                left: 0;
                width: 156px;
                height: 10px;
                border-radius: 6px 0px 0px 0px;
                background: linear-gradient(-160deg, transparent 9px, #dcdee5 0)
            }
            &:hover {
                box-shadow: 1px 2px 8px 2px rgba(0, 0 ,0 , 0.11);

                .desc {
                    display: block;
                }
                .favorite-btn {
                    opacity: 1;
                }
                .default-tag {
                    display: none;
                }
                .preview {
                    &::before {
                        background: rgba(0, 0, 0, 0.1);
                    }
                }
                .operate-btns {
                    opacity: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                }
                .empty {
                    &::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.1);
                    }
                }
            }

            &.favorite {
                .favorite-btn {
                    opacity: 1;
                }
            }

            .default-tag {
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
                background: #699DF4;
            }

            .favorite-btn {
                position: absolute;
                right: 16px;
                top: 16px;
                opacity: 1;
                transition: all .3s ease;
                .icon-info-circle {
                    color: #fff;
                    font-size: 16px;
                    margin-right: 4px;
                }

                .bk-drag-icon {
                    font-size: 18px;
                    color: #FAFBFD;
                    cursor: pointer;
                }
                .bk-drag-favorite {
                    color: #FE9C00;
                }

                .forbid-container-cls {
                    display: inline-block;
                }
            }
            .more-menu-trigger {
                position: relative;
                top: -2px;

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

            .card-operation-list {
                max-height: 250px;
            }

            .item-bd {
                flex: none;
                position: relative;
                height: 166px;
                background: #fff;
                border-radius: 4px 4px 0px 0px;
                overflow: hidden;
            }
            .item-ft {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 16px 10px 0 10px;
            }

            .preview {
                position: relative;
                font-size: 0;
                height: 100%;
                overflow: hidden;
                border-radius: 4px 4px 0px 0px;

                &::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.02);
                }
            }
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
            .empty {
                display: flex;
                position: relative;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 700;
                color: #C4C6CC;
                height: 100%;
                background: #f0f1f5;
                border-radius: 4px 4px 0px 0px;
            }
            .name {
                margin: 0;
                font-size: 12px;
                font-weight: 700;
                color: #63656E;
                @mixin ellipsis 240px, block;
            }
            .stat {
                font-size: 12px;
                color: #979BA5;
                padding: 4px 0;
            }
        }
        .empty {
            justify-content: center;
        }
    }

    @media screen and (max-width: 1336px) {
        .list-card {
            grid-template-columns: repeat(3, minmax(304px, 1fr));
        }
    }
</style>
