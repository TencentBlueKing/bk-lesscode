import { getRepository } from 'typeorm'

import UserProjectRole from '../model/entities/user-project-role'
import Project from '../model/entities/project'
import User from '../model/entities/user'
import IamMigraion from '../model/entities/iam-migration'
import http from '../utils/http'
import { IAM_HOST, IAM_APP_ID, IAM_APP_SECRET, IAM_PROVIDER_HOST } from '../conf/iam'
import { IAM_ACTION, IAM_RESOURCE_TYPE_ID, IAM_INSTANCE_SELECTION_ID } from '../../shared/constant.js'
import { arrayGroupBy } from '../../shared/util.js'
import { logger } from '../logger'

export const sendReq = async (url, data, method, idx) => {
    try {
        let res
        if (method === 'delete') {
            res = await http[method](url, {
                data,
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })
        } else {
            res = await http[method](url, data, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: IAM_APP_ID,
                        bk_app_secret: IAM_APP_SECRET
                    })
                }
            })
        }

        logger.info(`${idx} response: ${JSON.stringify(res)}`)
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
            name: global.i18n.t('蓝鲸运维开发平台'),
            name_en: 'lesscode',
            description: global.i18n.t('蓝鲸运维开发平台提供了前端页面在线可视化拖拽组装、配置编辑、源码生成、二次开发等能力。旨在帮助用户快速设计和开发 SaaS。'),
            description_en: 'BlueKing LessCode provides the front-end page online visual drag-and-drop assembly, configuration editing, source code generation, secondary development and other capabilities. Designed to help users quickly design and develop SaaS with as little handwritten code as possible.',
            clients: 'lesscode',
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
            name: global.i18n.t('蓝鲸运维开发平台_0'),
            name_en: 'lesscode',
            description: global.i18n.t('蓝鲸运维开发平台提供了前端页面在线可视化拖拽组装、配置编辑、源码生成、二次开发等能力。旨在帮助用户快速设计和开发 SaaS。_0'),
            description_en: 'BlueKing LessCode provides the front-end page online visual drag-and-drop assembly, configuration editing, source code generation, secondary development and other capabilities. Designed to help users quickly design and develop SaaS with as little handwritten code as possible.',
            clients: 'lesscode',
            provider_config: {
                host: IAM_PROVIDER_HOST,
                auth: 'basic',
                healthz: ''
            }
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
                id: IAM_RESOURCE_TYPE_ID,
                name: global.i18n.t('应用'),
                name_en: 'App',
                description: global.i18n.t('应用是...'),
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
        `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/resource-types/${IAM_RESOURCE_TYPE_ID}`,
        {
            name: global.i18n.t('应用_0'),
            name_en: 'App',
            description: global.i18n.t('应用是..._0'),
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
                id: IAM_INSTANCE_SELECTION_ID,
                name: global.i18n.t('应用视图'),
                name_en: 'App List',
                resource_type_chain: [
                    {
                        // 系统 ID
                        system_id: IAM_APP_ID,
                        // 资源类型 ID
                        id: IAM_RESOURCE_TYPE_ID
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
            id: IAM_RESOURCE_TYPE_ID,
            // 资源类型名称的别名
            name_alias: global.i18n.t('应用_1'),
            // 资源类型名称的别名英文名
            name_alias_en: 'app',
            // 关联的实例视图
            related_instance_selections: [
                {
                    // 系统 ID
                    system_id: IAM_APP_ID,
                    // 实例视图 ID
                    id: IAM_INSTANCE_SELECTION_ID
                }
            ]
        }
    ]
    return sendReq(
        `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/actions`,
        [
            {
                id: IAM_ACTION.develop_app[0],
                name: IAM_ACTION.develop_app[1],
                name_en: 'Develop App',
                description: IAM_ACTION.develop_app[2],
                description_en: 'Is allowed to develop app',
                type: '',
                related_resource_types: appRelatedResourceTypes,
                version: 1
            },
            {
                id: IAM_ACTION.deploy_app[0],
                name: IAM_ACTION.deploy_app[1],
                name_en: 'Deploy App',
                description: IAM_ACTION.deploy_app[2],
                description_en: 'Is allowed to deploy app',
                type: '',
                related_resource_types: appRelatedResourceTypes,
                version: 1
            },
            {
                id: IAM_ACTION.manage_perms_in_app[0],
                name: IAM_ACTION.manage_perms_in_app[1],
                name_en: 'Manage Perms In App',
                description: IAM_ACTION.manage_perms_in_app[2],
                description_en: 'Is allowed to manage perms in app',
                type: '',
                related_resource_types: appRelatedResourceTypes,
                version: 1
            },
            {
                id: IAM_ACTION.manage_app[0],
                name: IAM_ACTION.manage_app[1],
                name_en: 'Manage App',
                description: IAM_ACTION.manage_app[2],
                description_en: 'Is allowed to manage app',
                type: '',
                related_resource_types: appRelatedResourceTypes,
                related_actions: [IAM_ACTION.develop_app[0], IAM_ACTION.deploy_app[0], IAM_ACTION.manage_perms_in_app[0]],
                version: 1
            },
            {
                id: IAM_ACTION.manage_platform[0],
                name: IAM_ACTION.manage_platform[1],
                name_en: 'Manage Platform',
                description: IAM_ACTION.manage_platform[2],
                description_en: 'Is allowed to manage platform',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.manage_function[0],
                name: IAM_ACTION.manage_function[1],
                name_en: 'Manage Function',
                description: IAM_ACTION.manage_function[2],
                description_en: 'Is allowed to manage function',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.manage_template[0],
                name: IAM_ACTION.manage_template[1],
                name_en: 'Manage Template',
                description: IAM_ACTION.manage_template[2],
                description_en: 'Is allowed to manage template',
                type: '',
                version: 1
            },
            {
                id: IAM_ACTION.view_operation_data[0],
                name: IAM_ACTION.view_operation_data[1],
                name_en: 'View Operation Data',
                description: IAM_ACTION.view_operation_data[2],
                description_en: 'Is allowed to view operation data',
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
                name: global.i18n.t('应用权限'),
                name_en: 'App Permissions',
                actions: [
                    { id: IAM_ACTION.develop_app[0] },
                    { id: IAM_ACTION.deploy_app[0] },
                    { id: IAM_ACTION.manage_perms_in_app[0] },
                    { id: IAM_ACTION.manage_app[0] }
                ]
            },
            {
                name: global.i18n.t('平台权限'),
                name_en: 'Platform Permissions',
                actions: [
                    { id: IAM_ACTION.manage_platform[0] },
                    { id: IAM_ACTION.manage_function[0] },
                    { id: IAM_ACTION.manage_template[0] },
                    { id: IAM_ACTION.view_operation_data[0] }
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

async function grant (actions, resources, username) {
    try {
        const params = {
            asynchronous: false,
            operate: 'grant',
            system: IAM_APP_ID,
            actions: actions.map(item => {
                return { id: item }
            }),
            subject: {
                type: 'user',
                id: username
            },
            resources: resources
        }

        const res = await http.post(`${IAM_HOST}/api/v1/open/authorization/batch_path/`, params, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
        })

        return res
    } catch (e) {
        return e
    }
}

async function createManager (actions, username, projectId, projectCode, projectName) {
    try {
        const params = {
            system: IAM_APP_ID,
            name: global.i18n.t('{{n}}分级管理员', { n: projectCode }),
            description: global.i18n.t('LessCode 平台 {{n}} 应用的分级管理员', { n: projectName }),
            members: [username],
            authorization_scopes: [
                {
                    system: IAM_APP_ID,
                    actions: actions.map(item => {
                        return { id: item }
                    }),
                    resources: [
                        {
                            system: IAM_APP_ID,
                            type: IAM_RESOURCE_TYPE_ID,
                            paths: [
                                [
                                    {
                                        system: IAM_APP_ID,
                                        type: IAM_RESOURCE_TYPE_ID,
                                        id: projectId,
                                        name: `${projectCode}_${projectId}`
                                    }
                                ]
                            ]
                        }
                    ]
                }
            ],
            // 可授权范围为所有
            subject_scopes: [
                {
                    type: '*',
                    id: '*'
                }
            ]
        }

        const res = await http.post(`${IAM_HOST}/api/v1/open/management/grade_managers/`, params, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
        })

        return res
    } catch (e) {
        return e
    }
}

// 平台内部老的权限迁移至权限中心
async function iamTrans () {
    try {
        // SELECT
        //     r.roleId, r.userId, u.username, r.projectId, p.projectName, p.projectCode,
        //     r.createUser AS rUserProjectRoleCreator, p.createUser AS projectCreator
        // FROM r_user_project_role r
        // INNER JOIN project p ON p.id = r.projectId
        // INNER JOIN user u ON u.id = r.userId
        // WHERE r.deleteFlag != 1
        // ORDER BY projectId ASC;
        const userRoleProjectData = await getRepository(UserProjectRole).createQueryBuilder('user_project_role')
            .innerJoin(Project, 'p', 'p.id = user_project_role.projectId')
            .innerJoin(User, 'u', 'u.id = user_project_role.userId')
            .where('user_project_role.deleteFlag != 1')
            .select(
                'user_project_role.roleId, user_project_role.userId, '
                    + 'u.username, user_project_role.projectId, '
                    + 'p.projectName, p.projectCode, user_project_role.createUser, p.createUser'
            )
            .getRawMany()

        const handleGrantApp = async (list, actions, isManage) => {
            const groupedData = arrayGroupBy(list, 'projectId')
            const groupedDataKeyArr = Object.keys(groupedData)
            const failedList = []
            for (let index = 0; index < groupedDataKeyArr.length; index++) {
                const key = groupedDataKeyArr[index]
                const grantList = groupedData[key]
                for (let j = 0; j < grantList.length; j++) {
                    const grantRes = await grant(
                        actions,
                        [
                            {
                                system: IAM_APP_ID,
                                type: IAM_RESOURCE_TYPE_ID,
                                paths: [
                                    [
                                        {
                                            type: IAM_RESOURCE_TYPE_ID,
                                            id: grantList[j].projectId,
                                            name: `${grantList[j].projectCode}_${grantList[j].projectId}`
                                        }
                                    ]
                                ]
                            }
                        ],
                        grantList[j].username
                    )

                    if (grantRes.code !== 0) {
                        failedList.push({
                            projectId: grantList[j].projectId,
                            projectCode: grantList[j].projectCode,
                            projectName: grantList[j].projectName,
                            userId: grantList[j].userId,
                            username: grantList[j].username,
                            iamCode: grantRes.code,
                            iamMessage: grantRes.message
                        })
                    }

                    if (isManage) {
                        const createManagerRes = await createManager(
                            actions,
                            grantList[j].username,
                            grantList[j].projectId,
                            grantList[j].projectCode,
                            grantList[j].projectName
                        )

                        if (createManagerRes.code !== 0) {
                            failedList.push({
                                projectId: grantList[j].projectId,
                                projectCode: grantList[j].projectCode,
                                projectName: grantList[j].projectName,
                                userId: grantList[j].userId,
                                username: grantList[j].username,
                                iamCode: createManagerRes.code,
                                iamMessage: createManagerRes.message
                            })
                        }
                    }
                }
            }
            return failedList
        }

        // 处理应用管理的数据
        const manageAppFailedList = await handleGrantApp(
            userRoleProjectData.filter(item => String(item.roleId) === '1'),
            [
                IAM_ACTION.develop_app[0], IAM_ACTION.deploy_app[0],
                IAM_ACTION.manage_perms_in_app[0], IAM_ACTION.manage_app[0]
            ],
            true
        )
        if (manageAppFailedList.length) {
            const msg = global.i18n.t('管理权限迁移失败: {{0}}', { n: JSON.stringify(manageAppFailedList) })
            logger.info(msg)
            // return {
            //     code: -1,
            //     message: msg
            // }
        }

        // 处理应用开发和部署权限的数据，应用开发和部署两个操作在之前的权限系统里没有区分，因此这俩在这里满足一个的话，就都授权
        const devAppFailedList = await handleGrantApp(
            userRoleProjectData.filter(item => String(item.roleId) !== '1'),
            [
                IAM_ACTION.develop_app[0], IAM_ACTION.deploy_app[0], IAM_ACTION.manage_perms_in_app[0]
            ]
        )
        if (devAppFailedList.length) {
            const msg = global.i18n.t('开发部署权限迁移失败: {{n}}', { n: JSON.stringify(devAppFailedList) })
            logger.info(msg)
            // return {
            //     code: -1,
            //     message: msg
            // }
        }

        return {
            code: 0,
            message: `${iamTrans.name}: Insert success`
        }
    } catch (err) {
        console.error(err)
        return {
            code: -1,
            message: `${iamTrans.name}: ${err.message || err}`
        }
    }
}

// 将函数名称写到这个数组里，函数会自动执行，返回成功则后续不会再执行
const iamMap = {
    initSystem,
    updateSystem,
    initResourceType,
    updateResourceType,
    initInstanceSelection,
    initAction,
    initActionGroups,
    iamTrans
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
