/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent PageTemplateany. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in PageTemplateliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { getRepository } from 'typeorm'
import PageTemplate from './entities/page-template'

export const all = async function (params = {}) {
    const res = await getRepository(PageTemplate)
        .createQueryBuilder('pageTemplate')
        .where({
            ...params
        })
        .andWhere('pageTemplate.deleteFlag = 0')
        .orderBy('CASE pageTemplate.templateType WHEN "MOBILE" THEN "PC" END')
        .addOrderBy('pageTemplate.id', 'DESC')
        .getMany()
    return res
}

export const getAll = async function () {
    const res = await getRepository(PageTemplate).find()
    return res
}

export const findById = async function (id) {
    const res = await getRepository(PageTemplate).findOne(id)
    return res
}

export const getOne = async function (params = {}) {
    const res = await getRepository(PageTemplate).find({
        where: params
    })
    if (res && res.length > 0) {
        return res[0]
    }
    return ''
}

export const updateById = async function (id, params = {}) {
    const template = await getOne({
        id
    })
    if (!template) {
        throw new Error(global.i18n.t('模板不存在'))
    }
    Object.keys(params).forEach(field => {
        template[field] = params[field]
    })
    const res = await getRepository(PageTemplate).save(template)
    return res
}

export const remove = async function (id) {
    try {
        const template = await getOne({
            id
        })
        if (!template) {
            throw new Error(global.i18n.t('模板不存在'))
        }
        template.deleteFlag = 1
        const res = await getRepository(PageTemplate).save(template)
        return res
    } catch (error) {
        throw error
    }
}

export const count = async function () {
    const res = await getRepository(PageTemplate)
        .createQueryBuilder()
        .select('categoryId')
        .addSelect('COUNT(id)', 'count')
        .where({
            status: 0
        })
        .groupBy('categoryId')
        .getRawMany()
    return res
}
