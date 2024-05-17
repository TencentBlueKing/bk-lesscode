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
    name: 'van-icon',
    type: 'van-icon',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-icon-2',
    displayName: '图标',
    group: '基础',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/icon',
    events: [
        {
            name: 'click',
            tips: '点击图标时触发，事件回调参数 (e: Event)'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            include: ['display']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        display: 'inline-block'
    },
    props: {
        name: {
            type: 'van-icon',
            val: 'chat-o',
            displayName: '设置图标或图片',
            tips: '图标名称或图片链接'
        },
        dot: {
            type: 'boolean',
            val: false,
            displayName: '图标右上角是否有红点',
            tips: '是否显示图标右上角小红点'
        },
        badge: {
            type: ['string', 'number'],
            val: '',
            displayName: '设置图标右上角内容',
            tips: '图标右上角徽标的内容'
        },
        color: {
            type: 'color',
            val: 'inherit',
            displayName: '设置图标颜色',
            tips: '图标颜色'
        },
        size: {
            type: ['string', 'number'],
            val: 'inherit',
            displayName: '设置图标大小',
            tips: '图标大小，如 20px 2em，默认单位为px'
        },
        'class-prefix': {
            type: 'string',
            val: 'van-icon',
            displayName: '设置类名前缀',
            tips: '类名前缀，用于使用自定义图标'
        },
        'tag': {
            type: 'string',
            val: 'i',
            displayName: '设置根节点html标签名',
            tips: '根节点对应的 HTML 标签名'
        }
    }
}
