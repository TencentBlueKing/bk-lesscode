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

 @Entity({ name: 'iam_app_perm_action', comment: '应用权限模型' })
export default class extends Base {
    // 应用权限模型-系统资源类型实例视图表 id
    @Column({ type: 'int' })
    iamAppPermId

    // 应用 id
    @Column({ type: 'int' })
    projectId

    // 操作 id
    @Column({ type: 'varchar', length: 50 })
    actionId

    // 操作名称
    @Column({ type: 'varchar', length: 510 })
    actionName

    // 操作名称英文
    @Column({ type: 'varchar', length: 510 })
    actionNameEn

    // 操作描述
    @Column({ type: 'varchar', length: 510 })
    actionDesc

    // 操作描述英文
    @Column({ type: 'varchar', length: 510 })
    actionDescEn

    // 操作类型
    @Column({ type: 'varchar', length: 50 })
    actionType

    // 关联资源id
    @Column({ type: 'json' })
    actionRelatedResourceId

    // 注册到权限中心的状态：0 为未注册；1 为已注册；-1 为已注册到权限中心但在 lesscode 中被删除的状态，当部署到权限中心后，-1 状态的操作会被真正删除
    @Column({ type: 'int' })
    registeredStatus

    // 页面组件引用记录
    @Column({ type: 'json' })
    pageComponentRef
}
