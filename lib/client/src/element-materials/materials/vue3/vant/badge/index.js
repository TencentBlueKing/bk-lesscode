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
    name: 'van-badge',
    type: 'van-badge',
    displayName: '徽标',
    icon: 'bk-drag-badge',
    group: '数据',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/badge',
    order: 1,
    styles: [
        'position',
        'size',
        'margin',
        'opacity'
    ],
    renderStyles: {
        display: 'inline-block'
    },
    props: {
        content: {
            type: ['string', 'number'],
            val: '1',
            tips: '徽标内容'
        },
        color: {
            type: 'color',
            val: '#ee0a24',
            tips: '徽标背景颜色'
        },
        dot: {
            type: 'boolean',
            val: false,
            tips: '是否展示为小红点'
        },
        max: {
            type: ['number', 'string'],
            tips: '最大值，超过最大值会显示 {max}+，仅当 content 为数字时有效'
        },
        offset: {
            type: ['number', 'string'],
            tips: '设置徽标的偏移量，数组的两项分别对应水平向右和垂直向下方向的偏移量，默认单位为 px'
        },
        'show-zero': {
            type: 'boolean',
            tips: '当 content 为数字 0 或字符串 \'0\' 时，是否展示徽标',
            val: true
        },
        'position': {
            type: 'string',
            tips: '徽标位置，可选值为 top-left bottom-left bottom-right',
            options: ['top-left', 'bottom-left', 'bottom-right'],
            val: 'top-right'
        }
    },
    slots: {
        default: {
            name: ['text'],
            type: ['text'],
            displayName: '文本',
            val: '文字标记'
        },
        content: {
            name: ['text'],
            type: ['text'],
            displayName: '自定义徽标内容',
            val: '1'
        }
    }
}
