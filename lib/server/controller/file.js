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
import fs from 'fs'
import FileType from 'file-type'
import md5 from 'md5'
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'
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
    HeaderParams,
    ProjectAuthorization,
    ProjectResAuthorization,
    OutputJson,
    Ctx
} from '../decorator'
import {
    getAll
} from '../service/business/file'
import { IAM_ACTION } from '../../shared/constant.js'

const ALLOW_IMG_TYPE = ['png', 'jpg', 'jpeg', 'gif']
const ALLOW_UPLOAD_TYPE = ['png', 'jpg', 'svg', 'jpeg',
    'gif', 'doc', 'docx', 'ppt', 'pptx', 'csv',
    'xls', 'xlsx', 'pdf', 'zip', 'tar.gz']

@Controller('/api/file')
export default class FileController {
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/list')
    all (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        return getAll(projectId)
    }

    @OutputJson()
    @ProjectAuthorization({})
    @Post('/create')
    async create (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'fileData' }) fileData
    ) {
        const result = await LCDataService.add(TABLE_FILE_NAME.FILE, {
            projectId,
            ...fileData
        })
        return result
    }

    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId })
    @Post('/upload')
    async upload (
        @BodyParams({ name: 'projectId', require: true }) projectId,
        @SessionParams({ name: 'userInfo' }) userInfo,
        @Ctx({ name: 'request' }) request
    ) {
        const files = request.files || {}
        const file = files.file
        projectId = parseInt(projectId, 10)

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

        if (!ALLOW_UPLOAD_TYPE.includes(ext)) {   
            throw new Error('不允许上传该格式类型文件')
        }

        const uploadPath = `/${projectId}/file-lib/${fileKey}.${ext}`

        if (!file.name || !mime) {
            throw Error(global.i18n.t('获取文件信息异常'))
        }
        file.name = file.name?.replace(/(\||;|&|\\|\$|>|<|`|!|\s+)/gi, '')

        if (mime === 'image/svg+xml') {
            const svgString = fs.readFileSync(filePath, 'utf-8')

            // 过滤xss
            const window = new JSDOM('').window
            const purify = DOMPurify(window)
            const cleanSvg = purify.sanitize(svgString)

            fs.writeFileSync(filePath, cleanSvg)
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
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId })
    @Post('/uploadBase64Img')
    async uploadBase64Img (
        @BodyParams({ name: 'projectId', require: true }) projectId,
        @BodyParams({ name: 'fileObj' }) file,
        @SessionParams({ name: 'userInfo' }) userInfo
    ) {
        projectId = parseInt(projectId, 10)
        if (!file || !file.name || !file.content) {
            throw Error(global.i18n.t('文件解析错误'))
        }
        file.name = file.name?.replace(/(\||;|&|\\|-|\$|>|<|`|!|\s+)/gi, '')
        let ext = path.extname(file.name).slice(1)
        if (!ALLOW_IMG_TYPE.includes(ext)) {
            throw new Error('不允许上传该格式类型文件')
        }
        const fileKey = md5(`${userInfo.username}${projectId}${file.name}${Date.now()}`)

        const uploadPath = `/${projectId}/markdown-img/${fileKey}.${ext}`

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
    @ProjectResAuthorization({ tableName: 'FILE', resourceKey: 'id', getResourceId: ctx => ctx.query.fileId })
    @Delete('/del')
    async del (
        @QueryParams({ name: 'fileId' }) fileId
    ) {
        const result = await LCDataService.softDelete(TABLE_FILE_NAME.FILE, fileId)
        return result?.id
    }

    @ProjectAuthorization({ getId: ctx => ctx.request.query.projectId })
    @Get('/export')
    async export (
        @Ctx() ctx,
        @QueryParams({ name: 'projectId', require: true }) projectId
    ) {
        projectId = parseInt(projectId)
        const { list } = await getAll(projectId)
        const compressing = require('compressing')
        const send = require('koa-send')
        const path = require('path')
        const fse = require('fs-extra')
        const fetch = require('node-fetch')
        const fs = require('fs')

        const STATIC_URL = './lib/server/temp/'
        const pathName = `bk-lesscode-files-${projectId}`

        const sourcePath = path.join(STATIC_URL, pathName)
        const targetPath = path.join(STATIC_URL, `${pathName}.zip`)
        fse.ensureDirSync(sourcePath)

        const curlContent = async (item) => {
            return new Promise((resolve, reject) => {
                const execName = item.name?.replace(/(\||;|&|\\|-|\$|>|<|`|!|\s+)/gi, '')
                const execUrl = item.url?.replace(/(\||;|&|\\|\$|>|<|`|!|\s+)/gi, '')
                if (!execUrl.startsWith('http')) {
                    reject(new Error('非法url'))
                }

                fetch(execUrl)
                    .then(res => {
                        const dest = fs.createWriteStream(path.resolve(sourcePath, execName))
                        res.body.pipe(dest)
                        dest.on('finish', () => {
                            resolve()
                        })
                    })
                    .catch(err => {
                        reject(new Error(global.i18n.t('{{n}}下载失败', { n: item.name })))
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
