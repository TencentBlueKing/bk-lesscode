import { getRepository } from 'typeorm'

import IamMigraion from '../model/entities/iam-migration'

import http from '../utils/http'

import { IAM_HOST, IAM_APP_ID, IAM_APP_SECRET, IAM_PROVIDER_HOST } from '../conf/iam'

import { IAM_ACTION } from '../utils/constant'

import { logger } from '../logger'

// 资源类型 ID
const RESOURCE_TYPE_ID = 'app'
// 实例视图 ID
const INSTANCE_SELECTION_ID = 'app_list'

async function sendReq (url, data, method, idx) {
    try {
        const res = await http[method](url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
        })

        logger.info(`${idx} response: `)
        logger.info(res)

        return {
            code: 0,
            message: `${idx || sendReq.name}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${idx || sendReq.name}: ${err.message || err}`
        }
    }
}

async function initSystem () {
    return sendReq(
        `${IAM_HOST}/api/v1/model/systems`,
        {
            id: IAM_APP_ID,
            name: 'hiei-test 测试',
            name_en: 'hiei-test-name',
            description: 'hiei-test demo',
            description_en: 'hiei-test demo',
            clients: 'hiei-test',
            provider_config: {
                host: IAM_PROVIDER_HOST,
                auth: 'basic',
                healthz: ''
            }
        },
        'post',
        'initSystem'
    )
}

async function updateSystem () {
    return sendReq(
        `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}`,
        {
            name: 'hiei-test 测试',
            name_en: 'hiei-test-name',
            description: 'hiei-test demo',
            description_en: 'hiei-test demo'
        },
        'put',
        'updateSystem'
    )
}

async function initResourceType () {
    return sendReq(
        `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/resource-types`,
        [
            {
                id: RESOURCE_TYPE_ID,
                name: '应用',
                name_en: 'App',
                description: '应用是...',
                description_en: 'app is a ...',
                parents: [],
                provider_config: {
                    path: '/api/iam/resource'
                },
                version: 1
            }
        ],
        'post',
        'initResourceType'
    )
}

async function updateResourceType () {
    return sendReq(
        `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/resource-types/${RESOURCE_TYPE_ID}`,
        {
            name: '应用',
            name_en: 'App',
            description: '应用是...',
            description_en: 'app is a ...'
        },
        'put',
        'updateResourceType'
    )
}

async function initInstanceSelection () {
    return sendReq(
        `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/instance-selections`,
        [
            {
                id: INSTANCE_SELECTION_ID,
                name: '应用视图',
                name_en: 'App List',
                resource_type_chain: [
                    {
                        // 系统 ID
                        system_id: IAM_APP_ID,
                        // 资源类型 ID
                        id: RESOURCE_TYPE_ID
                    }
                ]
            }
        ],
        'post',
        'initInstanceSelection'
    )
}

async function initAction () {
    const appRelatedResourceTypes = [
        {
            // 系统 ID
            system_id: IAM_APP_ID,
            // 资源类型 ID
            id: RESOURCE_TYPE_ID,
            // 资源类型名称的别名
            name_alias: '应用',
            // 资源类型名称的别名英文名
            name_alias_en: 'app',
            // 关联的实例视图
            related_instance_selections: [
                {
                    // 系统 ID
                    system_id: IAM_APP_ID,
                    // 实例视图 ID
                    id: INSTANCE_SELECTION_ID
                }
            ]
        }
    ]
    return sendReq(
        `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/actions`,
        [
            {
                id: IAM_ACTION.DEVELOP_APP,
                name: '应用开发',
                name_en: 'Develop App',
                description: '用户是否能够开发应用',
                description_en: 'Is allowed to develop app',
                type: '',
                related_resource_types: appRelatedResourceTypes,
                version: 1
            },
            {
                id: IAM_ACTION.DEPLOY_APP,
                name: '应用部署',
                name_en: 'Deploy App',
                description: '用户是否能够部署应用',
                description_en: 'Is allowed to deploy app',
                type: '',
                related_resource_types: appRelatedResourceTypes,
                version: 1
            },
            {
                id: IAM_ACTION.MANAGE_PERMS_IN_APP,
                name: '应用内权限设计',
                name_en: 'Manage Perms In App',
                description: '用户是否能够进行应用内权限设计的操作',
                description_en: 'Is allowed to manage perms in app',
                type: '',
                related_resource_types: appRelatedResourceTypes,
                version: 1
            },
            {
                id: IAM_ACTION.MANAGE_APP,
                name: '应用管理',
                name_en: 'Manage App',
                description: '用户是否能够管理应用',
                description_en: 'Is allowed to manage app',
                type: '',
                related_resource_types: appRelatedResourceTypes,
                related_actions: [IAM_ACTION.DEVELOP_APP, IAM_ACTION.DEPLOY_APP, IAM_ACTION.MANAGE_PERMS_IN_APP],
                version: 1
            },
            {
                id: IAM_ACTION.MANAGE_PLATFORM,
                name: '平台管理',
                name_en: 'Manage Platform',
                description: '用户是否能够管理平台',
                description_en: 'Is allowed to manage platform',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.MANAGE_FUNCTION,
                name: '函数管理',
                name_en: 'Manage Function',
                description: '用户是否能够管理函数',
                description_en: 'Is allowed to manage function',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.MANAGE_TEMPLATE,
                name: '模板管理',
                name_en: 'Manage Template',
                description: '用户是否能够管理模板',
                description_en: 'Is allowed to manage template',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.VIEW_OPERATION_DATA,
                name: '运营数据查看',
                name_en: 'View Operation Data',
                description: '用户是否能够查看运营数据',
                description_en: 'Is allowed to view operation data',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.CREATE_APP,
                name: '应用新建',
                name_en: 'Create App',
                description: '用户是否能够新建应用',
                description_en: 'Is allowed to create app',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.CREATE_APP_WITH_TEMPLATE,
                name: '应用公开模板创建为新应用',
                name_en: 'Create App With Template',
                description: '用户是否能够基于应用公开模板创建应用',
                description_en: 'Is allowed to create app with template',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.PREVIEW_APP_TEMPLATE,
                name: '应用公开模板预览',
                name_en: 'Preview App Template',
                description: '用户是否能够预览应用公开模板',
                description_en: 'Is allowed to preview app template',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.DOWNLOAD_APP_TEMPLATE_SOURCE,
                name: '应用公开模板源码下载',
                name_en: 'Download App Template Source',
                description: '用户是否能够下载应用公开模板源码',
                description_en: 'Is allowed to download app template source',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.CREATE_PAGE_WITH_TEMPLATE,
                name: '页面公开模板添加至应用',
                name_en: 'Create Page With Template',
                description: '用户是否能够基于页面公开模板创建页面',
                description_en: 'Is allowed to create page with template',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.PREVIEW_PAGE_TEMPLATE,
                name: '页面公开模板预览',
                name_en: 'Preview Page Template',
                description: '用户是否能够预览页面公开模板',
                description_en: 'Is allowed to preview page template',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.DOWNLOAD_PAGE_TEMPLATE_SOURCE,
                name: '页面公开模板源码下载',
                name_en: 'Download Page Template Source',
                description: '用户是否能够下载页面公开模板源码',
                description_en: 'Is allowed to download page template source',
                type: '',
                version: 1
            }
        ],
        'post',
        'initAction'
    )
}

