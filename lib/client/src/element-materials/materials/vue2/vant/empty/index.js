/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default {
    name: 'van-empty',
    type: 'van-empty',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-empty',
    displayName: '空状态',
    group: '数据',
    styles: ['padding', 'margin', 'size'],
    renderStyles: {
    },
    groups: [
        { label: '类型', value: 'type' },
        { label: '文本', value: 'text' },
        { label: '样式', value: 'style' }
    ],
    props: {
        'image': {
            type: 'string',
            val: 'default',
            options: ['error', 'network', 'search', 'default'],
            displayName: '图片类型',
            tips: '图片类型',
            belongGroup: 'type'
        },
        'image-size': {
            type: ['string', 'number'],
            displayName: '图片大小',
            tips: '图片大小，默认单位为 px',
            belongGroup: 'style'
        },
        'description': {
            type: 'string',
            val: '',
            displayName: '图片下方描述文字',
            tips: '图片下方的描述文字',
            belongGroup: 'text'
        }
    }
}
