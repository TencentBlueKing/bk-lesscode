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

export default {
    name: 'zoom-image',
    type: 'bk-zoom-image',
    displayName: '缩放图',
    icon: 'bk-drag-swiper',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/zoom-image',
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
    // renderStyles: {
    //     width: '600px',
    //     height: '300px'
    // },
    groups: [
        { label: '图片', value: 'image' },
        { label: '显示', value: 'display' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'src': {
            type: 'src',
            val: exmapleFirstImgUrl,
            displayName: '图片地址',
            tips: '图片地址',
            belongGroup: 'image'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-zoom-image上',
            belongGroup: 'style'
        },
        transfer: {
            type: 'boolean',
            val: true,
            displayName: '预览弹框是否出现在body内',
            tips: '控制图片预览弹框是否出现在body内',
            belongGroup: 'display'
        },
        zIndex: {
            type: 'number',
            val: 2000,
            displayName: '弹窗zIndex值',
            tips: '设置图片预览的弹窗z-index',
            belongGroup: 'style'
        }
    }
}
