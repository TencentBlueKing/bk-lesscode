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
    name: 'exception',
    type: 'bk-exception',
    displayName: '异常提示',
    icon: 'bk-drag-exception',
    group: '反馈',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/exception',
    styles: [
        'position',
        {
            name: 'size',
            exclude: ['height', 'maxHeight', 'minHeight']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {},
    groups: [
        { label: '类型', value: 'type' },
        { label: '场景', value: 'scene' },
        { label: '文本', value: 'text' }
    ],
    props: {
        type: {
            type: 'string',
            val: '404',
            options: ['403', '404', '500', 'building', 'empty', 'search-empty', 'login'],
            displayName: '异常类型',
            tips: '异常类型',
            belongGroup: 'type'
        },
        scene: {
            type: 'string',
            val: 'page',
            options: ['page', 'part'],
            displayName: '异常场景',
            tips: '异常场景',
            belongGroup: 'scene'
        },
        title: {
            type: 'string',
            val: '',
            displayName: '异常标题',
            belongGroup: 'text'
        },
        description: {
            type: 'string',
            val: '',
            displayName: '异常描述',
            belongGroup: 'text'
        }
    }
}
