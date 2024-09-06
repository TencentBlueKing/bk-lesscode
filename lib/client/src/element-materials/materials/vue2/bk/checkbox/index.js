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
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/checkbox',
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
    directives: [
        {
            type: 'v-model',
            prop: 'checked'
        }
    ],
    props: {
        value: {
            type: ['boolean', 'string', 'number'],
            displayName: 'checkbox的真值',
            tips: 'checkbox的真值，与checkbox-group结合时通过配置value'
        },
        checked: {
            type: 'boolean',
            val: false,
            displayName: '选中的数值'
        },
        name: {
            type: 'string',
            displayName: '名称',
            tips: '名称'
        },
        trueValue: {
            type: ['boolean', 'string', 'number'],
            val: true,
            displayName: '勾选checkbox时的数值',
            tips: 'checkbox的真值'
        },
        falseValue: {
            type: ['boolean', 'string', 'number'],
            val: false,
            displayName: '未勾选checkbox时的数值',
            tips: 'checkbox的假值'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否禁用'
        },
        indeterminate: {
            type: 'boolean',
            val: false,
            displayName: '是否半选',
            tips: '是否半选'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-form-checkbox上'
        },
        beforeChange: {
            type: 'function',
            displayName: '选中状态变更前的回调函数',
            tips: '在选中状态发生变更前执行的函数，返回false将中断状态变更'
        }
    }
}
