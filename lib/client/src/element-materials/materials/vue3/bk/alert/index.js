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
    name: 'alert',
    type: 'bk-alert',
    displayName: '警告',
    icon: 'bk-drag-alert-line',
    group: '反馈',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/alert',
    events: [
        {
            name: 'close',
            tips: '关闭警告时调用该事件函数，事件回调参数 (event: Event)'
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
        display: 'block',
        verticalAlign: 'middle'
    },
    props: {
        theme: {
            type: 'string',
            val: 'info',
            tips: '主题',
            options: ['info', 'success', 'warning', 'error']
        },
        // size: {
        //     type: 'string',
        //     val: 'default',
        //     options: ['small', 'default', 'large'],
        //     tips: '警告尺寸'
        // },
        title: {
            type: 'string',
            val: '警告标题',
            tips: '标题'
        },
        closable: {
            type: 'boolean',
            val: false,
            tips: '是否可以关闭'
        },
        'show-icon': {
            type: 'boolean',
            val: true,
            tips: '是否显示按钮'
        },
        'close-text': {
            type: 'string',
            val: '',
            tips: '自定义关闭按钮'
        }
    }
}
