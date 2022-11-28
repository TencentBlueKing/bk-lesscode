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
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    BodyParams,
    QueryParams,
    CookieParams,
    SessionParams,
    ProjectAuthorization,
    OutputJson
} from '../decorator'
import {
    checkFuncBody,
    fixFuncBody,
    doubleCheckFunction,
    handleRelation,
    injectRelation,
    handleFunctionIntoDb,
    handleFunctionOutDb,
    getAllGroupAndFunction
} from '../service/business/function'
import v3Config from '../conf/v3'
import dayjs from 'dayjs'
import http from '../utils/http'
import { IAM_ACTION } from '../../shared/constant.js'

@Controller('/api/function')
export default class FunctionController {
    // 获取项目下的所有函数分类
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.query.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/getAllGroupAndFunction')
    getAllGroupAndFunction (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'versionId' }) versionId
    ) {
        return getAllGroupAndFunction(projectId, versionId)
    }

    // 获取项目下的所有函数分类
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.query.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/getGroupList')
    async getGroupList (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'versionId' }) versionId
    ) {
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_GROUP,
            query: {
                projectId,
                versionId,
                deleteFlag: 0
            },
            order: {
                order: 'ASC'
            }
        })
        return list
    }

    // 获取项目下的函数
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.query.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Get('/getFunctionList')
    async getFunctionList (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'funcGroupId' }) funcGroupId,
        @QueryParams({ name: 'versionId' }) versionId
    ) {
        const query = {
            versionId,
            projectId,
            deleteFlag: 0
        }
        if (funcGroupId !== undefined) {
            query.funcGroupId = funcGroupId
        }
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC,
            query
        })
        const listWithRelation = await injectRelation(list, projectId, versionId)
        const formattedList = handleFunctionOutDb(listWithRelation)
        return formattedList
    }

    // 新增函数分类
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/createFunctionGroup')
    async createFunctionGroup (
        @BodyParams({ name: 'projectId', require: true }) projectId,
        @BodyParams({ name: 'groupName', require: true }) groupName,
        @BodyParams({ name: 'versionId' }) versionId
    ) {
        const {
            list: funcGroupList
        } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.FUNC_GROUP,
            query: {
                versionId,
                projectId,
                deleteFlag: 0
            }
        })
        const groupNameList = groupName.split('/')

        // 重复检查
        const repeatGroup = funcGroupList.find(group => groupNameList.includes(group.groupName))
        if (repeatGroup) {
            throw new Error(`分类【${repeatGroup.groupName}】已存在，请修改后再试`)
        }
        // 新增分类
        let order = funcGroupList[funcGroupList.length - 1]?.order || 0
        const newGroupList = groupNameList.map((groupName) => ({
            versionId,
            projectId,
            groupName,
            order: ++order
        }))
        return LCDataService.bulkAdd(TABLE_FILE_NAME.FUNC_GROUP, newGroupList)
    }

    // 删除函数分类
    @OutputJson()
    @Delete('/deleteFunctionGroup')
    async deleteFunctionGroup (
        @QueryParams({ name: 'funcGroupId', require: true }) funcGroupId
    ) {
        // 判断分类下已存在函数
        const isExistFunc = await LCDataService.has(TABLE_FILE_NAME.FUNC, {
            funcGroupId,
            deleteFlag: 0
        })
        if (isExistFunc) {
            throw new Error(`分类【ID：${funcGroupId}】下已存在函数，无法删除，请修改后再试`)
        }
        // 判断项目下是否只有一个分类
        const group = await LCDataService.findOne(TABLE_FILE_NAME.FUNC_GROUP, {
            id: funcGroupId
        })
        const count = await LCDataService.count(TABLE_FILE_NAME.FUNC_GROUP, {
            projectId: group.projectId,
            deleteFlag: 0
        })
        if (count <= 1) {
            throw new Error(`应用【ID：${group.projectId}】下只有唯一一个分组，无法删除最后一个分组，请修改后再试`)
        }
        return LCDataService.delete(TABLE_FILE_NAME.FUNC_GROUP, funcGroupId)
    }

    // 编辑函数分类
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Put('/editFunctionGroups')
    editFunctionGroups (
        @BodyParams({ name: 'functionGroups', require: true }) functionGroups
    ) {
        return LCDataService.bulkUpdate(TABLE_FILE_NAME.FUNC_GROUP, functionGroups)
    }

    // 新增函数
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/createFunction')
    async createFunction (
        @BodyParams({ require: true }) functionData
    ) {
        // 检查 code name 是否重复
        await doubleCheckFunction(functionData, functionData.projectId, functionData.versionId)
        // ESLint 检查
        await checkFuncBody(functionData)
        // 入库事务
        await LCDataService.transaction(async (transactionalEntityHelper) => {
            // 插入数据库
            await transactionalEntityHelper.add(TABLE_FILE_NAME.FUNC, handleFunctionIntoDb(functionData))
            // 处理关联关系
            await handleRelation(functionData, functionData.projectId, functionData.versionId)
        })
        // 返回函数本身
        return functionData
    }

    // 新增函数
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Put('/editFunction')
    async editFunction (
        @BodyParams({ require: true }) functionData
    ) {
        // 检查 code name 是否重复
        await doubleCheckFunction(functionData, functionData.projectId, functionData.versionId)
        // ESLint 检查
        await checkFuncBody(functionData)
        // 入库事务
        await LCDataService.transaction(async (transactionalEntityHelper) => {
            // 插入数据库
            await transactionalEntityHelper.update(TABLE_FILE_NAME.FUNC, handleFunctionIntoDb(functionData))
            // 处理关联关系
            await handleRelation(functionData, functionData.projectId, functionData.versionId)
        })
        // 返回函数本身
        return functionData
    }

    // 批量新增函数
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId, needAuthActions: [IAM_ACTION.develop_app[0]] })
    @Post('/bulkCreateFunction')
    async bulkCreateFunction (
        @BodyParams({ name: 'functionList', require: true }) functionList,
        @BodyParams({ name: 'projectId', require: true }) projectId,
        @BodyParams({ name: 'versionId' }) versionId
    ) {
        // 检查 code name 是否重复
        await doubleCheckFunction(functionList, projectId, versionId)
        // ESLint 检查
        await checkFuncBody(functionList)
        // 入库事务
        await LCDataService.transaction(async (transactionalEntityHelper) => {
            // 插入数据库
            await transactionalEntityHelper.add(TABLE_FILE_NAME.FUNC, handleFunctionIntoDb(functionList))
            // 处理关联关系
            await handleRelation(functionList, projectId, versionId)
        })
        // 返回函数列表
        return functionList
    }

    // 删除函数
    @OutputJson()
    @Delete('/deleteFunction')
    async deleteFunction (
        @QueryParams({ name: 'id', require: true }) id
    ) {
        // 获取数据
        const functionData = await LCDataService.findOne(TABLE_FILE_NAME.FUNC, { id })
        const query = {
            projectId: functionData.projectId,
            versionId: functionData.versionId,
            deleteFlag: 0
        }
        const [
            { list: funcRelateList },
            { list: varRelateList }
        ] = await Promise.all([
            LCDataService.get({
                tableFileName: TABLE_FILE_NAME.FUNC_FUNC,
                query: {
                    ...query,
                    parentFuncCode: functionData.funcCode
                }
            }),
            LCDataService.get({
                tableFileName: TABLE_FILE_NAME.FUNC_VARIABLE,
                query: {
                    ...query,
                    funcCode: functionData.funcCode
                }
            })
        ])
        const {
            useInfo: {
                funcCodes,
                pageNames,
                variableCodes
            }
        } = await injectRelation(functionData, functionData.projectId, functionData.versionId)
        if (funcCodes.length > 0) {
            throw new Error(`该函数被使用在函数标识为【${funcCodes.join(',')}】的函数中，不可删除，请修改后再试`)
        }
        if (pageNames.length > 0) {
            throw new Error(`该函数被使用在页面名称为【${pageNames.join(',')}】的页面中，不可删除，请修改后再试`)
        }
        if (variableCodes.length > 0) {
            throw new Error(`该函数被使用在变量标识为【${variableCodes.join(',')}】的变量中，不可删除，请修改后再试`)
        }
        // 删除数据
        await LCDataService.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.delete(functionData)
            await transactionalEntityManager.delete(funcRelateList)
            await transactionalEntityManager.delete(varRelateList)
        })
        return functionData
    }

    // 使用ESLint修复函数
    @OutputJson()
    @Post('/fixFunByEslint')
    fixFunByEslint (
        @BodyParams({ require: true }) functionData
    ) {
        return fixFuncBody(functionData)
    }

    // 使用 ESLint 检查函数
    @OutputJson()
    @Post('/checkEslint')
    async checkEslint (
        @BodyParams({ require: true }) functionData
    ) {
        // 检查结果
        const lintResult = {
            message: '',
            data: []
        }
        // 执行检查
        try {
            await checkFuncBody(functionData)
        } catch (error) {
            lintResult.message = error.message
            lintResult.data = error.data
        }
        // 抛出结果
        return lintResult
    }

    @OutputJson()
    @Get('/generateToken')
    async generateToken (
        @QueryParams({ name: 'appCode', require: true }) appCode,
        @QueryParams({ name: 'id' }) id,
        @CookieParams({ name: global.AUTH_NAME }) bkTikcet
    ) {
        const headerKey = global.AUTH_NAME === 'bk_ticket' ? 'X-USER-BK-TICKET' : 'X-USER-BK-TOKEN'
        const url = `${v3Config.URL_PREFIX}/bkapps/applications/${appCode}/oauth/token/lesscode/?bk_app_code=${v3Config.APP_ID}&bk_app_secret=${encodeURI(v3Config.APP_SECRET)}&${global.AUTH_NAME}=${bkTikcet}`
        const reData = await http.get(url, {
            headers: {
                [headerKey]: bkTikcet
            }
        })
        if (!reData.access_token) throw new Error(reData.message || '生成 Token 失败')
        // 写入数据库
        const now = dayjs().add(reData.expires_in, 'second')
        const tokenData = {
            id: Number(id) || undefined,
            token: reData.access_token,
            tokenUser: reData.user_id,
            expiresTime: now.format(),
            appCode
        }
        if (id) {
            // update token
            await LCDataService.update(TABLE_FILE_NAME.TOKEN, tokenData)
        } else {
            // create token
            await LCDataService.add(TABLE_FILE_NAME.TOKEN, tokenData)
        }
        return tokenData
    }

    @OutputJson()
    @Get('/getTokenList')
    async getTokenList (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @SessionParams({ name: 'userInfo' }) userInfo
    ) {
        const projectInfo = await LCDataService.findOne(TABLE_FILE_NAME.PROJECT, { id: projectId })
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.TOKEN,
            query: {
                deleteFlag: 0,
                updateUser: userInfo.username,
                appCode: projectInfo.appCode
            }
        })
        return list
    }
}
