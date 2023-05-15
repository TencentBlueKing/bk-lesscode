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
    Ctx,
    OutputZip
} from '../decorator'
import {
    getAll
} from '../service/business/file'
import { IAM_ACTION } from '../../shared/constant.js'
import { reject } from 'lodash'

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
            throw Error(global.i18n.t('未找到文件'))
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
            throw Error(global.i18n.t('获取文件信息异常'))
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
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/uploadBase64Img')
    async uploadBase64Img (
        @BodyParams({ name: 'projectId', require: true }) projectId,
        @BodyParams({ name: 'fileObj' }) file,
        @SessionParams({ name: 'userInfo' }) userInfo
    ) {
        console.log(file, projectId, userInfo, 998833)

        if (!file || !file.name || !file.content) {
            throw Error(global.i18n.t('文件解析错误'))
        }

        const uploadPath = `/${projectId}/markdown-img/${userInfo.username}/${file.name}`

        const base64ImgStr = file.content.replace(/^data:image\/[a-z]+;base64,/, '')
        const buff = Buffer.from(base64ImgStr, 'base64')

        try {
            const fullUrl = await fileService.uploadImage('', uploadPath, { isPublic: true, ensurePath: true, fullUrl: true, fileStream: buff })

            return {
                name: file.name,
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

    @ProjectAuthorization({ getId: ctx => ctx.request.query.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/export')
    async export (
        @Ctx() ctx,
        @QueryParams({ name: 'projectId', require: true }) projectId
    ) {
        const { list } = await getAll(projectId)
        const compressing = require('compressing')
        const send = require('koa-send')
        const path = require('path')
        const fse = require('fs-extra')

        const STATIC_URL = './lib/server/temp/'
        const pathName = `bk-lesscode-files-${projectId}`

        const sourcePath = path.join(STATIC_URL, pathName)
        const targetPath = path.join(STATIC_URL, `${pathName}.zip`)
        fse.ensureDirSync(sourcePath)

        const curlContent = async (item) => {
            return new Promise((resolve, reject) => {
                const childProcess = require('child_process')

                const curl = `curl -o ${path.resolve(sourcePath, item.name)} ${item.url}`
                console.log(curl)

                childProcess.exec(curl, function (err, stdout, stderr) {
                    if (err) {
                        reject(new Error(global.i18n.t('{{n}}下载失败', { n: item.name })))
                    }
                    resolve(
                        resolve()
                    )
                })
            })
        }
                
        await Promise.all(list.map(async item => {
            await curlContent(item)
        }))

        await compressing.zip.compressDir(sourcePath, targetPath)
            .then(async () => {
                ctx.attachment(targetPath)
                await send(ctx, targetPath)
                fse.remove(sourcePath)
                fse.remove(targetPath)
            }).catch((err) => {
                console.log('zip err')
                console.log(err)
            })
    }
}
