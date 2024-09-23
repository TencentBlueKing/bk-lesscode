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
    name: 'checkbox',
    type: 'bk-checkbox',
    displayName: '复选框',
    icon: 'bk-drag-checkbox',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/checkbox',
    events: [
        {
            displayName: '绑定值变化',
            name: 'change',
            tips: '当绑定值变化时触发的事件，参数为(newValue: String | Number, oldValue: String | Number, selectList: Array)'
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
        display: 'inline-block',
        verticalAlign: 'middle'
    },
    groups: [
        { label: '值', value: 'value' },
        { label: '状态', value: 'state' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'model-value': {
            type: ['boolean', 'string', 'number'],
            val: false,
            displayName: '设置绑定值',
            tips: '绑定值',
            directive: 'v-model',
            belongGroup: 'value'
        },
        label: {
            type: ['string', 'number', 'boolean'],
            val: '选项一',
            displayName: '选中状态的值',
            tips: '选中状态的值',
            belongGroup: 'value'
        },
        'true-label': {
            type: ['boolean', 'string', 'number'],
            val: true,
            displayName: '选中时的值',
            tips: '选中时的值',
            belongGroup: 'value'
        },
        'false-label': {
            type: ['boolean', 'string', 'number'],
            val: false,
            displayName: '没有选中时的值',
            tips: '没有选中时的值',
            belongGroup: 'value'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '禁用',
            belongGroup: 'state'
        },
        checked: {
            type: 'boolean',
            val: false,
            displayName: '默认是否勾选',
            tips: '默认是否勾选',
            belongGroup: 'state'
        },
        indeterminate: {
            type: 'boolean',
            val: false,
            displayName: '是否半选',
            tips: '是否半选',
            belongGroup: 'state'
        },
        'before-change': {
            type: 'function',
            val: '',
            displayName: '状态改变时的校验函数',
            tips: '状态改变时前置校验函数',
            belongGroup: 'other'
        },
        size: {
            type: 'string',
            options: ['small', 'large', 'default'],
            val: 'large',
            displayName: '尺寸大小',
            tips: '尺寸',
            belongGroup: 'style'
        },
        'immediate-emit-change': {
            type: 'boolean',
            val: true,
            displayName: '是否触发change事件',
            tips: '是否触发change事件',
            belongGroup: 'other'
        }
    }
}
