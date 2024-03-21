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
    name: 'bk-lucky-canvas',
    type: 'bk-lucky-canvas',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-navbar',
    displayName: '抽奖',
    group: '反馈',
    events: [
        { name: 'start', tips: '点击抽奖的回调' },
        { name: 'end', tips: '抽奖结束回调' }
    ],
    styles: [],
    renderStyles: {
    },
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    props: {
        'size': {
            'type': 'number',
            'val': '200',
            'tips': '组件大小'
        },
        'blocks': {
            'type': 'array',
            'val': [{ padding: '8px', background: '#FF7569' }],
            'tips': '背景区域的配置，注意是数组，且其永远是个圆形区域'
        },
        'duration': {
            'type': 'number',
            'val': '3000',
            'tips': '抽奖的持续时间，单位毫秒'
        },
        'accelerationTime': {
            'type': 'number',
            'val': '2500',
            'tips': '抽奖开始的加速时间，单位毫秒'
        },
        'decelerationTime': {
            'type': 'number',
            'val': '2500',
            'tips': '抽奖结束的减速时间，单位毫秒'
        },
        'prizes': {
            'type': 'array',
            'val': [
                {
                    background: '#ffffff',
                    fonts: [{ fontSize: '16px', top: '7%', text: '5888元', fontColor: '#91322A' }],
                    imgs: [{ src: 'https://pic-bed-1302552283.cos.ap-guangzhou.myqcloud.com/hongbao.png?imageMogr2/format/webp', width: '25%', top: '40%' }],
                    probability: 1
                },
                {
                    background: '#ffe8e9',
                    fonts: [{ fontSize: '16px', top: '7%', text: '谢谢参与', fontColor: '#91322A' }],
                    imgs: [{ src: 'https://pic-bed-1302552283.cos.ap-guangzhou.myqcloud.com/guilian.png?imageMogr2/format/webp', width: '25%', top: '50%' }],
                    probability: 30
                },
                {
                    background: '#ffffff',
                    fonts: [{ fontSize: '16px', top: '7%', text: '3888元', fontColor: '#91322A' }],
                    imgs: [{ src: 'https://pic-bed-1302552283.cos.ap-guangzhou.myqcloud.com/hongbao.png?imageMogr2/format/webp', width: '25%', top: '50%' }],
                    probability: 2
                },
                {
                    background: '#ffe8e9',
                    fonts: [{ fontSize: '16px', top: '7%', text: '谢谢参与', fontColor: '#91322A' }],
                    imgs: [{ src: 'https://pic-bed-1302552283.cos.ap-guangzhou.myqcloud.com/guilian.png?imageMogr2/format/webp', width: '25%', top: '50%' }],
                    probability: 30
                },
                {
                    background: '#ffffff',
                    fonts: [{ fontSize: '16px', top: '7%', text: '1888元', fontColor: '#91322A' }],
                    imgs: [{ src: 'https://pic-bed-1302552283.cos.ap-guangzhou.myqcloud.com/hongbao.png?imageMogr2/format/webp', width: '25%', top: '50%' }],
                    probability: 8
                },
                {
                    background: '#ffe8e9',
                    fonts: [{ fontSize: '16px', top: '7%', text: '谢谢参与', fontColor: '#91322A' }],
                    imgs: [{ src: 'https://pic-bed-1302552283.cos.ap-guangzhou.myqcloud.com/guilian.png?imageMogr2/format/webp', width: '25%', top: '50%' }],
                    probability: 30
                }
            ],
            'tips': '奖品列表，允许的配置字段为 background、fonts、imgs, probability, 其中imgs是数组，元素可配src、top、width和height; probability为中奖概率(单位为%),如果有一个奖品没有填写中奖概率，则忽略该配置，每个中奖概率相同'
        },
        'buttons': {
            'type': 'array',
            'val': [
                {
                    radius: '45%',
                    imgs: [{
                        src: 'https://pic-bed-1302552283.cos.ap-guangzhou.myqcloud.com/point.png?imageMogr2/format/webp',
                        width: '100%',
                        top: '-130%'
                    }]
                }
                // { radius: '40%', background: '#617df2' },
                // { radius: '35%', background: '#afc8ff' },
                // {
                //     radius: '30%',
                //     background: '#869cfa',
                //     pointer: true,
                //     fonts: [{ text: '开始', top: '-10px' }]
                // }
            ],
            'tips': '抽奖按钮'
        }
    }
}
