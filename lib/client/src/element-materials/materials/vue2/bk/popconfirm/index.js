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
    name: 'popconfirm',
    type: 'bk-popconfirm',
    displayName: '弹出确认',
    icon: 'bk-drag-popconfrim',
    group: '反馈',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/popconfirm',
    events: [
        {
            name: 'confirm',
            tips: '点击确定按钮时调用该事件函数，暂无事件回调参数'
        },
        {
            name: 'cancel',
            tips: '点击取消按钮时调用该事件函数，暂无事件回调参数'
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
    props: {
        title: {
            type: 'string',
            val: '鼠标移入提示，带操作的工具提示',
            tips: '标题'
        },
        theme: {
            type: 'string',
            val: 'light',
            options: ['light', 'dark'],
            tips: '主题'
        },
        trigger: {
            type: 'string',
            val: 'mouseenter',
            options: ['mouseenter', 'click'],
            tips: '触发方式'
        },
        'confirm-text': {
            type: 'string',
            val: '确定',
            tips: '确认按钮文字'
        },
        'cancel-text': {
            type: 'string',
            val: '取消',
            tips: '取消按钮文字'
        },
        'confirm-button-is-text': {
            type: 'boolean',
            val: true,
            tips: '确认按钮类型，当title或slot有值时生效'
        },
        'cancel-button-is-text': {
            type: 'boolean',
            val: true,
            tips: '取消按钮类型，当title或slot有值时生效'
        },
        'z-index': {
            type: 'number',
            val: 2500,
            tips: '弹出层z-index'
        }
    },
    slots: {
        default: {
            name: ['html'],
            type: ['html'],
            displayName: '展示内容',
            tips: '组件默认插槽，可以编写html，用于组件自身展示',
            val: '<bk-button>删除</bk-button>'
        },
        content: {
            name: ['html'],
            type: ['html'],
            displayName: '弹层内容',
            tips: '组件 content 插槽，可以编写html，用于弹层内容',
            val: '<div>自定义内容</div>'
        }
    }
}
