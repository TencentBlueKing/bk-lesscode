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
    name: 'van-cell',
    type: 'van-cell',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-cellcellgroup',
    displayName: '单元格',
    group: '基础',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/cell',
    events: [
        {
            name: 'click',
            tips: '点击单元格时触发，事件回调参数 (e: Event)'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            include: ['display']
        },
        'margin',
        'padding',
        'opacity',
        'pointer'
    ],
    props: {
        title: {
            type: ['string', 'number'],
            val: '单元格',
            displayName: '左侧标题',
            tips: '左侧标题'
        },
        value: {
            type: ['string', 'number'],
            val: '内容',
            displayName: '右侧内容',
            tips: '右侧内容'
        },
        label: {
            type: 'string',
            val: '描述信息',
            displayName: '描述信息',
            tips: '标题下方的描述信息'
        },
        size: {
            type: 'string',
            options: ['large'],
            displayName: '尺寸',
            tips: '单元格大小，可选值为 large'
        },
        icon: {
            type: 'van-icon',
            val: '',
            displayName: '左侧图标或图片',
            tips: '左侧图标名称或图片链接，等同于 Icon 组件的 name 属性'
        },
        'icon-prefix': {
            type: 'string',
            val: 'van-icon',
            displayName: '图标类名前缀',
            tips: '图标类名前缀，等同于 Icon 组件的 class-prefix 属性'
        },
        url: {
            type: 'string',
            val: '',
            displayName: '跳转地址',
            tips: '点击后跳转的链接地址'
        },
        to: {
            type: 'route',
            val: '',
            displayName: '跳转路由',
            tips: '点击后跳转的目标路由对象，等同于 vue-router 的 to 属性'
        },
        border: {
            type: 'boolean',
            val: true,
            displayName: '是否显示边框',
            tips: '是否显示边框'
        },
        replace: {
            type: 'boolean',
            val: false,
            displayName: '是否替换当前路由',
            tips: '是否在跳转时替换当前页面历史'
        },
        clickable: {
            type: 'boolean',
            val: false,
            displayName: '是否开启点击反馈',
            tips: '是否开启点击反馈'
        },
        'is-link': {
            type: 'boolean',
            val: false,
            displayName: '是否显示右侧箭头',
            tips: '是否展示右侧箭头并开启点击反馈'
        },
        required: {
            type: 'boolean',
            val: false,
            displayName: '是否有表单必填星号',
            tips: '是否显示表单必填星号'
        },
        center: {
            type: 'boolean',
            val: false,
            displayName: '内容是否垂直居中',
            tips: '是否使内容垂直居中'
        },
        'arrow-direction': {
            type: 'string',
            val: 'right',
            options: ['left', 'up', 'down', 'right'],
            displayName: '箭头方向',
            tips: '箭头方向，可选值为 left up down'
        },
        'title-style': {
            type: ['string', 'array', 'object'],
            val: '',
            displayName: '左侧标题样式',
            tips: '左侧标题额外样式'
        },
        'title-class': {
            type: ['string', 'array', 'object'],
            val: '',
            displayName: '左侧标题类名',
            tips: '右侧内容额外类名'
        },
        'label-class': {
            type: ['string', 'array', 'object'],
            val: '',
            displayName: '描述信息类名',
            tips: '描述信息额外类名'
        }
    }
}
