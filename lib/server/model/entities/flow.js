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

@Entity({ name: 'flow', comment: 'nocode对应表单' })
export default class extends Base {
    // 流程名称
    @Column({ type: 'varchar', length: 50 })
    flowName

    // 关联itsm流程id
    @Column({ type: 'int' })
    itsmId

    // 第一个表单节点json
    @Column({ type: 'longtext' })
    content

    // 节点对应表单
    @Column({ type: 'tinytext' })
    formIds

    // 流程管理页ids
    @Column({ type: 'varchar', length: 255 })
    managePageIds

    // 对应流程表单id
    @Column({ type: 'int' })
    pageId

    // 应用id
    @Column({ type: 'int' })
    projectId

    // versionId
    @Column({ type: 'int' })
    versionId

    // 备注
    @Column({ type: 'varchar', length: 255 })
    summary
}
