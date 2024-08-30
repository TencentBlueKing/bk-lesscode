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

@Entity({ name: 'flow_tpl', comment: '应用创建的流程模板' })
export default class extends Base {
    // 流程模板名称
    @Column({ type: 'varchar', length: 100 })
    name

    // 备注
    @Column({ type: 'varchar', length: 255 })
    summary

    // 节点配置
    @Column({ type: 'longtext' })
    nodes

    // 连线配置
    @Column({ type: 'longtext' })
    edges

    // 应用id
    @Column({ type: 'int' })
    projectId

    // 流程是否部署
    @Column({ type: 'int' })
    deployed

}
