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
    name: 'sideslider',
    type: 'bk-sideslider',
    displayName: '侧栏',
    icon: 'bk-drag-dialog',
    group: '反馈',
    order: 5,
    interactiveShow: true,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/sideslider',
    events: [
        {
            name: 'show',
            tips: '组件显示时的回调函数，暂无事件回调参数'
        },
        {
            name: 'hidden',
            tips: '组件隐藏时的回调函数，暂无事件回调参数'
        },
        {
            name: 'closed',
            tips: '关闭组件后的回调函数，暂无事件回调参数'
        },
        {
            name: 'animation-end',
            tips: '关闭组件后动画结束的回调函数，暂无事件回调参数'
        }
    ],
    renderStyles: {
        display: 'inline-block'
    },
    directives: [
        {
            type: 'v-model',
            prop: 'isShow'
        }
    ],
    props: {
        isShow: {
            type: 'boolean',
            tips: '是否显示组件，支持v-model写法',
            val: true,
            staticValue: true, // 静态值，表示只是代码和UI改变，画布内的值不变
            modifiers: ['sync'],
            asdasda: '',
            disableVariableType: ['expression'] // 不兼容的类型
        },
        title: {
            type: 'string',
            val: '自定义组件标题'
        },
        quickClose: {
            type: 'boolean',
            val: false,
            tips: '是否支持点击遮罩关闭组件'
        },
        showMask: {
            type: 'boolean',
            val: false,
            staticValue: false,
            tips: '是否允许出现遮罩'
        },
        width: {
            type: 'number',
            val: 400,
            tips: '组件的宽度'
        },
        direction: {
            type: 'string',
            options: ['left', 'right'],
            val: 'right'
        },
        transfer: {
            type: 'boolean',
            val: false,
            staticValue: true
        }
    },
    slots: {
        default: {
            name: ['layout'],
            type: ['render-block']
        }
    }
}