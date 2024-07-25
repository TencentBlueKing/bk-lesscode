/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2024 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import {
    Controller,
    OutputJson,
    Get,
    Post,
    Put,
    Delete,
    BodyParams,
    QueryParams,
    HeaderParams,
    PathParams,
    ProjectAuthorization,
    ProjectResAuthorization,
} from '../decorator'
import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'

@Controller('/api/flow')
export default class NoCodeController {
    // 获取项目下流程模板列表
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/tpl')
    async getFlowTplList (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @QueryParams({ name: 'page' }) page,
        @QueryParams({ name: 'pageSize' }) pageSize,
        @QueryParams({ name: 'deleteFlag', default: 0 }) deleteFlag,
        @QueryParams({ name: 'name' }) name
    ) {
        const query = Object.assign({
            projectId,
            deleteFlag
        }, (name ? { name: `%${name}%` } : {}))
        const { list, count } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FLOW_TPL,
            page,
            pageSize,
            query
        })
        return { list, count }
    }

    // 新增流程模板
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/tpl')
    async createFlowTpl (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'name', require: true }) name,
        @BodyParams({ name: 'summary', default: '' }) summary,
        @BodyParams({ name: 'nodes', require: true, default: '[]' }) nodes,
        @BodyParams({ name: 'edges', require: true, default: '[]' }) edges,
        @BodyParams({ name: 'deployed', default: 0 }) deployed,
    ) {
        return LCDataService.add(TABLE_FILE_NAME.FLOW_TPL, { name, summary, nodes, edges, deployed, projectId })
    }

    // 获取流程模板详情
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/tpl/:tplId')
    async getFlowTplDetail (
        @PathParams({ name: 'tplId', require: true }) tplId
    ) {
        const tplDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id: tplId })
        return tplDetail
    }

    // 更新流程模板
    @OutputJson()
    @ProjectAuthorization({})
    @Put('/tpl')
    async updateFlowTpl (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'id', require: true }) id,
        @BodyParams({ name: 'name', require: true }) name,
        @BodyParams({ name: 'summary', default: '' }) summary,
        @BodyParams({ name: 'nodes', require: true, default: '[]' }) nodes,
        @BodyParams({ name: 'edges', require: true, default: '[]' }) edges,
        @BodyParams({ name: 'deployed', default: 0 }) deployed
    ) {
        return LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id, name, summary, nodes, edges, deployed, projectId })
    }

    // 归档/恢复流程模板
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'FLOW_TPL' })
    @Put('/archive')
    async archiveFlowTpl (
        @BodyParams({ name: 'id' }) id,
        @BodyParams({ name: 'deleteFlag' }) deleteFlag
    ) {
        const flowDetail = await LCDataService.findOne(TABLE_FILE_NAME.FLOW_TPL, { id })
        if (!flowDetail.id) {
            throw new global.BusinessError(global.i18n.t('流程id不存在'), -1)
        }
        await LCDataService.update(TABLE_FILE_NAME.FLOW_TPL, { id, deleteFlag })

        return flowDetail
    }

    // 删除流程模板
    @OutputJson()
    @ProjectResAuthorization({ tableName: TABLE_FILE_NAME.FLOW_TPL })
    @Delete('/tpl')
    async deleteFlowTpl (
        @QueryParams({ name: 'id', require: true }) id,
    ) {
        return LCDataService.softDelete(TABLE_FILE_NAME.FLOW_TPL, id)
    }
}
