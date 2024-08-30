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
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../service/common/data-service.js'
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    BodyParams,
    QueryParams,
    HeaderParams,
    ProjectAuthorization,
    ProjectResAuthorization,
    OutputJson
} from '../decorator'
import {
    execApiGateWay
} from '@bkui/apigateway-nodejs-sdk'
import httpConf from '../conf/http'
import v3Conf from '../conf/v3'

const authorization = {
    bk_app_code: v3Conf.APP_ID,
    bk_app_secret: v3Conf.APP_SECRET
}

@Controller('/api/api-manage')
export default class ApiManageController {
    // 获取 apigateway 网关列表
    @OutputJson()
    @Get('/apigateway/api-names')
    async getApiGatewayList () {
        const { code, data, message } = await execApiGateWay({
            apiName: 'bk-apigateway',
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            path: '/api/v1/apis/',
            method: 'get',
            stageName: 'prod',
            authorization
        })
        if (code !== 0) {
            throw new Error(message)
        }
        return data
    }

    // 获取 apigateway 网关环境列表
    @OutputJson()
    @Get('/apigateway/stages')
    async getApiGatewayStageList (
        @QueryParams({ name: 'apiName', require: true }) apiName
    ) {
        const { code, data, message } = await execApiGateWay({
            apiName: 'bk-apigateway',
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            path: `/api/v1/apis/${apiName}/stages/`,
            method: 'get',
            stageName: 'prod',
            authorization
        })
        if (code !== 0) {
            throw new Error(message)
        }
        return data
    }

    // 获取 apigateway 接口列表
    @OutputJson()
    @Get('/apigateway/apis')
    async getApiGatewayApiList (
        @QueryParams({ name: 'apiName', require: true }) apiName,
        @QueryParams({ name: 'stageName', require: true }) stageName
    ) {
        const { code, data, message } = await execApiGateWay({
            apiName: 'bk-apigateway',
            apiUrlTemp: httpConf.apiGateWayUrlTmpl,
            path: `/api/v1/apis/${apiName}/released/stages/${stageName}/resources/`,
            method: 'get',
            stageName: 'prod',
            authorization
        })
        if (code !== 0) {
            throw new Error(message)
        }
        return data
    }

    // 获取分类和api列表
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/category-children-list')
    async getCategoryChildrenList (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        const [
            { list: categoryList },
            { list: apiList }
        ] = await Promise.all([
            LCDataService.get({
                tableFileName: TABLE_FILE_NAME.API_CATEGORY,
                query: {
                    projectId
                },
                order: {
                    order: 'ASC'
                }
            }),
            LCDataService.get({
                tableFileName: TABLE_FILE_NAME.API,
                query: {
                    projectId
                }
            })
        ])
        categoryList.forEach((category) => {
            const categoryChildren = apiList.filter((api) => api.categoryId === category.id)
            category.children = categoryChildren
        })
        return categoryList
    }

