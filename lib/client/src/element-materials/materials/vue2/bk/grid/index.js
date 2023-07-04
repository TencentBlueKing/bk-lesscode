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
    name: 'grid',
    type: 'render-grid',
    displayName: '多列',
    icon: 'bk-drag-lie-2',
    group: '布局',
    order: 2,
    styles: [
        'position',
        'size',
        'margin',
        'padding',
        'background',
        'font',
        'opacity',
        'pointer',
        'border'
    ],
    props: {
    },
    slots: {
        default: [
            {
                name: ['layout'],
                type: ['render-column']
            },
            {
                name: ['layout'],
                type: ['render-column']
            }
        ]
    },
    directives: [
        {
            type: 'v-bkloading'
        }
    ]
}
