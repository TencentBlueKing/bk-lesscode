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

@Entity({ name: 'data_table', comment: '数据源表结构' })
export default class extends Base {
    @Column({
        type: 'varchar',
        comment: '表名称'
    })
    tableName

    @Column({
        type: 'int',
        comment: '项目 Id'
    })
    projectId

    @Column({
        type: 'int',
        comment: '第三方 DB Id'
    })
    thirdPartDBId

    @Column({
        type: 'text',
        comment: '字段json'
    })
    columns

    @Column({
        type: 'varchar',
        comment: '备注'
    })
    comment

    @Column({
        type: 'varchar',
        comment: '表来源'
    })
    source
}
