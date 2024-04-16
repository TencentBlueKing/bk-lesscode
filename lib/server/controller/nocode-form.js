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
import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'
import { createNocodeForm, updateNocodeForm, getFormList } from '../service/business/nocode-form'
import {
    Controller,
    Get,
    Post,
    Put,
    BodyParams,
    QueryParams,
    ProjectAuthorization,
    ProjectResAuthorization,
    OutputJson
} from '../decorator'
import { IAM_ACTION } from '../../shared/constant.js'

@Controller('/api/nocode-form')
export default class NocodeFormController {
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/create')
    async createForm (
        @BodyParams() formData
    ) {
        const resData = await createNocodeForm(formData)
        return {
            ...resData
        }
    }

    @OutputJson()
    @ProjectResAuthorization({ tableName: 'FORM' })
    @Put('/update')
    async updateForm (
        @BodyParams() formData
    ) {
        try {
            if (!formData.id) {
                throw new Error(global.i18n.t('id不存在'))
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

    // 根据formId， 或者结合projectId，versionId， tableName查询formDetail
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'FORM', getResourceId: ctx => ctx.request.query?.formId })
    @Get('/detail')
    async formDetail (
        @QueryParams({ name: 'formId' }) formId,
        @QueryParams({ name: 'projectId' }) projectId,
        @QueryParams({ name: 'versionId' }) versionId,
        @QueryParams({ name: 'tableName' }) tableName
    ) {
        let formDetail = {}
        if (formId) {
            formDetail = await LCDataService.findOne(
                TABLE_FILE_NAME.FORM,
                { id: formId }
            )
        } else {
            formDetail = await LCDataService.findOne(
                TABLE_FILE_NAME.FORM,
                {
                    tableName,
                    projectId,
                    versionId: versionId || null
                }
            )
        }
        return formDetail
    }

    @OutputJson()
    @ProjectAuthorization({})
    @Get('/list')
    async formList (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'versionId' }) versionId
    ) {
        const list = await getFormList(projectId, versionId)
        return list || []
    }

    // 查询绑定到特定form的相关页面
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/getFormRelatedPages')
    async getDataManagePages (
        @QueryParams({ name: 'formId', require: true }) formId,
        @QueryParams({ name: 'type' }) type // 若不传，返回所有nocodeType类型的页面
    ) {
        const dataManagePages = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.PAGE,
            query: {
                formId: formId,
                nocodeType: type
            }
        })
        return dataManagePages.list || []
    }
}
