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

import { getAll, addVariable, editVariable, deleteVariable, findById } from '../model/variable.js'
import { updateVariableRelation } from '../model/variable-relation'
import fileService from '../utils/file-service/index'
import FuncVariable from '../model/entities/func-variable'
import {
    checkEslint
} from '../service/common/code-formatter.js'
import { getRepository, In } from 'typeorm'
import { whereVersionLiteral } from '../model/common'
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../service/common/data-service'

const variable = {
    async updatePageBuildInVariable (ctx) {
        try {
            const {
                buildInVariableMap,
                projectId,
                versionId,
                pageCode
            } = ctx.request.body
            const { list: updateVariableList } = await LCDataService.get({
                tableFileName: TABLE_FILE_NAME.VARIABLE,
                query: {
                    variableCode: Object.keys(buildInVariableMap),
                    pageCode,
                    projectId,
                    versionId,
                    deleteFlag: 0
                }
            })
            updateVariableList.forEach((variable) => {
                const val = JSON.stringify(buildInVariableMap[variable.variableCode])
                variable.defaultValue = {
                    all: val,
                    prod: val,
                    stag: val,
                    preview: val
                }
                variable.defaultValue = JSON.stringify(variable.defaultValue)
            })
            if (updateVariableList.length > 0) {
                await LCDataService.bulkUpdate(TABLE_FILE_NAME.VARIABLE, updateVariableList)
            }
            ctx.send({
                code: 0,
                message: 'success'
            })
        } catch (error) {
            ctx.throwError(error)
        }
    },

    async uploadImage (ctx) {
        try {
            const session = ctx.session || {}
            const userInfo = session.userInfo || {}
            const file = ctx.request.files || {}
            const uploadFile = file.upload_file || {}
            const params = {
                filePath: uploadFile.path,
                fileName: uploadFile.name,
                fileType: uploadFile.type,
                uploadKey: userInfo.username + uploadFile.size,
                ACL: 'public-read'
            }
            const res = await fileService.uploadImage(params)
            ctx.send({
                code: 0,
                message: 'success',
                data: res.Location
            })
        } catch (error) {
            ctx.throwError({
                message: error.message
            })
        }
    },

    async getAllVariable (ctx) {
        try {
            const query = ctx.request.query || {}
            const data = await getAll(query)
            ctx.send({
                code: 0,
                message: 'success',
                data
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async getFunctionVariable (ctx) {
        try {
            const { projectId, versionId, funcCodes } = ctx.request.body || {}
            // 找出函数中使用的变量
            let data = []
            if (funcCodes && funcCodes.length) {
                const select = ['id', 'variableId']
                const where = { funcCode: In(funcCodes), deleteFlag: 0, projectId, versionId: whereVersionLiteral(versionId) }
                data = await getRepository(FuncVariable).find({ select, where })
            } else {
                data = await getRepository(FuncVariable).find({
                    where: {
                        projectId: projectId,
                        versionId: whereVersionLiteral(versionId),
                        deleteFlag: 0
                    }
                })
            }

            ctx.send({
                code: 0,
                message: 'success',
                data
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    },

    async addVariable (ctx) {
        try {
            const body = ctx.request.body || {}
            const { valueType, defaultValue } = body
            if (valueType === 6) {
                await checkEslint((defaultValue || {}).all, { lesscode: true })
            }
            const data = await addVariable(body)
            await updateVariableRelation(data)
            ctx.send({
                code: 0,
                message: 'success',
                data
            })
        } catch (err) {
            ctx.throwError(err)
        }
    },

    async editVariable (ctx) {
        try {
            const body = ctx.request.body || {}
            const { valueType, defaultValue } = body
            if (valueType === 6) {
                await checkEslint((defaultValue || {}).all, { lesscode: true })
            }
            const data = await editVariable(body)
            await updateVariableRelation(data)
            ctx.send({
                code: 0,
                message: 'success',
                data
            })
        } catch (err) {
            ctx.throwError(err)
        }
    },

    async deleteVariable (ctx) {
        try {
            const query = ctx.request.query || {}

            const data = await deleteVariable(query.id)
            await updateVariableRelation(data)
            ctx.send({
                code: 0,
                message: 'success',
                data
            })
        } catch (err) {
            ctx.throwError({
                message: err.message
            })
        }
    }
}

module.exports = variable
