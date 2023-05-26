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

<script>
    import { computed, defineComponent, reactive, toRefs, ref } from '@vue/composition-api'
    import { getFileUrl, isImageFile } from '@/components/filelib/helper'
    import FileModal from './file-modal.vue'

    export default defineComponent({
        components: {
            FileModal
        },
        props: {
            value: String,
            placeholder: {
                type: String,
                default: ''
            },
            triggerText: {
                type: String,
                default: ''
            },
            fileType: {
                type: String,
                default: '*',
                validator (value) {
                    return ['*', 'img', 'zip', 'doc'].includes(value)
                }
            },
            projectId: {
                type: [String, Number],
                default: ''
            }
        },
        setup (props, { emit }) {
            const state = reactive({
                isFileModalShow: false,
                isShowPreviewViewer: false,
                previewFileList: []
            })
            const isPlaceholder = props.placeholder || ref(window.i18n.t('可选择或粘贴链接'))
            const isTriggerText = props.trigger || ref(window.i18n.t('选择图片'))

            const url = computed({
                get () {
                    return this.value
                },
                set (val) {
                    emit('input', val)
                    emit('change', val)
                }
            })

            const inputPrpos = {
                placeholder: isPlaceholder
            }

            const modalProps = {
                fileType: props.fileType,
                projectId: props.projectId
            }

            function handleSelectFile (file) {
                state.isFileModalShow = false

                const url = getFileUrl(file, true)

                emit('input', url)
                emit('change', url)
            }

            function handleOpenFileModal () {
                state.isFileModalShow = true
            }

            function handleViewFile (file) {
                const isImage = isImageFile(file)
                const url = getFileUrl(file, true, !isImage)

                // 非图片新标签页打开地址
                if (!isImage) {
                    window.open(url, '_blank')
                    return
                }

                state.isShowPreviewViewer = true
                state.previewFileList = [url]
            }

            function handleClosePreviewViewer () {
                state.isShowPreviewViewer = false
            }

            return {
                ...toRefs(state),
                url,
                inputPrpos,
                modalProps,
                isPlaceholder,
                isTriggerText,
                handleOpenFileModal,
                handleSelectFile,
                handleViewFile,
                handleClosePreviewViewer
            }
        }
    })
</script>

<template>
    <div :class="$style['src-input']">
        <bk-input v-bind="inputPrpos" v-model="url">
            <template #append>
                <div :class="$style['trigger']" @click="handleOpenFileModal">
                    <slot name="trigger">
                        <div :class="$style['trigger-text']">{{isTriggerText}}</div>
                    </slot>
                </div>
            </template>
        </bk-input>
        <file-modal :is-show.sync="isFileModalShow" v-bind="modalProps" @select="handleSelectFile" @view="handleViewFile" />
        <bk-image-viewer
            v-if="isShowPreviewViewer"
            :z-index="99999"
            :on-close="handleClosePreviewViewer"
            :url-list="previewFileList"
        />
    </div>
</template>

<style lang="postcss" module>
    .src-input {
        display: flex;
        width: 100%;

        .trigger {
            background: #f0f1f5;
            padding: 0 6px;
            cursor: pointer;

            &:hover {
                background: #eaebf0;
            }

            .trigger-text {
                font-size: 12px;
                color: #63656e;
                white-space: nowrap;
                line-height: 30px;
            }
        }
    }
</style>
