/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default {
    name: 'divider',
    type: 'bk-divider',
    displayName: '分割线',
    icon: 'bk-drag-custom-comp-default',
    group: '基础',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/divider',
    events: [],
    styles: [
        'position',
        {
            name: 'size',
            exclude: ['maxHeight', 'minHeight', 'height']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        display: 'block'
    },
    groups: [
        { label: '方向', value: 'direction' },
        { label: '类型', value: 'type' },
        { label: '布局', value: 'layout' },
        { label: '样式', value: 'style' },
        { label: '分割线文本', value: 'text' }
    ],
    props: {
        direction: {
            type: 'string',
            val: 'horizontal',
            options: ['horizontal', 'vertical'],
            displayName: '分割线方向',
            tips: '分割线方向, 当设置为vertical时，可通过设置height设置竖线高度',
            belongGroup: 'direction'
        },
        align: {
            type: 'string',
            val: 'center',
            options: ['left', 'right', 'center'],
            displayName: '文本位置',
            tips: '分割线位置',
            belongGroup: 'layout'
        },
        color: {
            type: 'color',
            val: '#dde4eb',
            displayName: '分割线颜色',
            tips: '分割线颜色',
            belongGroup: 'style'
        },
        type: {
            type: 'string',
            val: 'dashed',
            options: ['dashed', 'solid'],
            displayName: '分割线显示样式',
            belongGroup: 'type'
        },
        width: {
            type: 'number',
            val: 1,
            displayName: '分割线宽度',
            tips: '分割线宽度',
            belongGroup: 'style'
        }
    },
    slots: {
        default: {
            name: ['html'],
            type: ['text'],
            displayName: '文本',
            val: '分割线',
            emptyable: true,
            belongGroup: 'text'
        }
    }
}
