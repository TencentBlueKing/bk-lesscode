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
    name: 'card',
    type: 'bk-card',
    displayName: '卡片',
    icon: 'bk-drag-card',
    group: '反馈',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/card',
    events: [
        {
            name: 'update:collapseStatus',
            tips: '卡片展开状态改变时调用该事件函数，事件回调参数 (event: Event)'
        },
        {
            name: 'edit',
            tips: '编辑标题时调用该事件函数，事件回调参数 (event: Event)'
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
        width: '320px',
        display: 'inline-block',
        verticalAlign: 'middle'
    },
    props: {
        title: {
            type: 'string',
            val: '卡片标题',
            tips: '卡片标题'
        },
        isCollapse: {
            type: 'boolean',
            val: false,
            tips: '是否支持展开收起'
        },
        collapseStatus: {
            type: 'boolean',
            val: true,
            tips: '展开&收起状态'
        },
        position: {
            type: 'string',
            val: 'left',
            options: ['left', 'right'],
            tips: '展开icon的显示位置'
        },
        showHeader: {
            type: 'boolean',
            val: true,
            tips: '是否显示头部'
        },
        showFooter: {
            type: 'boolean',
            val: false,
            tips: '是否显示底部'
        },
        isEdit: {
            type: 'boolean',
            val: false,
            tips: '是否启用编辑标题功能'
        },
        border: {
            type: 'boolean',
            val: true,
            tips: '是否显示边框'
        },
        disableHeaderStyle: {
            type: 'boolean',
            val: false,
            tips: '是否禁用Header的line-height默认样式'
        }
    },
    slots: {
        default: {
            name: ['layout'],
            type: ['render-block'],
            renderStyles: {
                'height': '200px',
                'margin': '20px 0'
            }
        }
    }
}
