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
    name: 'slider',
    type: 'bk-slider',
    displayName: '滑动选择',
    icon: 'bk-drag-slider',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/slider',
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
    props: {
        modelValue: {
            type: 'number',
            val: 30,
            directive: 'v-model'
        },
        vertical: {
            type: 'boolean',
            val: false,
            tips: '是否为垂直模式'
        },
        height: {
            type: 'string',
            val: '200px',
            tips: '滑动选择器高度 vertical为true时使用'
        },
        disable: {
            type: 'boolean',
            val: false,
            tips: '是否禁用'
        },
        minValue: {
            type: 'number',
            val: 0
        },
        maxValue: {
            type: 'number',
            val: 100
        },
        step: {
            type: 'number',
            val: 1,
            tips: '步长'
        },
        range: {
            type: 'boolean',
            val: false,
            tips: '是否为分段式滑块'
        },
        showInterval: {
            type: 'boolean',
            val: false,
            tips: '是否显示间断点'
        },
        showIntervalLabel: {
            type: 'boolean',
            val: false,
            tips: '是否显示间断点下的文字'
        },
        showButtonLabel: {
            type: 'boolean',
            val: false,
            tips: '滑块下是否显示值不可与间断点下的文字同时使用'
        },
        showBetweenLabel: {
            type: 'boolean',
            val: false,
            tips: '是否只显示首尾刻度'
        },
        showInput: {
            type: 'boolean',
            val: false,
            tips: '是否显示输入框'
        },
        showTip: {
            type: 'boolean',
            val: false,
            tips: 'hover 时是否显示提示'
        },
        customContent: {
            type: 'object',
            val: {},
            tips: '自定义内容'
        },
        formatterLabel: {
            type: 'function',
            val: value => value,
            tips: '自定义间断点下文字格式'
        },
        formatterButtonLabel: {
            type: 'function',
            val: value => value,
            tips: '自定义滑块下文字格式'
        },
        formatterTipLabel: {
            type: 'function',
            val: value => value,
            tips: '自定义tip格式'
        }
    }
}
