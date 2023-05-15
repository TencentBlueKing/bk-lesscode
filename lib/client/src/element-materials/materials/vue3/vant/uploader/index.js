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
    name: 'van-uploader',
    type: 'van-uploader',
    displayName: '文件上传',
    icon: 'bk-drag-upload',
    group: '表单',
    document: 'https://vant-contrib.gitee.io/vant/#/zh-CN/uploader',
    order: 1,
    events: [
        {
            name: 'oversize',
            tips: '文件大小超过限制时触发，事件回调参数 (file: Object, detail: Object)'
        },
        {
            name: 'click-upload',
            tips: '点击上传区域时触发，事件回调参数 (event: MouseEvent)'
        },
        {
            name: 'click-preview',
            tips: '点击预览图时触发，事件回调参数 (file: Object, detail: Object)'
        },
        {
            name: 'close-preview',
            tips: '关闭全屏图片预览时触发'
        },
        {
            name: 'delete',
            tips: '删除文件预览时触发，事件回调参数 (file: Object, detail: Object)'
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
    props: {
        value: {
            type: 'array',
            val: [],
            tips: '已上传的文件列表'
        },
        accept: {
            type: 'string',
            val: 'image/*',
            tips: '允许上传的文件类型'
        },
        name: {
            type: ['string', 'number'],
            val: 'upload_file',
            tips: '标识符，可以在回调函数的第二项参数中获取'
        },
        'preview-size': {
            type: ['string', 'number'],
            val: '80px',
            tips: '预览图和上传区域的尺寸，默认单位为 px'
        },
        'preview-image': {
            type: 'boolean',
            val: true,
            tips: '是否在上传完成后展示预览图'
        },
        'preview-full-image': {
            type: 'boolean',
            val: true,
            tips: '是否在点击预览图后展示全屏图片预览'
        },
        'preview-options': {
            type: 'object',
            val: {},
            tips: '全屏图片预览的配置项，可选值见 ImagePreview'
        },
        multiple: {
            type: 'boolean',
            val: false,
            tips: '是否开启图片多选，部分安卓机型不支持'
        },
        disabled: {
            type: 'boolean',
            val: false,
            tips: '是否禁用文件上传'
        },
        readonly: {
            type: 'boolean',
            val: false,
            tips: '是否将上传区域设置为只读状态'
        },
        deletable: {
            type: 'boolean',
            val: true,
            tips: '是否展示删除按钮'
        },
        'show-upload': {
            type: 'boolean',
            val: true,
            tips: '是否展示上传区域'
        },
        'lazy-load': {
            type: 'boolean',
            val: false,
            tips: '是否开启图片懒加载，须配合 Lazyload 组件使用'
        },
        capture: {
            type: 'string',
            val: '',
            tips: '图片选取模式，可选值为 camera (直接调起摄像头)'
        },
        'after-read': {
            type: 'function',
            val: () => {},
            tips: '文件读取完成后的回调函数'
        },
        'before-read': {
            type: 'function',
            val: () => {},
            tips: '文件读取前的回调函数，返回 false 可终止文件读取，支持返回 Promise'
        },
        'before-delete': {
            type: 'function',
            val: () => {},
            tips: '文件删除前的回调函数，返回 false 可终止文件读取，支持返回 Promise'
        },
        'max-size': {
            type: 'function',
            val: () => true,
            tips: '文件大小限制，单位为 byte'
        },
        'max-count': {
            type: ['string', 'number'],
            val: '',
            tips: '文件上传数量限制'
        },
        'result-type': {
            type: 'string',
            options: ['dataUrl', 'file', 'text'],
            val: 'dataUrl',
            tips: '文件读取结果类型，可选值为 file text'
        },
        'upload-text': {
            type: 'string',
            val: '',
            tips: '上传区域文字提示'
        },
        'image-fit': {
            type: 'string',
            val: 'cover',
            tips: '预览图裁剪模式，可选值见 Image 组件'
        },
        'upload-icon': {
            type: 'van-icon',
            val: 'photograph',
            tips: '上传区域图标名称或图片链接，等同于 Icon 组件的 name 属性'
        }
    },
    slots: {
        'default': {
            name: ['html'],
            type: ['html'],
            displayName: '自定义上传区域',
            val: '自定义上传区域'
        },
        'preview-delete': {
            name: ['html'],
            type: ['html'],
            displayName: '自定义删除按钮',
            val: '自定义删除按钮'
        },
        'preview-cover': {
            name: ['html'],
            type: ['html'],
            displayName: '自定义覆盖在预览区域上方的内容',
            val: '自定义覆盖在预览区域上方的内容'
        }
    }
}
