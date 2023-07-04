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
 * 接口权限配置
 * permCodes: 需要的权限列表
 * message: 不满足权限给出的提示，默认值：暂无执行该操作权限，请联系项目管理员开通权限后重试
 */

const POST_PAGE_CREATE = 'POST-/api/page/create'
const PUT_PAGE_UPDATE = 'PUT-/api/page/update'
const POST_COMPONENT_CREATE = 'POST-/api/component/create'
const POST_COMPONENT_UPDATE = 'POST-/api/component/update'
const POST_COMPONENT_OFF = 'POST-/api/component/off'
const POST_COMPONENT_ONLINE = 'POST-/api/component/online'

module.exports = {
    POST_PAGE_CREATE,
    PUT_PAGE_UPDATE,
    POST_COMPONENT_CREATE,
    POST_COMPONENT_UPDATE,
    POST_COMPONENT_OFF,
    POST_COMPONENT_ONLINE,
    locations () {
        return {
            // 项目
            'POST-/api/project/create': {
                code: 'create_project',
                codeText: global.i18n.t('创建应用'),
                target (req, res) {
                    return global.i18n.t('应用名称：{{0}}', [req.body.projectName])
                },
                manualSuccess: false,
                manualFail: false
            },
            'PUT-/api/project/update': {
                code: 'update_project',
                codeText: global.i18n.t('更新应用'),
                target (req, res) {
                    const projectId = req.body.id
                    const { projectName, projectDesc, appCode, moduleCode } = req.body.fields
                    if (projectName || projectDesc) {
                        return global.i18n.t('基本信息（应用ID：{{0}}）', [projectId])
                    }
                    if (appCode || moduleCode) {
                        return global.i18n.t('绑定应用信息（应用ID：{{0}}）', [projectId])
                    }
                    return 'unknown'
                }
            },
            'GET-/api/projectCode/downloadCode': {
                code: 'download_project',
                codeText: global.i18n.t('下载应用源码'),
                manualSuccess: true,
                manualFail: true
            },

            // 页面
            [POST_PAGE_CREATE]: {
                code: 'create_page',
                codeText: global.i18n.t('创建页面'),
                target (req) {
                    if (req.path.indexOf('checkName') !== -1) {
                        return global.i18n.t('页面名称：{{0}}', [req.body.pageName])
                    }
                    return global.i18n.t('页面名称：{{0}}', [req.body.pageData.pageName])
                }
            },
            [PUT_PAGE_UPDATE]: {
                code: 'update_page',
                codeText: global.i18n.t('更新页面'),
                target (req) {
                    const { pageData = {}, from, currentName } = req.body
                    if (req.path.indexOf('checkName') !== -1) {
                        return global.i18n.t('基本信息（页面名称：{{0}}）', [currentName])
                    } else if (from !== 'setting' && pageData.content) {
                        return global.i18n.t('画布（页面ID：{{0}}）', [pageData.id])
                    } else if (pageData.pageName) {
                        return global.i18n.t('基本信息（页面名称：{{0}}）', [pageData.pageName])
                    } else {
                        return global.i18n.t('基本信息（页面ID：{{0}}）', [pageData.id])
                    }
                },
                ignore (req) {
                    const { pageData, from } = req.body
                    if (from !== 'setting' && pageData.previewImg) {
                        return true
                    }
                    if (from === 'preview') {
                        return true
                    }
                    return false
                }
            },
            'DELETE-/api/page/delete': {
                code: 'delete_page',
                codeText: global.i18n.t('删除页面'),
                target (req) {
                    const { pageId } = req.query
                    return global.i18n.t('页面ID：{{0}}', [pageId])
                }
            },
            'POST-/api/vueCode/getPageCode': {
                code: 'download_page',
                codeText: global.i18n.t('下载页面源码'),
                target (req) {
                    const { pageId } = req.body
                    return global.i18n.t('页面ID：{{0}}', [pageId])
                },
                manualSuccess: true,
                manualFail: true
            },

            // 自定义组件
            [POST_COMPONENT_CREATE]: {
                code: 'add_component',
                codeText: global.i18n.t('创建自定义组件'),
                manualSuccess: true,
                manualFail: true
            },
            [POST_COMPONENT_UPDATE]: {
                code: 'update_component',
                codeText: global.i18n.t('更新自定义组件'),
                manualSuccess: true,
                manualFail: true
            },
            [POST_COMPONENT_OFF]: {
                code: 'offline_component',
                codeText: global.i18n.t('下架自定义组件'),
                manualSuccess: true,
                manualFail: true
            },
            [POST_COMPONENT_ONLINE]: {
                code: 'online_component',
                codeText: global.i18n.t('上架自定义组件'),
                manualSuccess: true,
                manualFail: true
            },

            // 自定义组件分类
            'POST-/api/componentCategory/create': {
                code: 'add_component_category',
                codeText: global.i18n.t('添加自定义组件分类'),
                manualSuccess: true,
                manualFail: true
            },
            'POST-/api/componentCategory/update': {
                code: 'update_component_category',
                codeText: global.i18n.t('更新自定义组件分类'),
                manualSuccess: true,
                manualFail: true
            },
            'DELETE-/api/componentCategory/delete': {
                code: 'delete_component_category',
                codeText: global.i18n.t('删除自定义组件分类'),
                manualSuccess: true,
                manualFail: true
            },
            'PUT-/api/component/page-using-version': {
                code: 'update-using-version_component',
                codeText: global.i18n.t('升级使用中的自定义组件'),
                manualSuccess: true,
                manualFail: true
            },

            // 函数
            'POST-/api/function/addFunction': {
                code: 'add_func',
                codeText: global.i18n.t('创建函数'),
                manualSuccess: true,
                manualFail: true
            },
            'PUT-/api/function/editFunction': {
                code: 'update_func',
                codeText: global.i18n.t('更新函数'),
                manualSuccess: true,
                manualFail: true
            },
            'DELETE-/api/function/deleteFunction': {
                code: 'delete_func',
                codeText: global.i18n.t('删除函数'),
                manualSuccess: true,
                manualFail: true
            },

            // 函数分类
            'POST-/api/function/addFuncGroup': {
                code: 'add_func_group',
                codeText: global.i18n.t('添加函数分类'),
                manualSuccess: true,
                manualFail: true
            },
            'PUT-/api/function/editFuncGroups': {
                code: 'update_func_group',
                codeText: global.i18n.t('更新函数分类'),
                manualSuccess: true,
                manualFail: true
            },
            'DELETE-/api/function/deleteFuncGroup': {
                code: 'delete_func_group',
                codeText: global.i18n.t('删除函数分类'),
                manualSuccess: true,
                manualFail: true
            }
        }
    },
    objNameMap () {
        return {
            'project': global.i18n.t('应用'),
            'page': global.i18n.t('页面'),
            'component': global.i18n.t('menu_自定义组件'),
            'component_category': global.i18n.t('自定义组件分类'),
            'func': global.i18n.t('函数'),
            'func_group': global.i18n.t('函数分类')
        }
    }
}
