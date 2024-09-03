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
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/slider',
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
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    props: {
        value: {
            type: 'number',
            val: 30,
            displayName: '滑动数值'
        },
        'min-value': {
            type: 'number',
            val: 0,
            displayName: '滑动最小数值'
        },
        'max-value': {
            type: 'number',
            val: 100,
            displayName: '滑动最大数值'
        },
        disable: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用'
        },
        'show-tip': {
            type: 'boolean',
            val: true,
            displayName: '是否显示提示',
            tips: 'hover 时是否显示提示'
        },
        range: {
            type: 'boolean',
            val: false,
            displayName: '是否为范围选择',
            tips: '是否为范围选择'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-slider上'
        },
        step: {
            type: 'number',
            val: 1,
            displayName: '滑块每一步移动的距离',
            tips: '滑块每一步移动的距离'
        },
        showInterval: {
            type: 'boolean',
            val: false,
            displayName: '是否显示间断点',
            tips: '是否显示间断点'
        },
        showIntervalLabel: {
            type: 'boolean',
            val: false,
            displayName: '是否显示间断点下的标签',
            tips: '是否显示间断点下的标签'
        },
        intervalLabelUnit: {
            type: 'string',
            displayName: '标签单位',
            tips: '标签单位'
        },
        showButtonLabel: {
            type: 'boolean',
            val: false,
            displayName: '滑块下是否显示value值',
            tips: '滑块下是否显示value值'
        },
        buttonLabelUnit: {
            type: 'string',
            displayName: '滑块下是否显示单位',
            tips: '滑块下是否显示单位'
        },
        showBetweenLabel: {
            type: 'boolean',
            val: false,
            displayName: '首尾标签',
            tips: '首尾标签'
        },
        showInput: {
            type: 'boolean',
            val: false,
            displayName: '带输入的选择',
            tips: '带输入的选择'
        },
        customContent: {
            type: 'object',
            displayName: '自定义内容',
            tips: '自定义内容'
        },
        showCustomLabel: {
            type: 'boolean',
            val: false,
            displayName: '是否显示自定义标签',
            tips: '是否显示自定义标签'
        },
        showCustomTip: {
            type: 'boolean',
            val: false,
            displayName: '是否显示自定义tip',
            tips: '是否显示自定义tip'
        },
        vertical: {
            type: 'boolean',
            val: false,
            displayName: '是否为垂直模式',
            tips: '是否为垂直模式'
        },
        height: {
            type: 'string',
            val: '200px',
            displayName: '垂直模式高度',
            tips: '垂直模式高度'
        }
    }
}
