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
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/upload',
    events: [
        {
            displayName: '所有文件上传完毕',
            name: 'on-done',
            tips: '所有文件上传完毕后调用该事件函数，事件回调参数 (fileList: Array)'
        },
        {
            displayName: '文件上传进行',
            name: 'on-progress',
            tips: '文件上传进行时调用该事件函数，事件回调参数 (event: Event, file: Object, fileList: Array)'
        },
        {
            displayName: '文件上传成功',
            name: 'on-success',
            tips: '文件上传成功后调用该事件函数，事件回调参数 (file: Object, fileList: Array)'
        },
        {
            displayName: '文件上传失败',
            name: 'on-error',
            tips: '文件上传失败后调用该事件函数，事件回调参数 (file: Object, fileList: Array)'
        },
        {
            displayName: '文件上传个数超出限制',
            name: 'on-exceed',
            tips: '文件上传个数超出限制后调用该事件函数，事件回调参数 (file: Object, fileList: Array)'
        },
        {
            displayName: '文件上传成功后点击删除文件',
            name: 'on-delete',
            tips: '文件上传成功后，点击删除文件时调用该事件函数，事件回调参数 (file: Object, fileList: Array)'
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
    groups: [
        { label: '上传文件信息', value: 'file' },
        { label: '上传接口配置', value: 'uploadInterfaceSet' },
        { label: '响应处理', value: 'response' },
        { label: '提示', value: 'tip' },
        { label: '分片上传设置', value: 'slice' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        accept: {
            type: 'string',
            val: '',
            displayName: '接受的文件类型',
            tips: '可选的文件类型，参考 input 元素的 accept 属性',
            belongGroup: 'file'
        },
        url: {
            type: 'string',
            val: 'https://jsonplaceholder.typicode.com/posts/',
            displayName: '服务地址',
            tips: '上传服务地址',
            belongGroup: 'uploadInterfaceSet'
        },
        'handle-res-code': {
            type: 'function',
            displayName: '处理返回码的函数',
            tips: '处理上传请求返回码的函数，参数为 response，本函数需要返回 true 或 false 来判断是否上传成功',
            val: function (res) {
                if (res && res.code === 0) {
                    return true
                }
                return false
            },
            belongGroup: 'uploadInterfaceSet'
        },
        'form-data-attributes': {
            type: 'array',
            val: [],
            displayName: '自定义上传属性',
            tips: '自定义上传属性，格式为<br>[{ name: \'KEY\', value: \'VALUE\' }, ...]',
            belongGroup: 'uploadInterfaceSet'
        },
        header: {
            type: ['array', 'object'],
            defaultVals: [[], {}],
            val: [],
            displayName: '请求头设置',
            tips: '请求头 { name: " ", value: " " }',
            belongGroup: 'uploadInterfaceSet'
        },
        name: {
            type: 'string',
            val: 'upload_file',
            displayName: '文件的名字',
            tips: '后台读取文件的 key',
            belongGroup: 'file'
        },
        size: {
            type: ['number', 'object'],
            defaultVals: [5, {}],
            val: 5,
            displayName: '限制文件大小',
            tips: '限制上传文件体积 { maxFileSize: 1, maxImgSize: 1 }',
            belongGroup: 'file'
        },
        tip: {
            type: 'string',
            displayName: '提示信息',
            tips: '提示信息',
            belongGroup: 'tip'
        },
        'delay-time': {
            type: 'number',
            val: 0,
            displayName: '上传完后列表消失时间',
            tips: '上传完毕后列表消失时间',
            belongGroup: 'other'
        },
        multiple: {
            type: 'boolean',
            val: true,
            displayName: '是否支持多选',
            tips: '是否支持多选',
            belongGroup: 'other'
        },
        'with-credentials': {
            type: 'boolean',
            val: false,
            displayName: '是否允许带上cookie',
            tips: '是否允许带上 cookie',
            belongGroup: 'uploadInterfaceSet'
        },
        theme: {
            type: 'string',
            options: ['draggable', 'button', 'picture'],
            val: 'draggable',
            displayName: '上传组件类型',
            tips: '上传组件类型',
            belongGroup: 'style'
        },
        limit: {
            type: 'number',
            displayName: '限制上传文件个数',
            tips: '限制上传文件个数',
            belongGroup: 'file'
        },
        // validateName: {
        //     type: 'regexp',
        //     displayName: '用来验证文件名是否合法的',
        //     tips: '用来验证文件名是否合法的'
        // },
        customRequest: {
            type: 'function',
            displayName: '默认的上传行为',
            tips: '覆盖默认的上传行为，自定义上传的实现',
            belongGroup: 'other'
        },
        extCls: {
            type: 'string',
            displayName: '最外层元素的类名',
            tips: '配置自定义样式类名，传入的类会被加在组件最外层的DOM.bk-upload上',
            belongGroup: 'style'
        },
        files: {
            type: 'array',
            displayName: '默认图片',
            tips: '默认图片',
            belongGroup: 'file'
        },
        sliceUpload: {
            type: 'boolean',
            val: false,
            displayName: '是否采用大文件分片上传',
            tips: '是否采用大文件分片上传',
            belongGroup: 'slice'
        },
        sliceUrl: {
            type: 'string',
            displayName: '分片上传chunk服务器路径',
            tips: '分片上传chunk服务器路径',
            belongGroup: 'slice'
        },
        mergeUrl: {
            type: 'string',
            displayName: '分片上传合并chunk服务器路径',
            tips: '分片上传合并chunk服务器路径',
            belongGroup: 'slice'
        },
        chunkSize: {
            type: 'number',
            val: 10,
            displayName: '分片大小',
            tips: '分片大小',
            belongGroup: 'slice'
        }
    }
}
