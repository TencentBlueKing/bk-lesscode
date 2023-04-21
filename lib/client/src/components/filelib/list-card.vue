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
    import { computed, defineComponent } from '@vue/composition-api'
    import { execCopy } from '@/common/util'
    import { UPLOAD_STATUS, UploadFile, getFileUrl } from './helper'
    import FileIcon from './file-icon.vue'

    export default defineComponent({
        components: {
            FileIcon
        },
        props: {
            files: {
                type: Array,
                default: () => []
            },
            emptyType: {
                type: String,
                default: 'noData'
            },
            previewEnabled: Boolean,
            cardWidth: Number,
            cardHeight: Number,
            imageHeight: Number
        },
        setup (props, { emit }) {
            const containerStyle = computed(() => ({
                '--card-width': props.cardWidth ? `${props.cardWidth}px` : undefined,
                '--card-height': props.cardHeight ? `${props.cardHeight}px` : undefined,
                '--image-height': props.imageHeight ? `${props.imageHeight}px` : undefined
            }))
            const containerClass = computed(() => ({
                'preview-enabled': props.previewEnabled
            }))

            const handlePreview = (file: UploadFile, files: UploadFile[]) => {
                if (!props.previewEnabled || file.status !== UPLOAD_STATUS.SUCCESS) {
                    return
                }
                emit('view', file, files)
            }

            const handleCopyLink = (file: UploadFile) => {
                execCopy(getFileUrl(file, true))
            }

            const handleRemove = (file: UploadFile) => {
                emit('remove', file)
            }
            const handlerClearSearch = (searchName) => {
                emit('clear-search', searchName)
                emit('search')
            }

            return {
                UPLOAD_STATUS,
                containerStyle,
                containerClass,
                getFileUrl,
                handleCopyLink,
                handleRemove,
                handlePreview,
                handlerClearSearch
            }
        }
    })
</script>

<template>
    <div class="list-card" :class="containerClass" :style="containerStyle">
        <template v-if="files.length">
            <div class="card-item" v-for="file in files" :key="file.uid">
                <slot name="file" v-bind="file">
                    <div class="item-icon" @click="handlePreview(file, files)">
                        <file-icon :file="file" />
                        <div :class="['upload-status', file.status]" v-if="file.status === UPLOAD_STATUS.UPLOADING || file.status === UPLOAD_STATUS.FAIL">
                            <bk-round-progress
                                width="50px"
                                :config="{
                                    strokeWidth: 10,
                                    bgColor: '#333',
                                    activeColor: '#3a84ff'
                                }"
                                :title="$t('上传中')"
                                :title-style="{ color: '#fff', fontSize: '12px' , width: $store.state.Language === 'en' ? '120%' : '100%' }"
                                :num-style="{ color: '#fff', fontSize: '14px' }"
                                :percent="file.percentage / 100"
                                v-if="file.status === UPLOAD_STATUS.UPLOADING">
                            </bk-round-progress>
                            <div v-if="file.status === UPLOAD_STATUS.FAIL" class="fail-content">
                                <i class="bk-drag-icon bk-drag-close-circle-fill"></i>
                                <div class="fail-summary">
                                    <div class="fail-title">{{ $t('上传失败') }}</div>
                                    <div class="fail-message" v-if="file.statusText" v-bk-overflow-tips>{{file.statusText}}</div>
                                </div>
                            </div>
                        </div>
                        <div class="use-action" v-if="$scopedSlots['use-action'] && file.status === UPLOAD_STATUS.SUCCESS">
                            <slot name="use-action" v-bind="file"></slot>
                        </div>
                    </div>
                    <div :class="['item-summary', file.status]">
                        <div class="filename" :title="file.name">{{file.name}}</div>
                        <div class="actions">
                            <i class="bk-drag-icon bk-drag-link"
                                v-bk-tooltips.top="$t('复制链接')"
                                @click="handleCopyLink(file)"
                                v-show="file.status === UPLOAD_STATUS.SUCCESS">
                            </i>
                            <bk-popconfirm
                                trigger="click"
                                :title="$t('确认要删除该图片？')"
                                :content="$t('删除后不可恢复，已引用的组件将显示异常')"
                                @confirm="handleRemove(file)">
                                <i class="bk-drag-icon bk-drag-delet" v-bk-tooltips.top="$t('删除')"></i>
                            </bk-popconfirm>
                        </div>
                    </div>
                </slot>
            </div>
        </template>
        <div v-else class="list-empty">
            <empty-status :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .list-card {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        height: 100%;
        width: 100%;
        /* box-shadow offset */
        padding: 4px;
        overflow-y: auto;
        @mixin scroller;

        .card-item {
            display: flex;
            flex-direction: column;
            width: var(--card-width, 256px);
            height: var(--card-height, 192px);
            padding: 8px 8px 0 8px;
            margin-right: 16px;
            margin-bottom: 16px;
            background: #fff;
            border-radius: 2px;
            box-shadow: 0px 2px 4px 0px rgba(25, 25, 41, 0.05);

            &:hover {
                box-shadow: 0px 2px 4px 0px rgba(25, 25, 41, 0.05), 0px 2px 4px 0px rgba(0, 0, 0, 0.10);

                .item-icon {
                    .use-action {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #fff;
                    }
                }
            }

            .item-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: var(--image-height, 140px);
                background: #f5f7fa;
                position: relative;
                overflow: hidden;

                img {
                    width: 100%;
                    object-fit: contain;
                }

                ::v-deep .file-preview-icon {
                    font-size: 68px;
                }

                .upload-status {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    align-items: center;
                    justify-content: center;
                    top: 0;
                    left: 0;

                    &.uploading {
                        background: rgba(0, 0, 0, .65);
                    }

                    &.fail {
                        background: rgba(0, 0, 0, .75);
                    }

                    .fail-content {
                        width: 100%;
                        text-align: center;
                        .bk-drag-icon {
                            font-size: 36px;
                            color: #ea3636;
                        }
                        .fail-summary {
                            color: #fff;
                            .fail-title {
                                font-size: 14px;
                                margin-top: 4px;
                            }
                            .fail-message {
                                font-size: 12px;
                                margin-top: 4px;
                                padding: 0 4px;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                        }
                    }
                }

                .use-action {
                    display: none;
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    left: 0;
                    top: 0;
                    background: rgba(0, 0, 0, .7);
                }
            }
            .item-summary {
                flex: 1;

                display: flex;
                align-items: center;
                justify-content: space-between;

                .filename {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin-right: 8px;
                }

                .actions {
                    display: flex;
                    justify-content: space-between;
                    line-height: normal;

                    .bk-drag-icon {
                        width: 18px;
                        height: 18px;
                        line-height: 18px;
                        margin: 0 4px;
                        text-align: center;
                        cursor: pointer;
                        position: relative;
                        top: 2px;

                        &:hover {
                            color: #3a84ff;
                        }
                    }
                }

                &.fail {
                    .filename {
                        color: #ea3636;
                    }
                }
            }
        }

        .list-empty {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }

        &.preview-enabled {
            .card-item {
                .item-icon {
                    cursor: pointer;
                }
            }
        }
    }
</style>
