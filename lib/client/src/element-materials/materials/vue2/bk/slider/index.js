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
    groups: [
        { label: '数值', value: 'value' },
        { label: '自定义配置', value: 'customConfig' },
        { label: '显示', value: 'display' },
        { label: '数值单位', value: 'unit' },
        { label: '状态', value: 'state' },
        { label: '方向', value: 'direction' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        value: {
            type: 'number',
            val: 30,
            displayName: '滑动数值',
            tips: '滑动数值，支持v-model双向绑定，v-model优先级更高',
            belongGroup: 'value'
        },
        'min-value': {
            type: 'number',
            val: 0,
            displayName: '滑动最小数值',
            belongGroup: 'value'
        },
        'max-value': {
            type: 'number',
            val: 100,
            displayName: '滑动最大数值',
            belongGroup: 'value'
        },
        disable: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            belongGroup: 'state'
        },
        'show-tip': {
            type: 'boolean',
            val: true,
            displayName: '是否显示提示',
            tips: 'hover 时是否显示提示',
            belongGroup: 'display'
        },
        range: {
            type: 'boolean',
            val: false,
            displayName: '是否为范围选择',
            tips: '是否为范围选择',
            belongGroup: 'other'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-slider上',
            belongGroup: 'style'
        },
        step: {
            type: 'number',
            val: 1,
            displayName: '滑块每一步移动的距离',
            tips: '滑块每一步移动的距离',
            belongGroup: 'other'
        },
        showInterval: {
            type: 'boolean',
            val: false,
            displayName: '是否显示间断点',
            tips: '是否显示间断点',
            belongGroup: 'display'
        },
        showIntervalLabel: {
            type: 'boolean',
            val: false,
            displayName: '是否显示间断点下的标签',
            tips: '是否显示间断点下的标签',
            belongGroup: 'display'
        },
        intervalLabelUnit: {
            type: 'string',
            displayName: '标签单位',
            tips: '标签单位',
            belongGroup: 'unit'
        },
        showButtonLabel: {
            type: 'boolean',
            val: false,
            displayName: '滑块下是否显示value值',
            tips: '滑块下是否显示value值',
            belongGroup: 'display'
        },
        buttonLabelUnit: {
            type: 'string',
            displayName: '滑块下是否显示单位',
            tips: '滑块下是否显示单位',
            belongGroup: 'unit'
        },
        showBetweenLabel: {
            type: 'boolean',
            val: false,
            displayName: '首尾标签',
            tips: '首尾标签',
            belongGroup: 'display'
        },
        showInput: {
            type: 'boolean',
            val: false,
            displayName: '带输入的选择',
            tips: '带输入的选择',
            belongGroup: 'display'
        },
        customContent: {
            type: 'object',
            displayName: '自定义内容',
            tips: '自定义内容',
            belongGroup: 'customConfig'
        },
        showCustomLabel: {
            type: 'boolean',
            val: false,
            displayName: '是否显示自定义标签',
            tips: '是否显示自定义标签',
            belongGroup: 'customConfig'
        },
        showCustomTip: {
            type: 'boolean',
            val: false,
            displayName: '是否显示自定义tip',
            tips: '是否显示自定义tip',
            belongGroup: 'customConfig'
        },
        vertical: {
            type: 'boolean',
            val: false,
            displayName: '是否为垂直模式',
            tips: '是否为垂直模式',
            belongGroup: 'direction'
        },
        height: {
            type: 'string',
            val: '200px',
            displayName: '垂直模式高度',
            tips: '垂直模式高度',
            belongGroup: 'style'
        }
    }
}
