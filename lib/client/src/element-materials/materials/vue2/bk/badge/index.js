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
    name: 'badge',
    type: 'bk-badge',
    displayName: '标记',
    icon: 'bk-drag-badge',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/badge',
    events: [
        {
            displayName: '鼠标hover悬浮',
            name: 'hover',
            tips: '鼠标 hover 时调用该事件函数，暂无回调参数'
        },
        {
            displayName: '鼠标离开',
            name: 'leave',
            tips: '鼠标 leave 时调用该事件函数，暂无回调参数'
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
    props: {
        theme: {
            type: 'string',
            options: ['primary', 'info', 'warning', 'danger', 'success'],
            val: 'primary',
            displayName: '主题色',
            tips: '主题色'
        },
        val: {
            type: 'string',
            val: '1',
            displayName: '标记显示值',
            tips: '标记内容'
        },
        icon: {
            type: 'icon',
            val: '',
            displayName: '显示图标'
        },
        max: {
            type: 'number',
            val: 9999,
            displayName: '显示的最大值',

            tips: '组件显示的最大值，当 value 超过 max，显示数字 +；仅当设置了 Number 类型的 value 值时生效'
        },
        dot: {
            type: 'boolean',
            val: false,
            displayName: '是否仅显示小圆点',
            tips: '是否仅显示小圆点；当设置 dot 为 true 时，val, icon, max 均会被忽略'
        },
        position: {
            type: 'string',
            val: 'top-right',
            options: ['top-right', 'bottom-right', 'bottom-left', 'top-left'],
            displayName: '显示值位置',
            tips: '组件相对于其兄弟组件的位置'
        },
        visible: {
            type: 'boolean',
            displayName: '是否显示组件',
            tips: '是否显示组件'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素样式类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-badge-wrapper上'
        },
        radius: {
            type: 'string',
            displayName: '配置自定义弧度',
            tips: '配置自定义弧度，以实现多种形状'
        },
        valLength: {
            type: 'number',
            val: 3,
            displayName: '配置val字符显示长度',
            tips: '配置val字符显示长度，最大值建议英文不超过3个字母，中文不超过2个汉字(一个汉字长度算作2)'
        }
    },
    slots: {
        default: {
            name: ['html'],
            type: ['text'],
            displayName: '文本',
            val: '文字标记'
        }
    }
}
