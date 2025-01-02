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
    Controller,
    Post,
    Get,
    Put,
    BodyParams,
    PathParams,
    OutputJson,
    QueryParams,
    ProjectAuthorization,
    ProjectResAuthorization,
    HeaderParams
} from '../decorator'
import DBEngineService from '../service/common/db-engine-service'
import {
    TABLE_FILE_NAME,
    LCDataService,
    MoreThan
} from '../service/common/data-service'
import {
    sm4Encrypt,
    sm4Decrypt
} from '../util'

// 用于 third-part-db
@Controller('/api/third-part-db')
export default class ThirdPartDBController {
    @OutputJson()
    @ProjectAuthorization({})
    @Post('/database')
    async addThirdPartDB (
        @BodyParams() data,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        // 反解
        data.password = Buffer.from(data.password, 'base64').toString('utf8')
        data.projectId = projectId
        // 检查数据是否重复
        const db = await LCDataService.findOne(
            TABLE_FILE_NAME.THIRD_PART_DB,
            {
                dbName: data.dbName,
                projectId: data.projectId
            }
        )
        if (db) {
            throw new global.BusinessError(`数据库添加失败：已存在名为${data.dbName}的数据库`)
        }
        // 测试连接性
        const dbEngine = new DBEngineService({
            host: data.host,
            port: data.port,
            user: data.username,
            password: data.password,
            database: data.dbName
        })
        try {
            const pool = dbEngine.getPoolPromise()
            await pool.query('select 1;')
        } catch (error) {
            throw new global.BusinessError('数据库添加失败：' + error.message)
        } finally {
            dbEngine.close()
        }
        // 入库
        await LCDataService.add(
            TABLE_FILE_NAME.THIRD_PART_DB,
            {
                ...data,
                username: sm4Encrypt(data.username),
                password: sm4Encrypt(data.password)
            }
        )
    }

    @OutputJson()
    @ProjectAuthorization({})
    @ProjectResAuthorization({ tableName: 'THIRD_PART_DB' })
    @Put('/database')
    async updateThirdPartDB (
        @BodyParams() data,
        @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        // 反解
        data.password = Buffer.from(data.password, 'base64').toString('utf8')
        // 测试连接性
        const dbEngine = new DBEngineService({
            host: data.host,
            port: data.port,
            user: data.username,
            password: data.password,
            database: data.dbName
        })
        try {
            const pool = dbEngine.getPoolPromise()
            await pool.query('select 1;')
        } catch (error) {
            throw new global.BusinessError('数据库连接失败：' + error.message)
        } finally {
            dbEngine.close()
        }
        // 入库
        await LCDataService.update(
            TABLE_FILE_NAME.THIRD_PART_DB,
            {
                ...data,
                username: sm4Encrypt(data.username),
                password: sm4Encrypt(data.password)
            }
        )
    }

    @OutputJson()
    @ProjectAuthorization({})
    @Get('/database')
    async getThirdPartDB (
      @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.THIRD_PART_DB,
            query: { projectId }
        })

        list.forEach(item => {
            item.username = sm4Decrypt(item.username)
        })

        return list
    }

    @OutputJson()
    @ProjectAuthorization({})
    @Get('/database/:DBId')
    async findThirdPartDB (
      @PathParams({ name: 'DBId' }) id
    ) {
        const db = await LCDataService.findOne(
            TABLE_FILE_NAME.THIRD_PART_DB,
            { id }
        )

        return db
    }

    @OutputJson()
    @ProjectAuthorization({})
    @Get('/get-all-db-tables')
    async getAllDBTables (
      @HeaderParams({ name: 'x-project-id', require: true }) projectId
    ) {
        const [
            { list: dbList },
            { list: tableList }
        ] = await Promise.all([
            LCDataService.get({
                tableFileName: TABLE_FILE_NAME.THIRD_PART_DB,
                query: {
                    projectId,
                    deleteFlag: 0
                }
            }),
            LCDataService.get({
                tableFileName: TABLE_FILE_NAME.DATA_TABLE,
                query: {
                    projectId,
                    deleteFlag: 0,
                    thirdPartDBId: MoreThan(0)
                }
            })
        ])

        dbList.forEach((db) => {
            const currentTableList = tableList.filter(table => table.thirdPartDBId === db.id)
            db.tableList = currentTableList.map(table => ({
                ...table,
                columns: JSON.parse(table.columns)
            }))
        })

        return dbList
    }
}
