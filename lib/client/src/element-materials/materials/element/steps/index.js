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
    name: 'el-steps',
    type: 'el-steps',
    displayName: '步骤',
    icon: 'bk-drag-step',
    group: '导航',
    order: 1,
    document: 'https://element.eleme.cn/#/zh-CN/component/steps',
    styles: ['position', 'size', 'margin', 'pointer', 'opacity'],
    props: {
        space: {
            type: ['number', 'string'],
            tips: '每个 step 的间距，不填写将自适应间距。支持百分比'
        },
        direction: {
            type: 'string',
            options: ['horizontal', 'vertical'],
            val: 'horizontal',
            tips: '步骤条方向，支持水平（horizontal）和竖直（vertical）两种方向'
        },
        active: {
            type: 'number',
            val: 0,
            tips: '设置当前激活步骤'
        },
        'process-status': {
            type: 'string',
            options: ['wait', 'process', 'finish', 'error', 'success'],
            val: 'process',
            tips: '设置当前步骤的状态'
        },
        'finish-status': {
            type: 'string',
            options: ['wait', 'process', 'finish', 'error', 'success'],
            val: 'finish',
            tips: '设置结束步骤的状态'
        },
        'align-center': {
            type: 'boolean',
            val: false,
            tips: '进行居中对齐'
        },
        simple: {
            type: 'boolean',
            val: false,
            tips: '是否应用简洁风格'
        }
    },
    slots: {
        default: {
            name: ['el-step'],
            type: ['list', 'remote'],
            displayName: '可选项',
            tips: '值需要是数组，且每个元素需要含有title字段',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'title', label: '名称', tips: '从数据中获取名称的字段key，不填取 title 字段' },
                { id: 'icon', label: '图标', tips: '从数据中获取图标的字段key，不填取 icon 字段' },
                { id: 'description', label: '描述', tips: '从数据中获取描述的字段key，不填取 description 字段' }
            ],
            val: [
                { title: '步骤 1', icon: 'el-icon-edit', description: '' },
                { title: '步骤 2', icon: 'el-icon-upload', description: '' },
                { title: '步骤 3', icon: 'el-icon-picture', description: '' }
            ]
        }
    }
}
