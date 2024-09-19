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
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/color-picker',
    events: [
        {
            displayName: 'RGB颜色值变化',
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
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    groups: [
        { label: '值', value: 'value' },
        { label: '显示', value: 'display' },
        { label: '状态', value: 'state' },
        { label: '样式', value: 'style' }
    ],
    props: {
        value: {
            type: 'string',
            val: '#3A84FF',
            displayName: '初始RGB颜色值',
            tips: '当前选择的RGB颜色值',
            belongGroup: 'value'
        },
        size: {
            type: 'string',
            val: '',
            options: ['large', 'middle', 'small'],
            displayName: '尺寸大小',
            tips: '尺寸大小',
            belongGroup: 'style'
        },
        'show-value': {
            type: 'boolean',
            val: true,
            displayName: '是否显示RGB颜色值',
            tips: '是否显示当前选择的RGB颜色值',
            belongGroup: 'display'
        },
        transfer: {
            type: 'boolean',
            val: false,
            displayName: '颜色面板是否出现在body内',
            tips: '控制颜色面板是否出现在body内',
            belongGroup: 'state'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否禁用',
            belongGroup: 'state'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            tips: '是否只读',
            belongGroup: 'state'
        },
        recommend: {
            type: ['boolean', 'array'],
            val: true,
            displayName: '是否显示预设值',
            tips: '是否显示预设值',
            belongGroup: 'display'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-color-picker上',
            belongGroup: 'style'
        }
    }
}
