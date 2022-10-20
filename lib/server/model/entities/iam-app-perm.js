/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { Entity, Column } from 'typeorm'
import Base from './base'

 @Entity({ name: 'iam_app_perm', comment: '应用权限模型-系统资源类型实例视图表' })
export default class extends Base {
    // 应用id
    @Column({ type: 'int' })
    projectId

    // 注册到权限中心的系统 id
    @Column({ type: 'varchar', length: 50 })
    systemId

    // 注册到权限中心的系统名称
    @Column({ type: 'varchar', length: 510 })
    systemName

    // 注册到权限中心的系统名称英文
    @Column({ type: 'varchar', length: 510 })
    systemNameEn

    // 注册到权限中心的系统描述
    @Column({ type: 'varchar', length: 510 })
    systemDesc

    // 注册到权限中心的系统描述英文
    @Column({ type: 'varchar', length: 510 })
    systemDescEn

    // 有权限调用的客户端，即有权限调用的 app_code 列表
    @Column({ type: 'varchar', length: 510 })
    systemClients

    // 权限中心回调接入系统的配置文件
    @Column({ type: 'json' })
    systemProviderConfig

    // 是否部署到权限中心，0 为未部署，1 为已部署
    @Column({ type: 'int' })
    deployed

    // 注册到权限中心的资源类型 id
    @Column({ type: 'varchar', length: 50 })
    resourceTypeId

    // 注册到权限中心的资源类型名称
    @Column({ type: 'varchar', length: 510 })
    resourceTypeName

    // 注册到权限中心的资源类型名称英文
    @Column({ type: 'varchar', length: 510 })
    resourceTypeNameEn

    // 注册到权限中心的资源类型描述
    @Column({ type: 'varchar', length: 510 })
    resourceTypeDesc

    // 注册到权限中心的资源类型描述英文
    @Column({ type: 'varchar', length: 510 })
    resourceTypeDescEn

    // 权限中心回调接入资源类型的配置文件
    @Column({ type: 'json' })
    resourceTypeProviderConfig

    // 注册到权限中心的实例视图 id
    @Column({ type: 'varchar', length: 50 })
    instanceSelectionId

    // 注册到权限中心的实例视图名称
    @Column({ type: 'varchar', length: 510 })
    instanceSelectionName

    // 注册到权限中心的实例视图名称英文
    @Column({ type: 'varchar', length: 510 })
    instanceSelectionNameEn

    // 注册到权限中心实例视图的资源类型层级链路
    @Column({ type: 'json' })
    instanceSelectionResourceTypeChain
}
