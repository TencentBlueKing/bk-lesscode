/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { Entity, Column } from 'typeorm'
import Base from './base'
 
@Entity({ name: 'project_bkflow_space', comment: 'lesscode项目在bkflow创建的项目信息' })
export default class extends Base {
    @Column({
        type: 'int',
        comment: '项目 Id'
    })
    projectId

    @Column({
        type: 'int',
        comment: 'bkflow 空间 Id'
    })
    bkFlowSpaceId
}
