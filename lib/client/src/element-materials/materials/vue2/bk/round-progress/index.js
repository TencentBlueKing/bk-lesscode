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
    name: 'round-progress',
    type: 'bk-round-progress',
    displayName: '圆形进度',
    icon: 'bk-drag-roundprogress',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/round-progress',
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
    renderStyles: {
        display: 'inline-block',
        verticalAlign: 'middle'
    },
    directives: [],
    groups: [
        { label: '分数值', value: 'value' },
        { label: '显示', value: 'display' },
        { label: '文本', value: 'text' },
        { label: '样式', value: 'style' }
    ],
    props: {
        percent: {
            type: 'float',
            val: 0.3,
            regExp: /^(0.\d+|0|1)$/,
            displayName: '显示目前进度',
            tips: '显示目前进度，可选值 0 < percent < 1',
            regErrorText: '请输入 0-1 之间的小数',
            belongGroup: 'value'
        },
        width: {
            type: 'string',
            val: '100px',
            displayName: '圆环的宽度',
            tips: '圆环的大小',
            belongGroup: 'style'
        },
        'num-show': {
            type: 'boolean',
            val: true,
            displayName: '是否显示百分数值',
            tips: '是否显示目前百分数值',
            belongGroup: 'display'
        },
        'num-style': {
            type: 'object',
            val: { fontSize: '16px' },
            displayName: '设置百分数样式',
            tips: '设置显示百分数的 css 样式',
            belongGroup: 'style'
        },
        title: {
            type: 'string',
            displayName: '标题名',
            tips: '标题名，默认不显示',
            belongGroup: 'text'
        },
        'title-style': {
            type: 'object',
            val: { fontSize: '16px' },
            displayName: '设置标题样式',
            tips: '设置 title 的 css 样式',
            belongGroup: 'style'
        },
        config: {
            type: 'object',
            val: {
                strokeWidth: 10,
                bgColor: '#f0f1f5',
                activeColor: '#2dcb56'
            },
            displayName: '颜色、宽度、背景色设置',
            tips: '设置进度圆环的颜色 bgColor、宽度 strokeWidth、背景色 bgColor',
            belongGroup: 'style'
        },
        numUnit: {
            type: 'string',
            val: '%',
            displayName: '值的单位',
            tips: '值的单位',
            belongGroup: 'value'
        },
        content: {
            type: 'string',
            displayName: '设置显示的内容',
            tips: '设置的内容，当设置此属性时，进度条会直接显示此属性的内容，不会显示进度值',
            belongGroup: 'text'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-round-progress上',
            belongGroup: 'style'
        }
    }
}
