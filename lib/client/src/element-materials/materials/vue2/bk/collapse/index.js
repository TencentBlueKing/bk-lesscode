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
    name: 'collapse',
    type: 'bk-collapse',
    displayName: '折叠面板',
    icon: 'bk-drag-collapse',
    group: '数据',
    order: 1,
    events: [{ name: 'item-click', tips: '点击时调用该事件函数，事件回调参数 (names: Array)' }],
    styles: ['position', 'size', 'margin', 'pointer', 'opacity'],
    props: {
        'active-name': {
            type: ['array', 'string'],
            val: '',
            displayName: '当前激活面板的name',
            tips: '当前激活面板的 name',
            modifiers: ['sync']
        },
        accordion: {
            type: 'boolean',
            val: false,
            displayName: '是否使用手风琴效果',
            tips: '是否使用手风琴效果'
        }
    },
    slots: {
        default: {
            name: ['bk-collapse-item'],
            type: ['list', 'remote'],
            displayName: '面板项配置',
            tips: '默认插槽，填写的数据需要是数组且每个元素需包含name字段、label字段、content字段',
            remoteValidate (data) {
                if (!Array.isArray(data)) return '返回值需要是数组'
            },
            keys: [
                { id: 'name', label: '唯一标识符', tips: '唯一标识符，相当于 ID，不填取index' },
                { id: 'label', label: '面板标题', tips: '面板项展示标题，不填取 label字段' },
                { id: 'content', label: '面板标题', tips: '面板项展示标题，不填取 content字段' }
            ],
            val: [
                { name: '1', label: '方案成熟', content: '拥有支撑数百款腾讯业务的经验沉淀，兼容各种复杂的系统架构，生于运维 · 精于运维;' },
                { name: '2', label: '覆盖全面', content: '从配置管理，到作业执行、任务调度和监控自愈，再通过运维大数据分析辅助运营决策，全方位覆盖业务运营的全周期保障管理。' },
                { name: '3', label: '开放平台', content: '开放的PaaS，具备强大的开发框架和调度引擎，以及完整的运维开发培训体系，助力运维快速转型升级。' }
            ]
        }
    }
}
