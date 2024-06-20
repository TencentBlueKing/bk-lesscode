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
import ProjectCodeModel from '../model/project-code'
import OperationLogger from '../service/common/operation-logger'

const fse = require('fs-extra')
const path = require('path')
const send = require('koa-send')
const compressing = require('compressing')

const DIR_PATH = '.'
const STATIC_URL = `${DIR_PATH}/lib/server/project-template/`

const ProjectCode = {
    async downloadCode (ctx) {
        const operationLogger = new OperationLogger(ctx)
        const { projectId, v: version, projectCode = '' } = ctx.request.query
        const [versionId, versionName] = version.split(':')

        try {
            const pathName = `bklesscode-project-${projectCode}-${projectId}${versionId ? `-${versionName}` : ''}`
            await ProjectCodeModel.generateCode(projectId, versionId || undefined, pathName)

            const sourcePath = path.join(STATIC_URL, pathName)
            const targetPath = path.join(STATIC_URL, `${pathName}.zip`)
            await compressing.zip.compressDir(sourcePath, targetPath)
                .then(async () => {
                    ctx.attachment(targetPath)
                    await send(ctx, targetPath)
                    fse.remove(sourcePath)
                    fse.remove(targetPath)
                    operationLogger.success({
                        operateTarget: global.i18n.t('应用ID：{{n}}', { n: projectId })
                    })
                }).catch((err) => {
                    operationLogger.error(err, {
                        operateTarget: global.i18n.t('应用ID：{{n}}', { n: projectId })
                    })
                    console.log(err)
                })
        } catch (error) {
            operationLogger.error(error, {
                operateTarget: global.i18n.t('应用ID：{{n}}', { n: projectId })
            })
            ctx.throw(error)
        }
    },

    async previewCode (ctx) {
        const operationLogger = new OperationLogger(ctx)
        const { projectId, versionId, platform, pageId } = ctx.request.query
        try {
            // 参数校验
            if ([undefined, ''].includes(projectId)) {
                throw new global.BusinessError(global.i18n.t('暂无应用ID，请在 Lesscode 上重新打开预览'), 400, 400)
            }

            const data = await ProjectCodeModel.previewCode(projectId, versionId || undefined, platform, pageId)
            operationLogger.success({
                operateTarget: global.i18n.t('应用ID：{{n}}', { n: projectId })
            })
            ctx.send({
                code: 0,
                message: 'success',
                data
            })
        } catch (error) {
            operationLogger.error(error, {
                operateTarget: global.i18n.t('应用ID：{{n}}', { n: projectId })
            })
            ctx.throw(error)
        }
    }
}

module.exports = ProjectCode
