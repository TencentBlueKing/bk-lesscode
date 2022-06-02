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
    import { defineComponent, PropType, h } from '@vue/composition-api'
    import { UploadFile, getFileUrl, getFileExt, isImageFile } from './helper'

    export default defineComponent({
        props: {
            file: {
                type: Object as PropType<UploadFile>,
                default: null
            },
            isCard: {
                type: Boolean,
                default: true
            }
        },
        setup (props) {
            const ext = getFileExt(props.file)
            const isImage = isImageFile(props.file)

            if (isImage) {
                if (props.isCard) {
                    return () => h('img', { domProps: { src: getFileUrl(props.file), alt: props.file.name } })
                }
                return () => h('i', { class: { 'bk-drag-icon': true, 'file-preview-icon': true, 'bk-drag-file-image': true } })
            }

            const iconMap = {
                'doc': 'bk-drag-file-doc',
                'docx': 'bk-drag-file-doc',
                'xls': 'bk-drag-file-excel',
                'xlsx': 'bk-drag-file-excel',
                'ppt': 'bk-drag-file-ppt',
                'pptx': 'bk-drag-file-ppt',
                'pdf': 'bk-drag-file-pdf',
                'zip': 'bk-drag-file-zip',
                'tar': 'bk-drag-file-zip',
                'gz': 'bk-drag-file-zip'
            }
            const fileIcon = iconMap[ext] || 'bk-drag-file-text'
            return () => h('i', { class: { 'bk-drag-icon': true, 'file-preview-icon': true, [fileIcon]: true } })
        }
    })
</script>

<style lang="postcss" scoped>
    .file-preview-icon {
        &.bk-drag-file-doc {
            color: #3A84FF;
        }

        &.bk-drag-file-excel {
            color: #2DCB56;
        }

        &.bk-drag-file-ppt {
            color: #EE5656;
        }

        &.bk-drag-file-pdf {
            color: #EA3636;
        }

        &.bk-drag-file-zip {
            color: #699DF4;
        }

        &.bk-drag-file-text,
        &.bk-drag-file-image, {
            color: #979BA5;
        }
    }
</style>
