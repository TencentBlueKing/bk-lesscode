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
    name: 'color-picker',
    type: 'bk-color-picker',
    displayName: '颜色选择',
    icon: 'bk-drag-colorpick',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/color-picker',
    events: [
        {
            name: 'change',
            tips: '当前选择的RGB颜色值变化时调用该事件函数，事件回调参数 (value: String)'
        }
    ],
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
    renderStyles: {
        display: 'inline-flex',
        verticalAlign: 'middle'
    },
    props: {
        'model-value': {
            type: 'string',
            val: '#3A84FF',
            tips: '当前选择的RGB颜色值',
            directive: 'v-model'
        },
        disabled: {
            type: 'boolean',
            val: false,
            tips: '是否禁用'
        },
        readonly: {
            type: 'boolean',
            val: false,
            tips: '是否只读'
        },
        transfer: {
            type: 'boolean',
            val: false,
            tips: '控制颜色面板是否出现在 body 内'
        },
        size: {
            type: 'string',
            val: '',
            options: ['large', 'small'],
            tips: '尺寸大小'
        },
        'show-value': {
            type: 'boolean',
            val: true,
            tips: '是否显示当前选择的RGB颜色值'
        },
        recommend: {
            type: 'boolean',
            val: true,
            tips: '是否显示预设值'
        },
        'with-validate': {
            type: 'boolean',
            val: true,
            tips: '是否需要校验'
        }
    }
}
