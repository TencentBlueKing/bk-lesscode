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
// eslint-disable-next-line no-unused-vars
import { getConnection, getRepository } from 'typeorm'
import ProjectVersion from './entities/project-version'

export default {
    findById (id) {
        return getRepository(ProjectVersion).findOne(id)
    },

    getOne (params = {}) {
        return getRepository(ProjectVersion).findOne({ where: params })
    }
}
