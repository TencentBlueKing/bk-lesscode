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
    name: 'van-pagination',
    type: 'van-pagination',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-pagination',
    displayName: '分页',
    group: '导航',
    events: [
        { name: 'change', tips: '页码改变时触发' }
    ],
    styles: ['padding', 'margin'],
    renderStyles: {
    },
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    groups: [
        { label: '数据', value: 'data' },
        { label: '按钮文字', value: 'btnText' },
        { label: '显示', value: 'display' },
        { label: '样式', value: 'style' }
    ],
    props: {
        value: {
            type: 'number',
            val: 1,
            displayName: '当前页码',
            tips: '当前页码',
            belongGroup: 'data'
        },
        mode: {
            type: 'string',
            val: 'multi',
            options: ['multi', 'simple'],
            displayName: '显示模式',
            tips: '显示模式',
            belongGroup: 'style'
        },
        'prev-text': {
            type: 'string',
            val: '上一页',
            displayName: '上一页按钮文字',
            tips: '上一页按钮文字',
            belongGroup: 'btnText'
        },
        'next-text': {
            type: 'string',
            val: '下一页',
            displayName: '下一页按钮文字',
            tips: '下一页按钮文字',
            belongGroup: 'btnText'
        },
        'page-count': {
            type: ['number', 'string'],
            val: '',
            displayName: '总页数',
            tips: '总页数',
            belongGroup: 'data'
        },
        'total-items': {
            type: ['number', 'string'],
            val: 0,
            displayName: '总数据量',
            tips: '总记录数',
            belongGroup: 'data'
        },
        'items-per-page': {
            type: ['number', 'string'],
            val: 10,
            displayName: '每页数据量',
            tips: '每页记录数',
            belongGroup: 'data'
        },
        'show-page-size': {
            type: ['number', 'string'],
            val: 5,
            displayName: '显示的页码个数',
            tips: '显示的页码个数',
            belongGroup: 'display'
        },
        'force-ellipses': {
            type: 'boolean',
            val: false,
            displayName: '是否显示省略号',
            tips: '是否显示省略号',
            belongGroup: 'display'
        }
    }
}
