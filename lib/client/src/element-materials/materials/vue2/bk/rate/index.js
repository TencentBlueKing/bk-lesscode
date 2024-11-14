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
    name: 'rate',
    type: 'bk-rate',
    displayName: '评分',
    icon: 'bk-drag-rate',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/rate',
    events: [
        {
            displayName: '选择评分',
            name: 'score',
            tips: '评分的时候调用该事件函数，事件回调参数 (rate: Number)'
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
    directives: [],
    groups: [
        { label: '分数值', value: 'value' },
        { label: '提示', value: 'tooltip' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        rate: {
            type: 'number',
            val: 0,
            displayName: '显示分数',
            tips: '显示的分数',
            modifiers: ['sync'],
            belongGroup: 'value'
        },
        width: {
            type: 'number',
            val: 15,
            displayName: '星星宽度',
            tips: '星星的宽度',
            belongGroup: 'style'
        },
        height: {
            type: 'number',
            val: 16,
            displayName: '星星高度',
            tips: '星星的高度',
            belongGroup: 'style'
        },
        edit: {
            type: 'boolean',
            val: true,
            displayName: '是否编辑',
            belongGroup: 'other'
        },
        tooltips: {
            type: 'array',
            displayName: '展示每颗星星的文案',
            tips: '展示的文案，数组中的每一项对应每一颗星星的文案',
            belongGroup: 'tooltip'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-score-group上',
            belongGroup: 'style'
        }
    }
}
