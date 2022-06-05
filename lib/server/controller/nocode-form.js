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
import { createNocodeForm, updateNocodeForm } from '../service/nocode-form'
// import { enablePerviewDb } from '../service/preview-db-service'
// import { createNCTable, updateNCTable } from '../service/no-code'
// import { transformNCJson2LCJson } from '../../shared/no-code'
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
            const formItem = await updateNocodeForm(formData)
            return {
                ...formItem
            }
        } catch (err) {
            throw new Error(err.message || err)
        }
    }

    @OutputJson()
    @Get('/detail')
    async formDetail (
        @QueryParams({ name: 'formId', require: true }) id
    ) {
        return LCDataService.findOne(TABLE_FILE_NAME.FORM, { id, deleteFlag: 0 })
    }
}