async function initActionGroups () {
    return sendReq(
        `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/configs/action_groups`,
        [
            {
                name: '应用权限',
                name_en: 'App Permissions',
                actions: [
                    { id: IAM_ACTION.DEVELOP_APP },
                    { id: IAM_ACTION.DEPLOY_APP },
                    { id: IAM_ACTION.MANAGE_PERMS_IN_APP },
                    { id: IAM_ACTION.MANAGE_APP },
                    { id: IAM_ACTION.CREATE_APP }
                ]
            },
            {
                name: '平台权限',
                name_en: 'Platform Permissions',
                actions: [
                    { id: IAM_ACTION.MANAGE_PLATFORM },
                    { id: IAM_ACTION.MANAGE_FUNCTION },
                    { id: IAM_ACTION.MANAGE_TEMPLATE },
                    { id: IAM_ACTION.VIEW_OPERATION_DATA }
                ]
            },
            {
                name: '模板权限',
                name_en: 'Template Permissions',
                actions: [
                    { id: IAM_ACTION.CREATE_APP_WITH_TEMPLATE },
                    { id: IAM_ACTION.PREVIEW_APP_TEMPLATE },
                    { id: IAM_ACTION.DOWNLOAD_APP_TEMPLATE_SOURCE },
                    { id: IAM_ACTION.CREATE_PAGE_WITH_TEMPLATE },
                    { id: IAM_ACTION.PREVIEW_PAGE_TEMPLATE },
                    { id: IAM_ACTION.DOWNLOAD_PAGE_TEMPLATE_SOURCE }
                ]
            }
        ],
        'post',
        'initActionGroups'
    )
}

// async function updateAction () {
//     return sendReq(
//         `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/actions/download_page_template_source`,
//         {
//             name: '页面公开模板源码下载'
//         },
//         'put',
//         'updateAction'
//     )
// }

// 将函数名称写到这个数组里，函数会自动执行，返回成功则后续不会再执行
const iamMap = {
    initSystem,
    updateSystem,
    initResourceType,
    updateResourceType,
    initInstanceSelection,
    initAction,
    initActionGroups
    // updateAction
}

export const executeIamMigration = async () => {
    const iamRecords = await getRepository(IamMigraion).find()
    console.log('start executeIamMigration')
    const keyArr = Object.keys(iamMap)
    for (let index = 0; index < keyArr.length; index++) {
        const key = keyArr[index]
        if (!iamRecords.find(item => item.name === key)) {
            // 一开始执行这个方法就插入到数据库，后面执行失败了（下面 else 分支）再删掉这行记录。避免多机部署时会插入多条记录问题
            const res = await getRepository(IamMigraion).save([{ name: key }])
            const id = res[0] && res[0].id
            const result = await iamMap[key]()
            if (result && result.code === 0) {
                console.log(result.message)
            } else {
                console.log(result.message)
                const deleteRes = await getRepository(IamMigraion).delete({ id })
                console.log(deleteRes, 'delete')
            }
        }
    }
    console.log('end executeIamMigration')
}
