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
import { LCDataService, TABLE_FILE_NAME } from '../service/data-service'
import { createNocodeForm, updateNocodeForm, getFormDetail } from '../service/nocode-form'
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    BodyParams,
    QueryParams,
    ProjectAuthorization,
    OutputJson
} from '../decorator'
@Controller('/api/nocode-form')
export default class NocodeFormController {
    @OutputJson()
    @Post('/create')
    async createForm (
        @BodyParams() formData
    ) {
        try {
            const resData = await createNocodeForm(formData)
            return {
                ...resData
            }
        } catch (err) {
            throw new Error(err.message || err)
        }
    }

    @OutputJson()
    @Put('/update')
    async updateForm (
        @BodyParams() formData
    ) {
        try {
            if (!formData.id) {
                throw new Error('id不存在')
            }
            // 如果有formContent，则需要进行表变更，否则更新form表即可
            if (formData.content) {
                await updateNocodeForm(formData)
            } else {
                await LCDataService.update(TABLE_FILE_NAME.FORM, formData)
            }
            return {
                ...formData
            }
        } catch (err) {
            throw new Error(err.message || err)
        }
    }

    @OutputJson()
    @Get('/detail')
    async formDetail (
        @QueryParams({ name: 'formId', require: true }) formId
    ) {
        const form = await getFormDetail(formId) || {}
        return form
    }

    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.query.projectId })
    @Get('/list')
    async formList (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'versionId' }) versionId
    ) {
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FORM,
            page: 1,
            pageSize: 10000,
            query: {
                projectId,
                versionId: versionId || null,
                deleteFlag: 0
            }
        })
        return list
    }
}
