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
    name: 'link',
    type: 'bk-link',
    displayName: '文字链接',
    icon: 'bk-drag-link1',
    group: '基础',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/link',
    events: [
        {
            name: 'click',
            tips: '文字链接点击时调用该事件函数，事件回调参数 (event: Event)'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            exclude: ['height', 'maxHeight', 'minHeight']
        },
        'margin',
        'padding',
        'border',
        'pointer',
        {
            name: 'background',
            include: ['backgroundColor']
        },
        'opacity',
        'font'
    ],
    renderStyles: {
        display: 'inline-block',
        textAlign: 'center',
        verticalAlign: 'middle'
    },
    props: {
        theme: {
            type: 'string',
            val: 'default',
            options: ['default', 'primary', 'success', 'warning', 'danger'],
            tips: '链接类型、主题'
        },
        href: {
            type: 'src',
            val: '',
            tips: '链接跳转地址'
        },
        target: {
            type: 'string',
            val: '_self',
            options: [
                '_self',
                '_blank',
                '_parent',
                '_top'
            ],
            tips: '链接打开方式，常用为_blank:新窗口打开, _self:当前窗口打开'
        },
        underline: {
            type: 'boolean',
            val: false,
            tips: '是否显示下划线'
        }
    },
    slots: {
        default: {
            name: ['html'],
            type: ['text'],
            displayName: '文本',
            val: '文字链接'
        }
    }
}
