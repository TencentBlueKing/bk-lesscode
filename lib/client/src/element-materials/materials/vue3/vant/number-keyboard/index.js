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
    name: 'van-number-keyboard',
    type: 'van-number-keyboard',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-numberkeyborad',
    displayName: '数字键盘',
    group: '表单',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/number-keyboard',
    events: [
        { name: 'input', tips: '点击按键时触发' },
        { name: 'delete', tips: '点击删除键时触发' },
        { name: 'close', tips: '点击关闭按钮时触发' },
        { name: 'blur', tips: '点击关闭按钮或非键盘区域时触发' },
        { name: 'show', tips: '键盘完全弹出时触发' },
        { name: 'hide', tips: '键盘完全收起时触发' }

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
            type: 'string',
            val: '',
            tips: '密码值',
            directive: 'v-model'
        },
        show: {
            type: 'boolean',
            val: true,
            tips: '是否显示键盘'
        },
        title: {
            type: 'string',
            val: '',
            tips: '键盘标题'
        },
        theme: {
            type: 'string',
            val: 'default',
            options: ['default', 'custom'],
            tips: '键盘标题'
        },
        maxlength: {
            type: ['number', 'string'],
            tips: '输入值最大长度'
        },
        transition: {
            type: 'boolean',
            val: true,
            tips: '是否开启过场动画'
        },
        'z-index': {
            type: ['number', 'string'],
            val: 100,
            tips: '键盘 z-index 层级'
        },
        'extra-key ': {
            type: ['string', 'array'],
            val: '',
            tips: '底部额外按键的内容'
        },
        'close-button-text': {
            type: 'string',
            tips: '关闭按钮文字，空则不展示'
        },
        'delete-button-text': {
            type: 'string',
            tips: '删除按钮文字，空则展示删除图标'
        },
        'close-button-loading': {
            type: 'boolean',
            val: false,
            tips: '是否将关闭按钮设置为加载中状态，仅在 theme="custom" 时有效'
        },
        'show-delete-key': {
            type: 'boolean',
            val: true,
            tips: '是否展示删除图标'
        },
        'blur-on-close': {
            type: 'boolean',
            val: true,
            tips: '是否在点击关闭按钮时触发 blur 事件'
        },
        'hide-on-click-outside': {
            type: 'boolean',
            val: true,
            tips: '点击外部时是否收起键盘'
        },
        teleport: {
            type: ['string', 'element'],
            val: '',
            tips: '指定挂载的节点，等同于 Teleport 组件的 to 属性'
        },
        'safe-area-inset-bottom': {
            type: 'boolean',
            val: true,
            tips: '是否开启底部安全区适配'
        },
        'random-key-order': {
            type: 'boolean',
            val: false,
            tips: '是否将通过随机顺序展示按键'
        }
    },
    slots: {
        delete: {
            name: ['text'],
            type: ['text'],
            displayName: '自定义删除按键内容',
            val: '自定义删除按键内容'
        },
        'extra-key': {
            name: ['text'],
            type: ['text'],
            displayName: '自定义左下角按键内容',
            val: '自定义左下角按键内容'
        },
        'title-left': {
            name: ['text'],
            type: ['text'],
            displayName: '自定义标题栏左侧内容',
            val: '自定义标题栏左侧内容'
        }
    }
}
