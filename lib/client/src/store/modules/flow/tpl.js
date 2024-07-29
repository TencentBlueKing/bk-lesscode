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
import http from '@/api'

const prefix = '/flow'

export default {
    namespaced: true,
    state: {},
    mutations: {},
    getters: {},
    actions: {
        // 获取项目下流程列表
        getTplList ({ state }, params) {
            return http.get(`${prefix}/tpl`, { params }).then(response => response.data)
        },
        // 创建流程
        createFlowTpl ({ state }, params) {
            return http.post(`${prefix}/tpl`, params).then(response => response.data)
        },
        // 编辑流程信息
        updateFlowTpl ({ state }, params) {
            return http.put(`${prefix}/tpl`, params).then(response => response.data)
        },
        // 获取流程详情
        getTplDetail ({ state }, id) {
            return http.get(`${prefix}/tpl/${id}`).then(response => response.data)
        },
        // 归档/恢复
        archiveFlowTpl ({ state }, params) {
            return http.put(`${prefix}/archive`, params).then(response => response.data)
        },
        // 部署流程
        deployFlow ({ state }, id) {
            return http.post(`${prefix}/serviceDeploy`, { id }, { globalError: false }).then(response => response.data)
        },
        // 新增节点
        createNode ({ state }, { id, data }) {
            return http.post(`${prefix}/tpl/${id}/node`, { data }).then(response => response.data)
        },
        // 更新节点
        updateNode ({ state }, { id, data }) {
            return http.put(`${prefix}/tpl/${id}/node/${data.id}`, { data }).then(response => response.data)
        },
        // 删除节点
        deleteNode ({ state }, { id, nodeId }) {
            return http.delete(`${prefix}/tpl/${id}/node/${nodeId}`).then(response => response.data)
        },
        // 新增边
        createEdge ({ state }, { id, data }) {
            return http.post(`${prefix}/tpl/${id}/edge`, { data }).then(response => response.data)
        },
        // 批量删除边
        deleteEdges ({ state }, { id, edgeIds }) {
            return http.post(`${prefix}/tpl/${id}/batchDeleteEdge`, { edgeIds }).then(response => response.data)
        }
    }
}
