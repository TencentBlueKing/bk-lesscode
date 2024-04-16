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

const {
    getProjectTables,
    getProjectTableCols,
    getMyProjectList,
    getProjectReleases,
    getProjectReleasePackage,
    getProjectByBindApp,
    createProjectByBindApp,
    execQuerySql
} = require('../controller/open-api')

module.exports = {
    prefix: '/api/open',
    routes: {
        GET_MY_PROJECT_LIST: ['get', '/get_project_list', getMyProjectList],
        GET_PROJECT_TABLES: ['get', '/get_project_tables', getProjectTables, { accessControl: ['project'] }],
        GET_PROJECT_TABLE_COLS: ['get', '/get_project_table_cols', getProjectTableCols, { accessControl: ['project'] }],
        PROJECT_RELEASES: ['get', '/project/releases', getProjectReleases],
        PROJECT_RELEASE_PACKAGE: ['get', '/project/release/package', getProjectReleasePackage, { accessControl: ['project'] }],
        FIND_PROJECT_BY_APP: ['get', '/find-project-by-app', getProjectByBindApp],
        CREATE_PROJECT_BY_APP: ['post', '/create-project-by-app', createProjectByBindApp],
        EXEC_QUERY_SQL: ['post', '/exec_query_sql', execQuerySql]
    }
}
