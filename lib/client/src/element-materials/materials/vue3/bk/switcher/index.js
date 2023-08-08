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
    name: 'switcher',
    type: 'bk-switcher',
    displayName: '开关',
    icon: 'bk-drag-switcher',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/switcher',
    events: [
        {
            name: 'change',
            tips: '状态发生变化时调用该事件函数，事件回调参数 (status: Boolean)'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            include: ['display']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        display: 'inline-block'
    },
    props: {
        theme: {
            type: 'string',
            options: ['primary', 'warning', 'success', 'danger'],
            val: 'primary'
        },
        size: {
            type: 'string',
            val: 'default',
            options: ['small', 'default', 'large'],
            tips: '尺寸，显示文本时此属性无效'
        },
        'model-value': {
            type: ['boolean', 'string', 'number'],
            val: false,
            directive: 'v-model'
        },
        disabled: {
            type: 'boolean',
            val: false
        },
        'is-outline': {
            type: 'boolean',
            val: false,
            tips: '是否为描边效果'
        },
        'is-square': {
            type: 'boolean',
            val: false,
            tips: '是否为方形效果'
        },
        'show-text': {
            type: 'boolean',
            val: false,
            tips: '是否显示文本'
        },
        'on-text': {
            type: 'string',
            val: 'ON',
            tips: '打开状态显示的文本'
        },
        'off-text': {
            type: 'string',
            val: 'OFF',
            tips: '关闭状态显示文本'
        },
        'with-validate': {
            type: 'boolean',
            val: true
        },
        'true-value': {
            type: ['boolean', 'string', 'number'],
            val: true,
            tips: 'switcher的真值'
        },
        'false-value': {
            type: ['boolean', 'string', 'number'],
            val: false,
            tips: 'switcher的假值'
        },
        'before-change': {
            type: 'function',
            val: () => {},
            tips: '状态切换的前置检测接收操作后的状态（lastValue），返回true，false，Promise'
        }
    }
}
