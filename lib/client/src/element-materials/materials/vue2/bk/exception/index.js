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
    name: 'exception',
    type: 'bk-exception',
    displayName: '异常提示',
    icon: 'bk-drag-exception',
    group: '反馈',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/exception',
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
        display: 'block'
    },
    groups: [
        { label: '类型', value: 'type' },
        { label: '场景', value: 'scene' },
        { label: '样式', value: 'style' }
    ],
    props: {
        type: {
            type: 'string',
            val: '404',
            options: ['403', '404', '500', 'building'],
            displayName: '异常类型',
            tips: '异常类型',
            belongGroup: 'type'
        },
        scene: {
            type: 'string',
            options: ['page', 'part'],
            val: 'page',
            displayName: '使用场景',
            tips: '使用场景',
            belongGroup: 'scene'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-exception上',
            belongGroup: 'style'
        }
    }
}
