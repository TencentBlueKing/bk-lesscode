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
    name: 'upload',
    type: 'bk-upload',
    displayName: '文件上传',
    icon: 'bk-drag-upload',
    group: '表单',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/upload',
    events: [
        {
            name: 'done',
            tips: '所有文件上传完毕后的事件，事件回调参数 (fileList: Array)'
        },
        {
            name: 'progress',
            tips: '文件上传进行时的事件，事件回调参数 (event: Event, file: Object, fileList: Array)'
        },
        {
            name: 'success',
            tips: '文件上传成功后的事件，事件回调参数 (file: Object, fileList: Array)'
        },
        {
            name: 'error',
            tips: '文件上传失败后的事件，事件回调参数 (file: Object, fileList: Array)'
        },
        {
            name: 'exceed',
            tips: '文件上传个数超出限制后的事件，事件回调参数 (file: Object, fileList: Array)'
        },
        {
            name: 'delete',
            tips: '文件上传成功后，点击删除文件触发的事件，事件回调参数 (file: Object, fileList: Array)'
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
        theme: {
            type: 'string',
            val: 'draggable',
            options: ['draggable', 'picture', 'vutton'],
            displayName: '上传组件类型',
            tips: '上传组件类型'
        },
        accept: {
            type: 'string',
            val: '',
            displayName: '接受的文件类型',
            tips: '可选的文件类型。theme为 picture 时且 accept 没有配置时，可接受文件文类型为："image/png,image/jpeg,image/jpg"'
        },
        url: {
            type: 'string',
            val: '',
            displayName: '服务地址',
            tips: '服务器地址（必传）'
        },
        'handle-res-code': {
            type: 'function',
            displayName: '处理返回码的函数',
            tips: '处理返回码的函数，默认参数 response，需要返回 true 或 false',
            val: ''
        },
        'form-data-attributes': {
            type: 'array',
            val: [],
            displayName: '自定义上传属性',
            tips: '自定义上传属性'
        },
        // array object
        header: {
            type: ['array', 'object'],
            // type 为数组时才需要 defaultVals 配置
            defaultVals: [[], {}],
            val: [],
            displayName: '请求头设置',
            tips: '请求头 { name: \'\', value: \'\' }'
        },
        name: {
            type: 'string',
            val: 'upload_file',
            displayName: '文件的名字',
            tips: '后台读取文件的 key'
        },
        // Number, Object 限制上传文件体积 { maxFileSize: 1, maxImgSize: 1 }
        size: {
            type: ['number', 'object'],
            defaultVals: [5, {}],
            val: 5,
            displayName: '限制文件大小',
            tips: '限制上传文件体积 { maxFileSize: 1, maxImgSize: 1 }'
        },
        tip: {
            type: 'string',
            displayName: '提示信息',
            tips: '提示信息'
        },
        'delay-time': {
            type: 'number',
            val: 0,
            displayName: '上传完后列表消失时间',
            tips: '上传完毕后列表消失时间'
        },
        multiple: {
            type: 'boolean',
            val: true,
            displayName: '是否支持多选',
            tips: '是否支持多选'
        },
        'with-credentials': {
            type: 'boolean',
            val: false,
            displayName: '是否允许带上cookie',
            tips: '是否允许带上 cookie'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否禁用'
        },
        'auto-upload': {
            type: 'boolean',
            val: true,
            displayName: '是否自动上传',
            tips: '是否自动上传'
        },
        headers: {
            type: 'object',
            val: {},
            displayName: '请求头设置',
            tips: '请求头 { name: \'\', value: \'\' }'
        },
        limit: {
            type: 'number',
            displayName: '限制上传文件个数',
            tips: '限制上传文件个数'
        },
        'custom-request': {
            type: 'function',
            val: '',
            displayName: '自定义上传的实现',
            tips: '覆盖默认的上传行为，自定义上传的实现'
        },
        'before-upload': {
            type: 'function',
            val: '',
            displayName: '上传文件前校验',
            tips: '上传文件之前的钩子，参数为上传的文件，若返回false或者返回 Promise 且被 reject，则停止上传'
        },
        'before-remove': {
            type: 'function',
            val: '',
            displayName: '删除文件后校验',
            tips: '删除文件之前的钩子，参数为上传的文件和文件列表， 若返回 false 或者返回 Promise 且被 reject，则停止删除'
        },
        'slice-upload': {
            type: 'boolean',
            val: false,
            displayName: '是否采用大文件分片上传',
            tips: '是否采用大文件分片上传'
        },
        'slice-url': {
            type: 'string',
            val: '',
            displayName: '分片上传服务器路径',
            tips: '分片上传chunk服务器路径'
        },
        'merge-url': {
            type: 'string',
            val: '',
            displayName: '分片上传合并服务器路径',
            tips: '分片上传合并chunk服务器路径'
        },
        'chunk-size': {
            type: 'number',
            val: 10,
            displayName: '分片大小',
            tips: '分片大小'
        }
    }
}
