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
    name: 'van-grid',
    type: 'van-grid',
    displayName: '宫格',
    icon: 'bk-drag-kapian',
    group: '布局',
    order: 1,
    document: 'https://vant-ui.github.io/vant/#/zh-CN/grid',
    events: [
        {
            name: 'click',
            tips: '点击时触发，事件回调参数 (event: Event)'
        }
    ],
    styles: [
        'position',
        'margin'
    ],
    directives: [],
    props: {
        'column-num': {
            'type': 'number',
            'val': 4,
            'tips': '列数'
        },
        'icon-size': {
            'type': ['number', 'string'],
            'val': '28',
            'tips': '图标大小，默认单位为px'
        },
        'gutter': {
            'type': ['number', 'string'],
            'val': 0,
            'tips': '格子之间的间距，默认单位为px'
        },
        'border': {
            'type': 'boolean',
            'val': true,
            'tips': '是否显示边框'
        },
        'center': {
            'type': 'boolean',
            'val': true,
            'tips': '是否将格子内容居中显示'
        },
        'square': {
            'type': 'boolean',
            'val': false,
            'tips': '是否将格子固定为正方形'
        }
    },
    slots: {
        default: {
            name: ['van-grid-item'],
            type: ['list', 'remote'],
            displayName: '可选项',
            tips: '默认插槽，icon为自定义图标的名称，text为自定义文字的内容',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'text', label: '文字', tips: '自定义文字内容' },
                { id: 'icon', label: '自定义icon', tips: '图标名称或图片链接' }
            ],
            val: [
                { text: '文字1', icon: 'photo-o' },
                { text: '文字2', icon: 'photo-o' },
                { text: '文字3', icon: 'photo-o' },
                { text: '文字4', icon: 'photo-o' }
            ]
        }
    }
}
