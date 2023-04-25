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

import { animationEffects } from '../common'

export default {
    name: 'paragraph',
    type: 'p',
    displayName: '段落',
    icon: 'bk-drag-text',
    group: '基础',
    order: 1,
    styles: ['size', 'margin', 'display', 'font', 'backgroundColor', 'textAlign'],
    renderStyles: {
        display: 'inline-block',
        textAlign: 'left',
        fontSize: '28rpx',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
    },
    directives: [
        {
            type: 'v-html',
            prop: 'slots',
            format: 'variable',
            valueTypeInclude: ['string'],
            tips () {
                return '内容直接作为普通 HTML 插入，Vue 模板语法不会被解析'
            }
        }
    ],
    props: {
        title: {
            type: 'string',
            val: '',
            tips: '文字描述，hover 时会浮现提示内容'
        },
        'swiper-animate-effect': {
            type: 'string',
            options: animationEffects,
            tips: '动画名称'
        },
        'swiper-animate-duration': {
            type: 'string',
            tips: '动画持续时间，单位为s'
        },
        'swiper-animate-delay': {
            type: 'string',
            tips: '动画延迟，单位为s'
        }
    },
    slots: {
        default: {
            name: ['text'],
            type: ['textarea'],
            displayName: '文本',
            regExp: /\S/,
            val: '默认段落文字',
            regErrorText: '文本不能为空'
        }
    }
}
