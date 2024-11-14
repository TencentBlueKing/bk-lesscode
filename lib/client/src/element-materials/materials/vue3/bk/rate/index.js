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
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/rate',
    events: [
        {
            displayName: '评分变化',
            name: 'change',
            tips: '评分发生变化的时候'
        },
        {
            displayName: '鼠标hover评分',
            name: 'hover-change',
            tips: '鼠标hover评分的时候'
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
    groups: [
        { label: '分数值', value: 'value' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'model-value': {
            type: 'number',
            val: 0,
            displayName: '显示的分数',
            tips: '显示的分数',
            directive: 'v-model',
            belongGroup: 'value'
        },
        size: {
            type: 'string',
            val: 'default',
            options: ['small', 'default', 'large'],
            displayName: '尺寸',
            tips: '尺寸',
            belongGroup: 'style'
        },
        editable: {
            type: 'boolean',
            val: true,
            displayName: '是否可编辑',
            tips: '是否可编辑',
            belongGroup: 'other'
        },
        'with-validate': {
            type: 'boolean',
            val: true,
            displayName: '值改变时触发字段校验规则',
            belongGroup: 'other'
        }
    }
}
