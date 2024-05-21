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
    name: 'form',
    type: 'widget-form',
    displayName: '表单容器',
    icon: 'bk-drag-form',
    group: '表单',
    order: 0,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/form',
    styles: [
        'position',
        {
            name: 'size',
            exclude: ['height', 'maxHeight', 'minHeight']
        },
        'margin',
        'background',
        'border',
        'pointer',
        'opacity'
    ],
    envets: [
        {
            name: 'submit',
            tips: '提交时触发该回调函数'
        }
    ],
    props: {
        model: {
            type: 'object',
            val: {},
            displayName: '表单数据',
            tips: '配置表单项自动生成，不支持编辑'
        },
        ref: {
            type: 'string',
            val: 'form',
            displayName: '设置获取表单的引用',
            tips: '表单的ref标识，如当值为form时，this.$refs.form可选中当前表单，可用来表单校验等，当页面内含有多个表单时请保证ref唯一'
        },
        'form-type': {
            type: 'string',
            options: ['default', 'vertical'],
            val: 'default',
            displayName: '设置表单布局类型'
        },
        'label-width': {
            type: ['string', 'number'],
            val: '150',
            displayName: '表单项标签宽度',
            tips: '表单域标签的宽度'

        },
        'label-position': {
            type: 'string',
            options: ['left', 'center', 'right'],
            val: 'right',
            displayName: '表单域标签的位置',
            tips: '表单域标签的位置'
        }
    },
    slots: {
        default: []
    }
}
