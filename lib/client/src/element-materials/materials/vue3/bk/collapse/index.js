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
    name: 'collapse',
    type: 'bk-collapse',
    displayName: '折叠面板',
    icon: 'bk-drag-collapse',
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/collapse',
    group: '数据',
    order: 1,
    events: [
        { name: 'item-click', tips: '点击时触发，回调参数为点击的面板对象 (item)' },
        { name: 'after-leave', tips: '动画结束后' },
        { name: 'before-enter', tips: '动画开始前' },
        { name: 'change', tips: '点击时触发，回调参数为点击的面板对象 (item)' }
    ],
    styles: ['position', 'size', 'margin', 'pointer', 'opacity'],
    props: {
        list: {
            type: 'array',
            val: [],
            tips: '配置面板列表数据'
        },
        modelValue: {
            type: 'array',
            val: [],
            optins: ['array', 'number'],
            tips: '当前激活面板的key',
            directive: 'v-model'
        },
        titleField: {
            type: 'string',
            val: 'name',
            tips: '面板标题key值'
        },
        contentField: {
            type: 'string',
            val: 'content',
            tips: '面板内容key值'
        },
        accordion: {
            type: 'boolean',
            val: false,
            tips: '是否使用手风琴效果'
        },
        slots: {
            // 增加插槽
            name: 'bk-collapse-panel',
            type: 'collapse',
            val: [
                { name: 'collapse' }
            ]
        }
    }
}
