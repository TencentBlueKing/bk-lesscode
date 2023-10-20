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
    name: 'process',
    type: 'bk-process',
    displayName: '步骤_process',
    icon: 'bk-drag-process',
    group: '导航',
    order: 1,
    document: 'https://magicbox.bk.tencent.com/magicbox/3.0/process',
    events: [
        {
            name: 'click',
            tips: '当前步骤变化时的回调，事件回调参数 (curProcess: Number, data: Object)'
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
        list: {
            type: ['array', 'remote'],
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            val: [{
                content: '创建应用'
            },
            {
                content: '完善资料'
            },
            {
                content: '下载代码'
            },
            {
                content: '测试部署'
            },
            {
                content: '开发完成'
            }],
            tips: 'process数据源，类型为数组'
        },
        'display-key': {
            type: 'value-key-item',
            dataOrigin: 'list',
            val: 'content',
            tips: '循环list时，显示字段的key值（必传）'
        },
        'cur-process': {
            type: 'number',
            val: 0,
            tips: '当前步骤的索引值，支持 .sync 修饰符',
            regExp: /^(0|[1-9][0-9]*)$/,
            regErrorText: '请输入大于等于0的整数',
            directive: 'v-model'
        },
        controllable: {
            type: 'boolean',
            val: false,
            tips: '步骤可否被控制前后跳转'
        }
        // showSteps: {
        //     type: 'boolean',
        //     val: false,
        //     tips: '是否显示子步骤操作按钮'
        // }
    }
}