    // 获取分类列表
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/category')
    async getCategoryList (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.API_CATEGORY,
            query: {
                projectId
            },
            order: {
                order: 'ASC'
            }
        })
        return list
    }

    // 创建分类
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/category')
    async createCategory (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams({ name: 'categoryName', require: true }) categoryName
    ) {
        const {
            list: categoryList
        } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.API_CATEGORY,
            query: {
                projectId,
                deleteFlag: 0
            }
        })
        const categoryNameList = categoryName.split('/')
        // 重复检查
        const repeatCategory = categoryList.find(category => categoryNameList.includes(category.name))
        if (repeatCategory) {
            throw new Error(global.i18n.t('分类【{{n}}】已存在，请修改后再试', { n: repeatCategory.name }))
        }
        // 新增分类
        let order = categoryList[categoryList.length - 1]?.order || 0
        const newCategoryList = categoryNameList.map((name) => ({
            projectId,
            name,
            order: ++order
        }))
        return LCDataService.bulkAdd(TABLE_FILE_NAME.API_CATEGORY, newCategoryList)
    }

    // 编辑分类
    @OutputJson()
    @ProjectAuthorization({})
    @Put('/category')
    editFunctionGroups (
        @BodyParams({ name: 'categorys', require: true }) categorys
    ) {
        return LCDataService.bulkUpdate(TABLE_FILE_NAME.API_CATEGORY, categorys)
    }

    // 删除分类
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'API_CATEGORY' })
    @Delete('/category')
    async deleteCategory (
        @QueryParams({ name: 'id', require: true }) id
    ) {
        // 判断分类下已存在 Api
        const isExistApi = await LCDataService.has(TABLE_FILE_NAME.API, {
            categoryId: id,
            deleteFlag: 0
        })
        if (isExistApi) {
            throw new Error(global.i18n.t('分组【ID：{{n}}】下已存在 Api，无法删除，请修改后再试', { n: id }))
        }
        // 判断项目下是否只有一个分类
        const category = await LCDataService.findOne(TABLE_FILE_NAME.API_CATEGORY, {
            id
        })
        const count = await LCDataService.count(TABLE_FILE_NAME.API_CATEGORY, {
            projectId: category.projectId,
            deleteFlag: 0
        })
        if (count <= 1) {
            throw new Error(global.i18n.t('项目【ID：{{n}}】下只有唯一一个分组，无法删除最后一个分组，请修改后再试', { n: category.projectId }))
        }
        return LCDataService.delete(TABLE_FILE_NAME.API_CATEGORY, id)
    }

    // 获取项目下的api
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/api')
    async getApiList (
        @QueryParams({ name: 'categoryId' }) categoryId,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        const query = {
            projectId,
            deleteFlag: 0
        }
        if (categoryId !== undefined) {
            query.categoryId = categoryId
        }
        const { list: apiList } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.API,
            query
        })
        if (apiList.length) {
            const apiCodeList = apiList.map(api => api.code)
            const { list: funcApiList } = await LCDataService.get({
                tableFileName: TABLE_FILE_NAME.FUNC_API,
                query: {
                    projectId,
                    apiCode: apiCodeList
                }
            })
            apiList.forEach((api) => {
                const filterFuncApiList = funcApiList.filter((funcApi) => {
                    return funcApi.apiCode === api.code
                })
                api.useInfo = {
                    funcCodes: filterFuncApiList.map((filterFuncApi) => filterFuncApi.funcCode)
                }
            })
        }
        return apiList
    }

    // 创建 api
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/api')
    async createApi (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams() form
    ) {
        const hasSameCode = await LCDataService.has(TABLE_FILE_NAME.API, {
            projectId,
            code: form.code,
            deleteFlag: 0
        })
        if (hasSameCode) {
            throw new Error(global.i18n.t('应用[ID: {{0}}]下，已存在同样标识（{{1}}）的Api，请修改后再试', [projectId, form.code]))
        }
        const hasSameName = await LCDataService.has(TABLE_FILE_NAME.API, {
            projectId,
            name: form.name,
            deleteFlag: 0
        })
        if (hasSameName) {
            throw new Error(global.i18n.t('应用[ID: {{0}}]下，已存在同样名称（{{1}}）的Api，请修改后再试', [projectId, form.name]))
        }
        return LCDataService.add(TABLE_FILE_NAME.API, form)
    }

    // 编辑 api
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'API' })
    @Put('/api')
    async editApi (
        @HeaderParams({ name: 'x-project-id', require: true }) projectId,
        @BodyParams() form
    ) {
        form.projectId = projectId
        const sameCodeApi = await LCDataService.findOne(TABLE_FILE_NAME.API, {
            projectId: form.projectId,
            code: form.code,
            deleteFlag: 0
        })
        if (sameCodeApi && sameCodeApi.id !== form.id) {
            throw new Error(global.i18n.t('应用[ID: {{0}}]下，已存在同样标识（{{1}}）的Api，请修改后再试', [form.projectId, form.code]))
        }
        const sameNameApi = await LCDataService.findOne(TABLE_FILE_NAME.API, {
            projectId: form.projectId,
            name: form.name,
            deleteFlag: 0
        })
        if (sameNameApi && sameNameApi.id !== form.id) {
            throw new Error(global.i18n.t('应用[ID: {{0}}]下，已存在同样名称（{{1}}）的Api，请修改后再试', [form.projectId, form.name]))
        }
        return LCDataService.update(TABLE_FILE_NAME.API, form)
    }

    // 删除 api
    @OutputJson()
    @ProjectResAuthorization({ tableName: 'API' })
    @Delete('/api')
    async deleteApi (
        @QueryParams({ name: 'id', require: true }) id
    ) {
        const api = await LCDataService.findOne(TABLE_FILE_NAME.API, {
            id
        })
        const hasUsedInFunction = await LCDataService.has(TABLE_FILE_NAME.FUNC_API, {
            projectId: api.projectId,
            apiCode: api.code
        })
        if (hasUsedInFunction) {
            throw new Error(global.i18n.t('API【code：{{n}}】已经被函数使用，无法删除', { n: api.code }))
        }
        return LCDataService.delete(TABLE_FILE_NAME.API, id)
    }

    // 获取 api 详情
    @OutputJson()
    @ProjectAuthorization({})
    @Get('/api/detail')
    apiDetail (
        @QueryParams() query,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        return LCDataService.findOne(TABLE_FILE_NAME.API, {
            ...query,
            projectId
        })
    }
}
