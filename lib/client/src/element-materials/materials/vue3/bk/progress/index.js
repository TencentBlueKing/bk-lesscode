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
    name: 'progress',
    type: 'bk-progress',
    displayName: '进度条',
    icon: 'bk-drag-progress',
    group: '数据',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/progress',
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
    props: {
        theme: {
            type: 'string',
            options: ['primary', 'warning', 'success', 'danger'],
            val: 'primary'
        },
        type: {
            type: 'string',
            options: ['line', 'circle', 'dashboard'],
            val: 'line',
            tips: '进度条类型'
        },
        percent: {
            type: 'number',
            val: 0,
            tips: '进度百分比'
        },
        // size: {
        //     type: 'string',
        //     options: ['small', 'normal', 'large'],
        //     val: 'normal'
        // },
        width: {
            type: 'number',
            val: 126,
            tips: '环形/仪表盘进度条大小'
        },
        strokeWidth: {
            type: 'number',
            val: 3,
            tips: '线宽'
        },
        strokeLinecap: {
            type: 'string',
            val: 'round',
            options: ['butt', 'round', 'square', 'inherit'],
            tips: '仪表盘进度路径两端形状'
        },
        textInside: {
            type: 'boolean',
            val: false,
            tips: '线性进度条是否显示文字到进度条内'
        },
        color: {
            type: 'color',
            val: '#13ce66',
            tips: '环形/仪表盘路径颜色'
        },
        bgColor: {
            type: 'color',
            val: '#f5f5f5',
            tips: '环形/仪表盘背景颜色'
        },
        fixed: {
            type: 'number',
            val: 0,
            options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            tips: '精确到小数点位数'
        },
        format: {
            type: 'function',
            tips: '文案过滤回调方法',
            val: (percent) => `${percent}%`
        },
        showText: {
            type: 'boolean',
            val: true,
            tips: '是否显示文案'
        },
        titleStyle: {
            type: 'object',
            val: {
                fontSize: '16px',
                verticalAlign: 'middle'
            },
            tips: '设置文案样式'
        }
    }
}
