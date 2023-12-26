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
    import { computed, defineComponent, onBeforeUnmount, reactive, ref } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import { messageError, messageSuccess } from '@/common/bkmagic'

    import useUploadHandler from '@/components/filelib/use-upload-handler.js'
    import useUploadList from '@/components/filelib/use-upload-list.js'
    import { DISPLAY_TYPES, FILE_MAX_LIMIT, UploadFile, getFileUrl, isImageFile } from '@/components/filelib/helper'

    import Upload from '@/components/filelib/upload.vue'
    import ListCard from '@/components/filelib/list-card.vue'
    import ListTable from '@/components/filelib/list-table.vue'

    export default defineComponent({
        components: {
            ListCard,
            ListTable,
            Upload
        },
        setup () {
            const store = useStore()
            const route = useRoute()

            const uploadRef = ref(null)

            const displayType = ref<string>(DISPLAY_TYPES.CARD)

            const projectId = computed(() => route.params.projectId)
            const paramsData = computed(() => ({ projectId: projectId.value }))

            const listComponent = computed(() => {
                const compMap = {
                    [DISPLAY_TYPES.CARD]: ListCard,
                    [DISPLAY_TYPES.LIST]: ListTable
                }
                return compMap[displayType.value]
            })

            const {
                keyword,
                list,
                emptyType,
                loading: listLoading,
                displayList,
                handleSearch
            } = useUploadList({ projectId: projectId.value })

            const baseUploadProps = reactive({
                fileList: displayList,
                maxImageSize: FILE_MAX_LIMIT.IMAGE_SIZE,
                maxFileSize: FILE_MAX_LIMIT.FILE_SIZE,
                maxlength: 20,
                beforeRemove: async (file) => {
                    if (!file.id) {
                        return
                    }

                    try {
                        await store.dispatch('file/del', { ...paramsData.value, fileId: file.id })
                        messageSuccess(window.i18n.t('删除成功'))
                    } catch (err) {
                        messageError(window.i18n.t('删除失败'))
                        console.error(err)
                        return false
                    }
                },
                onSuccess: async (res) => {
                    const data = {
                        ...paramsData.value,
                        fileData: {
                            ...res.data,
                            status: 'success'
                        }
                    }
                    try {
                        await store.dispatch('file/create', data)
                    } catch (err) {
                        messageError(window.i18n.t('保存上传文件失败'))
                        console.error(err)
                    }
                }
            })

            const {
                uploadFiles,
                isUploading,
                handleStart,
                handleError,
                handleSuccess,
                handleProgress,
                handleRemove
            } = useUploadHandler(baseUploadProps, uploadRef)

            const uploadProps = computed(() => ({
                params: paramsData.value,
                maxImageSize: baseUploadProps.maxImageSize,
                maxFileSize: baseUploadProps.maxFileSize,
                maxlength: baseUploadProps.maxlength,
                onStart: handleStart,
                onProgress: handleProgress,
                onSuccess: handleSuccess,
                onError: handleError
            }))

            const handleToggleDisplayType = (type: string) => {
                displayType.value = type
            }

            const isShowPreviewViewer = ref(false)
            const viewerProps = reactive({
                urlList: [],
                initialIndex: 0
            })
            const handleView = (file: UploadFile, files: UploadFile[]) => {
                const isImage = isImageFile(file)

                // 非图片新标签页打开地址
                if (!isImage) {
                    const url = getFileUrl(file, true, true)
                    window.open(url, '_blank')
                    return
                }

                // 图片使用图片查看器
                isShowPreviewViewer.value = true

                // 将所有图片类型文件做为查看列表，方便左右翻动查看
                const previewFileList = files.filter(file => isImageFile(file))
                viewerProps.urlList = previewFileList.map(file => getFileUrl(file, true))

                viewerProps.initialIndex = previewFileList.findIndex(item => item === file)
            }
            
            const handlerClearSearch = (searchName) => {
                keyword.value = searchName
            }

            function handleExport () {
                const id = parseInt(projectId.value)
                window.open(`/api/file/export?projectId=${id}`, '_self')
            }

            function handleClosePreviewViewer () {
                isShowPreviewViewer.value = false
            }

            onBeforeUnmount(() => {
                uploadFiles.value.forEach(({ url }) => {
                    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
                })
            })

            return {
                keyword,
                list,
                emptyType,
                listLoading,
                uploadRef,
                uploadProps,
                displayType,
                uploadFiles,
                displayList,
                DISPLAY_TYPES,
                listComponent,
                isUploading,
                viewerProps,
                isShowPreviewViewer,
                handleClosePreviewViewer,
                handleSearch,
                handleExport,
                handleToggleDisplayType,
                handleRemove,
                handleView,
                handlerClearSearch
            }
        },
        beforeRouteLeave (to, from, next) {
            if (!this.isUploading) {
                next()
                return
            }

            (this as any).$bkInfo({
                title: window.i18n.t('确认离开'),
                subTitle: window.i18n.t('文件正在上传中，离开可能导致文件上传失败'),
                confirmFn: async () => {
                    next()
                }
            })
        }
    })
