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
    name: 'el-radio-group',
    type: 'el-radio-group',
    displayName: '单选框',
    icon: 'bk-drag-radio',
    group: '表单',
    order: 1,
    document: 'https://element.eleme.cn/#/zh-CN/component/radio',
    events: [
        {
            name: 'change',
            tips: '绑定值变化时调用该事件函数，事件回调参数 (value: String|Number|Boolean)'
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
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    props: {
        value: {
            type: ['string', 'number', 'boolean'],
            val: '1'
        },
        disabled: {
            type: 'boolean',
            val: false,
            'v-bind': '',
            tips: '是否禁用状态'
        }
    },
    slots: {
        default: {
            name: ['el-radio'],
            type: ['list', 'remote'],
            displayName: '可选项',
            tips: '默认插槽，填写的数据需要是数组且每个元素需包含label和value字段',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'label', label: '名称', tips: '从数据中获取名称的字段key，不填取 label 字段' },
                { id: 'value', label: '值', tips: '从数据中获取值的字段key，不填取 value 字段' }
            ],
            val: [
                { label: '单选一', value: '1' },
                { label: '单选二', value: '2' },
                { label: '单选三', value: '3' }
            ]
        }
    }
}
