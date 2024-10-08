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
    name: 'van-circle',
    type: 'van-circle',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-circle',
    displayName: '环形进度条',
    group: '数据',
    styles: ['padding', 'margin', 'font'],
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
        { label: '文本', value: 'text' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'value': {
            type: 'number',
            val: 70,
            displayName: '当前进度',
            tips: '当前进度',
            belongGroup: 'data'
        },
        'rate': {
            type: ['string', 'number'],
            val: '100',
            displayName: '目标进度',
            tips: '目标进度',
            belongGroup: 'data'
        },
        'size': {
            type: ['string', 'number'],
            val: '100px',
            displayName: '圆环直径',
            tips: '圆环直径，默认单位为 px',
            belongGroup: 'style'
        },
        'color': {
            type: ['object', 'color'],
            val: '#1989fa',
            displayName: '进度条颜色',
            tips: '进度条颜色，传入对象格式可以定义渐变色',
            belongGroup: 'style'
        },
        'layer-color': {
            type: 'color',
            val: 'white',
            displayName: '轨道颜色',
            tips: '轨道颜色',
            belongGroup: 'style'
        },
        'fill': {
            type: 'color',
            val: 'none',
            displayName: '填充颜色',
            tips: '填充颜色',
            belongGroup: 'style'
        },
        'speed': {
            type: ['string', 'object'],
            val: '0',
            displayName: '动画速度',
            tips: '动画速度（单位为 rate/s）',
            belongGroup: 'other'
        },
        'text': {
            type: 'string',
            val: '进度',
            displayName: '文本',
            tips: '文字',
            belongGroup: 'text'
        },
        'stroke-width': {
            type: ['string', 'object'],
            val: '40',
            displayName: '进度条宽度',
            tips: '进度条宽度',
            belongGroup: 'style'
        },
        'stroke-linecap': {
            type: 'string',
            options: ['square', 'butt', 'round'],
            val: 'round',
            displayName: '进度条端点形状',
            tips: '进度条端点的形状',
            belongGroup: 'style'
        },
        'clockwise': {
            type: 'boolean',
            val: false,
            displayName: '是否顺时针增加',
            tips: '是否顺时针增加',
            belongGroup: 'other'
        }
    }
}
