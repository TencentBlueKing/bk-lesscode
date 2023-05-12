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
    name: 'backtop',
    type: 'bk-backtop',
    displayName: '返回顶部',
    order: 1,
    icon: 'bk-drag-grid',
    group: '基础',
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
    props: {
        visibilityHeight: {
            type: 'number',
            val: 200,
            tips: '高度'
        },
        target: {
            type: 'string',
            val: '',
            tips: '触发滚动的对象'
        },
        right: {
            type: 'number',
            val: 40,
            tips: '控制其显示位置, 距离页面右边距'
        },
        bottom: {
            type: 'number',
            val: 40,
            tips: '控制其显示位置, 距离页面底部边距'
        }
    }
}
