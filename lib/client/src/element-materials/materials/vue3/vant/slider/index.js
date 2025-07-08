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
    name: 'van-slider',
    type: 'van-slider',
    displayName: '滑块',
    icon: 'bk-drag-slider',
    group: '表单',
    order: 1,
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/slider',
    events: [
        {
            name: 'change',
            tips: '进度变化且结束拖动触发，事件回调参数 (value: 当前进度)'
        },
        {
            name: 'drag-start',
            tips: '开始拖动时触发'
        },
        {
            name: 'drag-end',
            tips: '结束拖动时触发'
        }
    ],
    styles: ['position', 'size', 'margin', 'opacity'],
    groups: [
        { label: '值', value: 'value' },
        { label: '范围', value: 'range' },
        { label: '状态', value: 'state' },
        { label: '提示', value: 'tip' },
        { label: '布局', value: 'layout' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' },
        { label: '滑块文本', value: 'text' }
    ],
    props: {
        'model-value': {
            type: ['number', 'array'],
            val: 0,
            directive: 'v-model',
            displayName: '当前进度百分比',
            belongGroup: 'value'
        },
        min: {
            type: ['string', 'number'],
            val: '0',
            displayName: '最小值',
            tips: '最小值',
            belongGroup: 'range'
        },
        max: {
            type: ['string', 'number'],
            val: '100',
            displayName: '最大值',
            tips: '最大值',
            belongGroup: 'range'
        },
        step: {
            type: ['string', 'number'],
            val: '1',
            displayName: '每次增多少值',
            tips: '步长',
            belongGroup: 'other'
        },
        'bar-height': {
            type: ['string', 'number'],
            val: '2px',
            displayName: '进度条高度',
            tips: '进度条高度，默认单位为px',
            belongGroup: 'style'
        },
        'button-size': {
            type: ['string', 'number'],
            val: '24px',
            displayName: '滑块按钮尺寸',
            tips: '滑块按钮大小，默认单位为px',
            belongGroup: 'style'
        },
        'active-color': {
            type: 'color',
            val: '#1989fa',
            displayName: '进度条激活颜色',
            tips: '进度条激活态颜色',
            belongGroup: 'style'
        },
        'inactive-color': {
            type: 'color',
            val: '#e5e5e5',
            displayName: '进度条非激活颜色',
            tips: '进度条非激活态颜色',
            belongGroup: 'style'
        },
        range: {
            type: 'boolean',
            val: false,
            displayName: '是否用双滑块模式',
            tips: '是否开启双滑块模式',
            belongGroup: 'other'
        },
        reverse: {
            type: 'boolean',
            val: false,
            displayName: '是否将进度条反转',
            tips: '是否将进度条反转',
            belongGroup: 'other'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否禁用滑块',
            belongGroup: 'state'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            tips: '是否为只读状态，只读状态下无法修改滑块的值',
            belongGroup: 'state'
        },
        vertical: {
            type: 'boolean',
            val: false,
            displayName: '是否垂直展示',
            tips: '是否垂直展示',
            belongGroup: 'layout'
        }
    },
    slots: {
        button: {
            name: ['html'],
            type: ['html'],
            displayName: '自定义滑块按钮',
            belongGroup: 'text'
        },
        'left-button': {
            name: ['html'],
            type: ['html'],
            displayName: '自定义左侧滑块按钮（双滑块模式下）',
            belongGroup: 'text'
        },
        'right-button': {
            name: ['html'],
            type: ['html'],
            displayName: '自定义右侧滑块按钮（双滑块模式下）',
            belongGroup: 'text'
        }
    }
}
