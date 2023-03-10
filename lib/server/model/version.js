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

import { getRepository } from 'typeorm'
import Version from './entities/version'
import Comp from './entities/comp'

export const getAll = async function (params) {
    const res = await getRepository(Version).find({
        where: params
    })
    return res
}

export const getAllComponentVersion = async function () {
    const res = await getRepository(Version)
        .createQueryBuilder('version')
        .leftJoin(Comp, 'comp', 'version.componentId = comp.id')
        .select('version.version', 'version')
        .addSelect('version.id', 'id')
        .addSelect('comp.type', 'type')
        .addSelect('comp.belongProjectId', 'belongProjectId')
        .andWhere('comp.deleteFlag = 0')
        .andWhere('version.deleteFlag = 0')
        .getRawMany()
    return res
}

export const findById = async function (id) {
    const res = await getRepository(Version).findOne(id)
    return res
}

export const getOne = async function (params = {}) {
    const res = await getRepository(Version).find({
        where: params
    })
    if (res && res.length > 0) {
        return res[0]
    }
    return ''
}
