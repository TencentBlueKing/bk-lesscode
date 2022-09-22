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

import path from 'path'
import FileType from 'file-type'
import md5 from 'md5'
import { LCDataService, TABLE_FILE_NAME } from '../service/common/data-service'
import fileService from '../utils/file-service/index'
import {
    Controller,
    Get,
    Post,
    Delete,
    BodyParams,
    QueryParams,
    SessionParams,
    ProjectAuthorization,
    OutputJson,
    Ctx
} from '../decorator'
import {
    getAll
} from '../service/business/file'
import { IAM_ACTION } from '../../shared/constant.js'

@Controller('/api/file')
export default class FileController {
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.query.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/list')
    all (
        @QueryParams({ name: 'projectId', require: true }) projectId
    ) {
        return getAll(projectId)
    }

    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/create')
    async create (
        @BodyParams({ name: 'projectId', require: true }) projectId,
        @BodyParams({ name: 'fileData' }) fileData
    ) {
        const result = await LCDataService.add(TABLE_FILE_NAME.FILE, {
            projectId,
            ...fileData
        })
        return result
    }

    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/upload')
    async upload (
        @BodyParams({ name: 'projectId', require: true }) projectId,
        @SessionParams({ name: 'userInfo' }) userInfo,
        @Ctx({ name: 'request' }) request
    ) {
        const files = request.files || {}
        const file = files.file

        if (!file) {
            throw Error('未找到文件')
        }

        const filePath = file.path

        const fileKey = md5(`${userInfo.username}${projectId}${filePath}${Date.now()}`)

        const noStrictExts = ['doc', 'xls', 'ppt', 'msi', 'csv', 'svg']

        let ext = path.extname(file.name).slice(1)
        let mime = file.type

        if (!noStrictExts.includes(ext)) {
            const typeResult = await FileType.fromFile(filePath)
            ext = typeResult.ext
            mime = typeResult.mime
        }

        const uploadPath = `/${projectId}/file-lib/${fileKey}.${ext}`

        if (!file.name || !mime) {
            throw Error('获取文件信息异常')
        }

        try {
            const fullUrl = await fileService.uploadImage(filePath, uploadPath, { isPublic: true, ensurePath: true, fullUrl: true })

            return {
                name: file.name,
                size: file.size,
                ext,
                mime,
                url: fullUrl
            }
        } catch (err) {
            throw err
        }
    }

    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.query.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Delete('/del')
    async del (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'fileId' }) fileId
    ) {
        const result = await LCDataService.softDelete(TABLE_FILE_NAME.FILE, fileId)
        return result?.id
    }
}
