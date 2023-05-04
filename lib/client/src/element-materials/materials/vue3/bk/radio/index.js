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
    name: 'radio-group',
    type: 'bk-radio-group',
    displayName: '单选框',
    icon: 'bk-drag-radio',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/radio',
    events: [
        {
            name: 'change',
            tips: '当绑定值变化时触发的事件，事件回调参数 (value: String | Number | Boolean)'
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
        display: 'inline-block',
        verticalAlign: 'middle'
    },
    directives: [
        {
            type: 'v-model',
            prop: 'modelValue'
        }
    ],
    props: {
        modelValue: {
            type: ['string', 'number', 'boolean'],
            val: ''
        },
        name: {
            type: 'string',
            val: ''
        },
        disabled: {
            type: 'boolean',
            val: false
        },
        withValidate: {
            type: 'boolean',
            val: true
        }
    },
    slots: {
        default: {
            name: ['bk-radio'],
            type: ['list', 'remote'],
            displayName: '可选项',
            tips: '默认插槽，填写的数据需要是数组且每个元素需包含label和value字段',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'name', label: '名称', tips: '从数据中获取名称的字段key，不填取 label 字段' },
                { id: 'modelValue', label: '值', tips: '从数据中获取值的字段key，不填取 value 字段' },
                { id: 'label', label: '选中状态的值', tips: '选中状态的值' },
                { id: 'disabled', label: '是否禁用', tips: '是否禁用' }
            ],
            val: [
                { name: '选项一', label: '', modelValue: '1', checked: false, disabled: false },
                { name: '选项二', label: '', modelValue: '2', checked: false, disabled: false },
                { name: '选项三', label: '', modelValue: '3', checked: false, disabled: false }
            ],
            payload: {}
        }
    }
}
