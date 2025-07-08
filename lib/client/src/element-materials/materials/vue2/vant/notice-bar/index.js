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
    name: 'van-notice-bar',
    type: 'van-notice-bar',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-noticebar',
    displayName: '通知栏',
    group: '数据',
    events: [
        { name: 'click', tips: '点击通知栏时触发，回调参数Event' },
        { name: 'close', tips: '关闭通知栏时触发，回调参数Event' },
        { name: 'replay', tips: '每当滚动栏重新开始滚动时触发' }
    ],
    styles: ['padding', 'margin'],
    renderStyles: {
    },
    groups: [
        { label: '模式', value: 'mode' },
        { label: '文本', value: 'text' },
        { label: '图标', value: 'icon' },
        { label: '动画', value: 'animation' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'mode': {
            type: 'string',
            val: '',
            options: ['closeable', 'link'],
            displayName: '通知栏模式',
            tips: '通知栏模式',
            belongGroup: 'mode'
        },
        'text': {
            type: 'string',
            val: '通知内容',
            displayName: '通知文本内容',
            tips: '通知文本内容',
            belongGroup: 'text'
        },
        'color': {
            type: 'color',
            val: '#f60',
            displayName: '通知文本颜色',
            tips: '通知文本颜色',
            belongGroup: 'text'
        },
        'background': {
            type: 'string',
            val: '#fff7cc',
            displayName: '滚动条背景颜色',
            tips: '滚动条背景',
            belongGroup: 'style'
        },
        'left-icon': {
            type: 'van-icon',
            val: 'info-o',
            displayName: '左侧图标或图片',
            tips: '左侧图标名称或图片链接',
            belongGroup: 'icon'
        },
        'delay': {
            type: ['string', 'number'],
            val: '1',
            displayName: '动画延迟时间',
            tips: '动画延迟时间 (s)',
            belongGroup: 'animation'
        },
        'speed': {
            type: ['string', 'number'],
            val: '60',
            displayName: '滚动速度',
            tips: '滚动速率(px/s)',
            belongGroup: 'animation'
        },
        'scrollable': {
            type: 'boolean',
            displayName: '是否有滚动播放',
            tips: '是否开启滚动播放，内容长度溢出时默认开启',
            belongGroup: 'other'
        },
        'wrapable': {
            type: 'boolean',
            val: false,
            displayName: '是否文本可换行',
            tips: '是否开启文本换行，只在禁用滚动时生效',
            belongGroup: 'other'
        }
    }
}
