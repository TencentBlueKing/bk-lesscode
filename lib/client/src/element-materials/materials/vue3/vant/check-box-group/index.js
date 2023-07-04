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
    name: 'van-checkbox-group',
    type: 'van-checkbox-group',
    displayName: '多选框',
    icon: 'bk-drag-checkbox',
    group: '表单',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/checkbox',
    events: [
        {
            name: 'change',
            tips: '当绑定值变化时调用该事件函数，事件回调参数 (names: Array)'
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
    props: {
        modelValue: {
            type: 'array',
            val: [],
            directive: 'v-model'
        },
        disabled: {
            type: 'boolean',
            val: false,
            tips: '是否禁用所有复选框'
        },
        max: {
            type: ['number', 'string'],
            val: 0,
            tips: '最大可选数，0为无限制'
        },
        direction: {
            type: 'string',
            options: ['vertical', 'horizontal'],
            val: 'horizontal',
            tips: '排列方向'
        },
        'icon-size': {
            type: ['string', 'number'],
            val: '20px',
            tips: '所有复选框的图标大小，默认单位为 px'
        },
        'checked-color': {
            type: 'color',
            val: '#1989fa',
            tips: '所有复选框的选中状态颜色'
        }
    },
    slots: {
        default: {
            name: ['van-checkbox'],
            type: ['list', 'remote'],
            displayName: '可选项',
            tips: '默认插槽，填写的数据需要是数组且每个元素需包含label和value字段',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'label', label: '名称', tips: '从数据中获取名称的字段key，不填取 label 字段' },
                { id: 'value', label: '值', tips: '从数据中获取值的字段key，不填取 value 字段' },
                { id: 'disabled', label: '是否禁用', tips: '从数据中获取是否禁用的字段key，不填取 disabled 字段' }
            ],
            val: [
                { label: '选项一', value: '1', disabled: false },
                { label: '选项二', value: '2', disabled: false },
                { label: '选项三', value: '3', disabled: false }
            ],
            payload: {}
        }
    }
}
