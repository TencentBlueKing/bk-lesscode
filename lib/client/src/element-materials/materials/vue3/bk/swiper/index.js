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

const urlPrefix = 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/example'

const exmapleFirstImgUrl = urlPrefix + '/static/images/firstswiper.jpg'
const exmapleSecondImgUrl = urlPrefix + '/static/images/secondswiper.jpg'

export default {
    name: 'swiper',
    type: 'bk-swiper',
    displayName: '轮播图',
    icon: 'bk-drag-swiper',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/swiper',
    events: [
        {
            name: 'index-change',
            tips: '轮播索引发生变化时回调函数，事件回调参数 (index: Number)'
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
        width: '600px',
        height: '300px'
    },
    directives: [
        // {
        //     type: 'v-bind',
        //     prop: 'pics',
        //     format: 'variable',
        //     valueTypeInclude: ['array']
        // }
    ],
    props: {
        isLoop: {
            type: 'boolean',
            val: true,
            tips: '是否自动轮询'
        },
        loopTime: {
            type: 'number',
            val: 8000,
            tips: '自动轮询间隔时间'
        },
        pics: {
            type: ['srcset', 'remote'],
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
                const errData = data.find((item) => !item.hasOwnProperty('url'))
                if (errData) return '返回值每个元素需要含有url字段'
            },
            tips: '图片列表，[{ link: String, url: String, color: String, class: String }]',
            val: [
                { url: exmapleFirstImgUrl },
                { url: exmapleSecondImgUrl }
            ]
        },
        height: {
            type: 'number',
            val: 300,
            tips: '轮播图高度，如果不传将使用父元素高度'
        },
        width: {
            type: 'number',
            val: 600,
            tips: '轮播图宽度，如果不传将使用父元素宽度'
        },
        list: {
            type: 'array',
            val: [],
            tips: '数据列表，配合 slot 使用'
        }
    }
}
