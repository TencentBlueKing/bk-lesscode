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

@Entity({ name: 'r_project_func_market', comment: '项目/函数市场关联表' })
export default class extends Base {
    @Column({
        type: 'int',
        comment: '函数市场表主键'
    })
    funcMarketId

    @Column({
        type: 'int',
        comment: '项目表主键'
    })
    projectId

    @Column({
        type: 'int',
        comment: '函数表主键'
    })
    projectFuncId
}
