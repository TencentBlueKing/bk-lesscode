/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
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
    document: 'https://vant-contrib.gitee.io/vant/v2/#/zh-CN/cell',
    events: [
        {
            name: 'click',
            tips: '点击时调用该事件函数，事件回调参数 (e: Event)'
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
    groups: [
        { label: '标题', value: 'title' },
        { label: '内容', value: 'content' },
        { label: '地址', value: 'address' },
        { label: '显示', value: 'display' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        title: {
            type: ['string', 'number'],
            val: '单元格',
            displayName: '左侧标题',
            tips: '左侧标题',
            belongGroup: 'title'
        },
        value: {
            type: ['string', 'number'],
            val: '内容',
            displayName: '右侧内容',
            tips: '右侧内容',
            belongGroup: 'content'
        },
        label: {
            type: 'string',
            val: '描述信息',
            displayName: '描述信息',
            tips: '标题下方的描述信息',
            belongGroup: 'content'
        },
        size: {
            type: 'string',
            options: ['large'],
            displayName: '尺寸',
            tips: '单元格大小',
            belongGroup: 'style'
        },
        icon: {
            type: 'van-icon',
            val: '',
            displayName: '左侧图标或图片',
            tips: '左侧图标名称或图片链接',
            belongGroup: 'content'
        },
        url: {
            type: 'string',
            val: '',
            displayName: '跳转地址',
            tips: '点击后跳转的链接地址',
            belongGroup: 'address'
        },
        to: {
            type: 'route',
            val: '',
            displayName: '跳转路由',
            tips: '点击后跳转的路由对象,必须是已创建的页面',
            belongGroup: 'address'
        },
        border: {
            type: 'boolean',
            val: true,
            displayName: '是否显示边框',
            tips: '是否显示边框',
            belongGroup: 'style'
        },
        replace: {
            type: 'boolean',
            val: false,
            displayName: '是否替换当前路由',
            tips: '是否在跳转时替换当前历史页面',
            belongGroup: 'address'
        },
        clickable: {
            type: 'boolean',
            val: false,
            displayName: '是否开启点击反馈',
            tips: '是否开启点击反馈',
            belongGroup: 'other'
        },
        'is-link': {
            type: 'boolean',
            val: false,
            displayName: '是否显示右侧箭头',
            tips: '是否展示右侧箭头并开启点击反馈',
            belongGroup: 'display'
        },
        required: {
            type: 'boolean',
            val: false,
            displayName: '是否有表单必填星号',
            tips: '是否显示表单必填星号',
            belongGroup: 'display'
        },
        center: {
            type: 'boolean',
            val: false,
            displayName: '内容是否垂直居中',
            tips: '是否使内容垂直居中',
            belongGroup: 'style'
        },
        'arrow-direction': {
            type: 'string',
            val: '',
            options: ['left', 'up', 'down', ''],
            displayName: '箭头方向',
            tips: '箭头方向',
            belongGroup: 'style'
        }
    }
}
