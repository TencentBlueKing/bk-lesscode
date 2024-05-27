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
    name: 'widget-van-picker',
    type: 'widget-van-picker',
    // bk-drag-custom-comp-default
    icon: 'bk-drag-picker',
    displayName: '选择器',
    group: '表单',
    document: 'https://vant-contrib.gitee.io/vant/v2/#/zh-CN/picker',
    events: [
        {
            name: 'change',
            tips: '当值变化时调用该事件函数，事件回调参数 (picker: Picker实例)'
        },
        {
            name: 'confirm',
            tips: '点击完成按钮时调用该事件函数，事件回调参数 (value: 当前选中值)'
        },
        {
            name: 'cancel',
            tips: '点击取消按钮时调用该事件函数，事件回调参数 (value: 当前选中值)'
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
    props: {
        'component-type': {
            type: 'hidden',
            val: 'van-picker'
        },
        label: {
            type: 'string',
            val: '城市',
            displayName: '设置左侧标签名称',
            tips: '左侧的label名称'
        },
        placeholder: {
            type: 'string',
            val: '请选择城市',
            displayName: '占位提示文本',
            tips: 'cell的placeholder'
        },
        value: {
            type: 'string',
            val: '深圳',
            directive: 'v-model',
            disableVariableType: ['expression'], // 不兼容的类型
            displayName: '选中的值'
        },
        columns: {
            type: 'array',
            val: ['深圳', '杭州', '宁波', '温州', '绍兴', '湖州', '嘉兴', '金华', '衢州'],
            displayName: '设置可选数据集合',
            tips: '对象数组，配置每一列显示的数据'
        },
        title: {
            type: 'string',
            val: '标题',
            displayName: '设置顶部栏标题',
            tips: '顶部栏标题'
        },
        'confirm-button-text': {
            type: 'string',
            val: '确认',
            displayName: '设置确认按钮文字',
            tips: '确认按钮文字'
        },
        'cancel-button-text': {
            type: 'string',
            val: '取消',
            displayName: '设置取消按钮文字',
            tips: '取消按钮文字'
        },
        'value-key': {
            type: 'string',
            val: '',
            displayName: '唯一标识对应字段',
            tips: '选项对象中，选项文字对应的键名'
        },
        'toolbar-position': {
            type: 'string',
            val: 'top',
            options: ['top', 'bottom'],
            displayName: '设置顶部栏位置',
            tips: '顶部栏位置'
        },
        loading: {
            type: 'boolean',
            val: false,
            displayName: '是否加载中',
            tips: '是否显示加载状态'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            tips: '是否为只读状态，只读状态下无法切换选项'
        },
        'show-toolbar': {
            type: 'boolean',
            val: true,
            displayName: '是否显示顶部栏',
            tips: '是否显示顶部栏'
        },
        'default-index': {
            type: ['number', 'string'],
            val: 0,
            displayName: '设置默认选中索引',
            tips: '单列选择时，默认选中项的索引'
        },
        'item-height': {
            type: ['number', 'string'],
            val: 44,
            displayName: '设置选项高度',
            tips: '选项高度，支持 px vw vh rem 单位，默认 px'
        },
        'visible-item-count': {
            type: ['number', 'string'],
            val: 6,
            displayName: '显示选项的个数',
            tips: '可见的选项个数'
        },
        'swipe-duration': {
            type: ['number', 'string'],
            val: 1000,
            displayName: '惯性滚动时长',
            tips: '快速滑动时惯性滚动的时长，单位ms'
        }
    }
}
