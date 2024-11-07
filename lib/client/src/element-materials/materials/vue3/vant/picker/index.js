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
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/picker',
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
        },
        {
            name: 'click-option',
            tips: '点击选项时触发，事件回调参数 ({ currentOption, selectedValues, selectedOptions, selectedIndexes, columnIndex })'
        },
        {
            name: 'scroll-into',
            tips: '当用户通过点击或拖拽让一个选项滚动到中间的选择区域时触发，事件回调参数 ({ currentOption, columnIndex })'
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
    groups: [
        { label: '值', value: 'value' },
        { label: '数据', value: 'data' },
        { label: '标签', value: 'label' },
        { label: '提示', value: 'tip' },
        { label: '顶部栏', value: 'toolbar' },
        { label: '按钮', value: 'button' },
        { label: '状态', value: 'state' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'component-type': {
            type: 'hidden',
            val: 'van-picker'
        },
        label: {
            type: 'string',
            val: '城市',
            displayName: '左侧标签名称',
            tips: '左侧的label名称',
            belongGroup: 'label'
        },
        placeholder: {
            type: 'string',
            val: '请选择城市',
            displayName: '空值时提示文案',
            tips: 'cell的placeholder',
            belongGroup: 'tip'
        },
        value: {
            type: 'array',
            val: ['Shenzhen'],
            directive: 'v-model',
            disableVariableType: ['expression'], // 不兼容的类型
            displayName: '选中的值',
            belongGroup: 'value'
        },
        columns: {
            type: 'array',
            val: [
                { text: '杭州', value: 'Hangzhou', disabled: true },
                { text: '宁波', value: 'Ningbo' },
                { text: '温州', value: 'Wenzhou' },
                { text: '深圳', value: 'Shenzhen' }
            ],
            displayName: '可选数据集合',
            tips: '对象数组，配置每一列显示的数据',
            belongGroup: 'data'
        },
        title: {
            type: 'string',
            val: '',
            displayName: '顶部栏标题',
            tips: '顶部栏标题',
            belongGroup: 'toolbar'
        },
        // 'columns-field-names': {
        //     type: 'object',
        //     val: { text: 'text', value: 'value', children: 'children' },
        //     tips: '自定义 columns 结构中的字段'
        // },
        'confirm-button-text': {
            type: 'string',
            val: '确认',
            displayName: '确认按钮文字',
            tips: '确认按钮文字',
            belongGroup: 'button'
        },
        'cancel-button-text': {
            type: 'string',
            val: '取消',
            displayName: '取消按钮文字',
            tips: '取消按钮文字',
            belongGroup: 'button'
        },
        'toolbar-position': {
            type: 'string',
            val: 'top',
            options: ['top', 'bottom'],
            displayName: '顶部栏位置',
            tips: '顶部栏位置',
            belongGroup: 'toolbar'
        },
        loading: {
            type: 'boolean',
            val: false,
            displayName: '是否加载中状态',
            tips: '是否显示加载状态',
            belongGroup: 'state'
        },
        'show-toolbar': {
            type: 'boolean',
            val: true,
            displayName: '是否显示顶部栏',
            tips: '是否显示顶部栏',
            belongGroup: 'toolbar'
        },
        'allow-html': {
            type: 'boolean',
            val: false,
            displayName: '选项内容是否支持HTML',
            tips: '是否允许选项内容中渲染 HTML',
            belongGroup: 'other'
        },
        'option-height': {
            type: ['number', 'string'],
            val: 44,
            displayName: '选项高度',
            tips: '选项高度，支持 px vw vh rem 单位，默认 px',
            belongGroup: 'style'
        },
        'visible-item-count': {
            type: ['number', 'string'],
            val: 6,
            displayName: '显示选项的个数',
            tips: '可见的选项个数',
            belongGroup: 'other'
        },
        'swipe-duration': {
            type: ['number', 'string'],
            val: 1000,
            displayName: '惯性滚动时长',
            tips: '快速滑动时惯性滚动的时长，单位ms',
            belongGroup: 'other'
        }
    }
}
