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

/**
 * 数据类型
 */
export const DATA_TYPES = {
    STRING: {
        TYPE: '[object String]',
        VAL: 'string'
    },
    ARRAY: {
        TYPE: '[object Array]',
        VAL: 'array'
    },
    OBJECT: {
        TYPE: '[object Object]',
        VAL: 'object'
    },
    BOOLEAN: {
        TYPE: '[object Boolean]',
        VAL: 'boolean'
    },
    NUMBER: {
        TYPE: '[object Number]',
        VAL: 'number'
    },
    NULL: {
        TYPE: '[object Null]',
        VAL: 'null'
    },
    UNDEFINED: {
        TYPE: '[object Undefined]',
        VAL: 'undefined'
    },
    SYMBOL: {
        TYPE: '[object Symbol]',
        VAL: 'symbol'
    },
    FUNCTION: {
        TYPE: '[object Function]',
        VAL: 'function'
    }
}

// 权限中心操作集合
export const IAM_ACTION = {
    // 应用开发
    develop_app: ['develop_app', '应用开发', '用户是否能够开发应用'],
    // 应用部署
    deploy_app: ['deploy_app', '应用部署', '用户是否能够部署应用'],
    // 应用内权限设计
    manage_perms_in_app: ['manage_perms_in_app', '应用内权限设计', '用户是否能够进行应用内权限设计的操作'],
    // 应用管理
    manage_app: ['manage_app', '应用管理', '用户是否能够管理应用级权限及应用内权限设计'],
    // 平台管理
    manage_platform: ['manage_platform', '平台管理', '用户是否能够管理平台'],
    // 函数管理
    manage_function: ['manage_function', '函数管理', '用户是否能够管理函数'],
    // 模板管理
    manage_template: ['manage_template', '模板管理', '用户是否能够管理模板'],
    // 运营数据查看
    view_operation_data: ['view_operation_data', '运营数据查看', '用户是否能够查看运营数据'],
    // 应用新建
    create_app: ['create_app', '应用新建', '用户是否能够新建应用'],
    // 应用公开模板创建为新应用
    create_app_with_template: ['create_app_with_template', '应用公开模板创建为新应用', '用户是否能够基于应用公开模板创建应用'],
    // 应用公开模板预览
    preview_app_template: ['preview_app_template', '应用公开模板预览', '用户是否能够预览应用公开模板'],
    // 应用公开模板源码下载
    download_app_template_source: ['download_app_template_source', '应用公开模板源码下载', '用户是否能够下载应用公开模板源码'],
    // 页面公开模板添加至应用
    create_page_with_template: ['create_page_with_template', '页面公开模板添加至应用', '用户是否能够基于页面公开模板创建页面'],
    // 页面公开模板预览
    preview_page_template: ['preview_page_template', '页面公开模板预览', '用户是否能够预览页面公开模板'],
    // 页面公开模板源码下载
    download_page_template_source: ['download_page_template_source', '页面公开模板源码下载', '用户是否能够下载页面公开模板源码']
}

// 资源类型 ID
export const IAM_RESOURCE_TYPE_ID = 'app'

// 实例视图 ID
export const IAM_INSTANCE_SELECTION_ID = 'app_list'

// 应用权限模型-资源类型 ID
export const IAM_APP_PERM_RESOURCE_TYPE_ID = 'page'

// 应用权限模型-实例视图 ID
export const IAM_APP_PERM_INSTANCE_SELECTION_ID = 'page_list'
