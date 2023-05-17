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
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/badge',
    events: [
        {
            name: 'hover',
            tips: '鼠标 hover 时调用该事件函数，暂无回调参数'
        },
        {
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
            tips: '主题色'
        },
        count: {
            type: ['number', 'string'],
            val: '1',
            tips: '组件显示的值'
        },
        position: {
            type: 'string',
            val: 'top-right',
            options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            tips: '组件相对于其兄弟组件的位置'
        },
        radius: {
            type: ['number', 'string'],
            val: '18px',
            tips: '配置自定义弧度，以实现多种形状'
        },
        valLength: {
            type: 'number',
            val: 3,
            tips: '配置val字符显示长度，最大值建议英文不超过3个字母，中文不超过2个汉字'
        },
        overflowCount: {
            type: 'number',
            val: 99,
            tips: '组件显示的最大值，当count超过overflowCount，显示数字 +；仅当设置了Number类型的count 值时生效'
        },
        dot: {
            type: 'boolean',
            val: false,
            tips: '是否仅显示小圆点；当设置dot为true时，count, icon, overflowCount 均会被忽略'
        },
        visible: {
            type: 'boolean',
            val: false,
            tips: '是否显示组件'
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