</script>

<template>
    <div class="page-content">
        <div class="page-head file-manage-head">
            <div class="buttons">
                <upload ref="uploadRef" v-bind="uploadProps" />
            </div>
            <div class="search-bar">
                <span class="total" v-show="displayList.length">{{ $t('共') }}<em class="count">{{displayList.length}}</em>{{ $t('个文件') }}</span>
                <bk-input :placeholder="$t('请输入文件名')"
                    style="width: 400px"
                    :clearable="true"
                    right-icon="bk-icon icon-search"
                    v-model="keyword"
                    @input="handleSearch">
                </bk-input>
                <div class="display-type-toggle">
                    <div :class="['icon-button', { active: displayType === DISPLAY_TYPES.CARD }]" @click="handleToggleDisplayType(DISPLAY_TYPES.CARD)">
                        <i class="bk-drag-icon bk-drag-display-card"></i>
                    </div>
                    <div :class="['icon-button', { active: displayType === DISPLAY_TYPES.LIST }]" @click="handleToggleDisplayType(DISPLAY_TYPES.LIST)">
                        <i class="bk-drag-icon bk-drag-display-list"></i>
                    </div>
                </div>
                <bk-button :disabled="!uploadFiles.length" @click="handleExport" style="margin-left: 10px">{{ $t('导出文件') }}</bk-button>
            </div>
        </div>
        <div :class="['page-body', 'file-manage-body', { 'is-empty': !uploadFiles.length }]" v-bkloading="{ isLoading: listLoading }">
            <component
                v-show="!listLoading"
                :is="listComponent"
                :files="uploadFiles"
                :empty-type="emptyType"
                :preview-enabled="true"
                @remove="handleRemove"
                @view="handleView"
                @clear-search="handlerClearSearch"
                @search="handleSearch">
            </component>
        </div>

        <bk-image-viewer
            v-if="isShowPreviewViewer"
            :z-index="99999"
            :on-close="handleClosePreviewViewer"
            v-bind="viewerProps"
        />
    </div>
</template>

<style lang="postcss" scoped>
    .file-manage-head {
        justify-content: space-between;

        .search-bar {
            display: flex;
            align-items: center;

            .total {
                font-size: 12px;
                margin-right: 8px;
                white-space: nowrap;

                .count {
                    font-style: normal;
                    margin: 0 .1em;
                }
            }
        }

        .display-type-toggle {
            display: flex;
            align-items: center;
            height: 32px;
            padding: 0 4px;
            margin-left: 8px;
            background: #eaebf0;
            border-radius: 2px;
            .icon-button {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                font-size: 16px;
                color: #979BA5;
                cursor: pointer;

                &.active,
                &:hover {
                    color: #63656E;
                    background: #fff;
                }

                & + .icon-button {
                    margin-left: 4px;
                }
            }
        }
    }

    .file-manage-body {
        height: calc(100% - 52px);
        ::v-deep .list-card {
            display: grid;
            grid-gap: 16px;
            grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));

            .card-item {
                margin: 0;
                width: auto;
            }
        }

        &.is-empty {
            ::v-deep .list-card {
                display: flex;
            }
        }
    }
</style>
