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
import PageComp from './entities/page-comp'
import Page from './entities/page'
import Comp from './entities/comp'
import Version from './entities/version'
import { whereVersion } from './common'
import { getAllComponentVersion } from './version'

// npm.js配置文件不存在时赋值空对象
let npmConf
try {
    npmConf = require('../conf/npm')
} catch (_) {
    npmConf = {}
}

export const getAll = async function (params) {
    const res = await getRepository(PageComp).find(
        {
            where: params
        }
    )
    return res
}

export const getPageAndVersion = async function (params) {
    const res = await getRepository(PageComp)
        .createQueryBuilder('pageComp')
        .leftJoin(Page, 'page', 'page.id = pageComp.pageId')
        .leftJoin(Version, 'version', 'version.id = pageComp.versionId')
        .select('pageComp.*')
        .addSelect('page.pageName', 'pageName')
        .addSelect('version.id', 'versionId')
        .addSelect('version.version', 'version')
        .addSelect('version.versionLog', 'versionLog')
        .addSelect('version.isLast', 'isLast')
        .where(params)
        .andWhere('page.deleteFlag = 0')
        .getRawMany()
    return res
}

export const getTypeAndVersion = async function (pageIds) {
    let res = await getRepository(PageComp)
        .createQueryBuilder('pageComp')
        .leftJoin(Comp, 'comp', 'comp.id = pageComp.compId')
        .leftJoin(Version, 'version', 'version.id = pageComp.versionId')
        .select('pageComp.*')
        .addSelect('comp.type', 'realType')
        .addSelect('version.version', 'realVersion')
        .where('pageComp.pageId IN (:...pageIds)', { pageIds })
        .andWhere('pageComp.deleteFlag = 0')
        .getRawMany()
    res = (res || []).map(item => {
        const { realType, realVersion, ...others } = item
        others.compType = realType || item.compType
        others.compVersion = realVersion || item.compVersion
        return others
    })
    return res
}

export const update = async function (params, data) {
    return getRepository(PageComp).update(params, data)
}

export const getProjectComp = async function (projectId, versionId) {
    const res = await getRepository(PageComp)
        .createQueryBuilder('pageComp')
        .leftJoinAndSelect(Comp, 'c', 'pageComp.compId = c.id')
        .leftJoinAndSelect(Version, 'v', 'pageComp.versionId = v.id')
        .where('pageComp.projectId = :projectId', { projectId })
        .andWhere(whereVersion(versionId, 'pageComp', 'projectVersionId'))
        .andWhere('pageComp.deleteFlag = 0')
        .select(['pageComp.compVersion as compVersion', 'pageComp.compType as compType'])
        .addSelect(['v.version as version', 'c.type as type'])
        .orderBy('pageComp.id', 'DESC')
        // .distinct('pageComp.compId, pageComp.compType')
        .getRawMany()
    
    // 本数据库中存在的自定义组件&&版本列表
    const compVersionList = await getAllComponentVersion()
    // 确保同一个type只写一条记录
    const typeArr = []
    let data = []
    if (res.length) {
        const prefix = process.env.BKPAAS_ENVIRONMENT === 'prod' ? '' : 'test-'
        data = res.reduce((result, item) => {
            // 如果是导入的compType跟compVersion，需要先校验compType跟compVersion是否存在
            if (item.compVersion && item.compType && compVersionList.filter(comp => comp.version === item.compVersion && comp.type === item.compType).length > 0) {
                item.version = item.compVersion
                item.type = item.compType
            }

            if (typeArr.indexOf(item.type) === -1 && item.version && item.type) {
                typeArr.push(item.type)
                let version = item.version
                version = version?.substring(0, 1) === 'v' ? version?.substring(1) : version
                result.push({
                    name: `${npmConf.scopename}/${prefix}${item.type}`,
                    version: version
                })
            }
            return result
        }, [])
    }
    
    return data
}
