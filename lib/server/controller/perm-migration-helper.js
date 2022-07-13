import { getConnection, getRepository } from 'typeorm'

import PermsMigraion from '../model/entities/perms-migration'

import Project from '../model/entities/project'

import http from '../utils/http'

import { iamHost, iamAppId, iamAppSecret, iamProviderConfigHost } from '../conf/http'

async function updateSystem () {
    console.error('updateSystemupdateSystem')
    const projectRepo = getRepository(Project)
    try {
        await getConnection().transaction(async transactionalEntityManager => {
            const projectList = await projectRepo.find()

            projectList.map(project => {
                const { id, createTime, updateTime, createUser, updateUser } = project
                return {
                    name: '默认分类',
                    belongProjectId: id,
                    createTime,
                    updateTime,
                    createUser,
                    updateUser
                }
            })

            const url = `${iamHost}/dev/api/v1/model/systems/${iamAppId}`
            const data = {
                'id': iamAppId,
                'name': 'lesscode 测试11',
                'name_en': 'hiei-test-name',
                'description': 'hiei-test demo',
                'description_en': 'hiei-test demo',
                'clients': 'demo',
                'provider_config': {
                    'host': iamProviderConfigHost,
                    'auth': 'basic',
                    'healthz': ''
                }
            }

            const res = await http.put(url, data, {
                headers: {
                    'X-Bkapi-Authorization': JSON.stringify({
                        bk_app_code: iamAppId,
                        bk_app_secret: iamAppSecret
                    })
                }
            })
            console.error(res)
        })
        return {
            code: 0,
            message: `${updateSystem.name}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${updateSystem.name}: ${err.message || err}`
        }
    }
}

async function initResourceType () {
    try {
        const url = `${iamHost}/dev/api/v1/model/systems/${iamAppId}/resource-types`
        const data = [
            {
                'id': 'app',
                'name': '应用',
                'name_en': 'app',
                'description': '应用是...',
                'description_en': 'app is a ...',
                'parents': [],
                'provider_config': {
                    'path': '/api/project/project_list'
                },
                'version': 1
            }
        ]

        const res = await http.post(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: iamAppId,
                    bk_app_secret: iamAppSecret
                })
            }
        })
        console.error(res)
        return {
            code: 0,
            message: `${initResourceType.name}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${initResourceType.name}: ${err.message || err}`
        }
    }
}

async function updateResourceType () {
    try {
        const url = `${iamHost}/dev/api/v1/model/systems/${iamAppId}/resource-types/app`
        const data = {
            'id': 'app',
            'name': '应用',
            'name_en': 'app',
            'description': '应用是...',
            'description_en': 'app is a ...',
            'parents': [],
            'provider_config': {
                'path': '/api/project/project_list'
            },
            'version': 1
        }

        const res = await http.put(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: iamAppId,
                    bk_app_secret: iamAppSecret
                })
            }
        })
        console.error(res)
        return {
            code: 0,
            message: `${updateResourceType.name}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${updateResourceType.name}: ${err.message || err}`
        }
    }
}

async function initInstanceSelection () {
    try {
        const url = `${iamHost}/dev/api/v1/model/systems/${iamAppId}/instance-selections`
        const data = [
            {
                'id': 'app_list',
                'name': '应用视图',
                'name_en': 'app_list',
                'resource_type_chain': [
                    {
                        // 系统 ID
                        'system_id': iamAppId,
                        // 资源类型 ID
                        'id': 'app'
                    }
                ]
            }
        ]

        const res = await http.post(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: iamAppId,
                    bk_app_secret: iamAppSecret
                })
            }
        })
        console.error(res)
        return {
            code: 0,
            message: `${initInstanceSelection.name}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${initInstanceSelection.name}: ${err.message || err}`
        }
    }
}

async function initAction () {
    try {
        const url = `${iamHost}/dev/api/v1/model/systems/${iamAppId}/actions`
        const data = [
            // {
            //     'id': 'access_developer_center',
            //     'name': '访问开发者中心',
            //     'name_en': 'access developer center',
            //     'description': '一个用户是否能访问开发者中心',
            //     'description_en': 'Is allowed to access the developer center',
            //     'type': 'create',
            //     'related_resource_types': [],
            //     'version': 1
            // },
            {
                'id': 'develop_app',
                'name': '应用开发',
                'name_en': 'develop app',
                'description': '一个用户是否能够开发应用',
                'description_en': 'Is allowed to develop app',
                'type': '',
                'related_resource_types': [
                    {
                        // 系统 ID
                        'system_id': iamAppId,
                        // 资源类型 ID
                        'id': 'app',
                        // 资源类型名称的别名
                        'name_alias': '应用',
                        // 资源类型名称的别名英文名
                        'name_alias_en': 'app',
                        // 关联的实例视图
                        'related_instance_selections': [
                            {
                                // 系统 ID
                                'system_id': iamAppId,
                                // 实例视图 ID
                                'id': 'app_list'
                            }
                        ]
                    }
                ],
                'version': 1
            }
        ]

        const res = await http.post(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: iamAppId,
                    bk_app_secret: iamAppSecret
                })
            }
        })
        console.error(res)
        return {
            code: 0,
            message: `${initAction.name}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${initAction.name}: ${err.message || err}`
        }
    }
}

// 将函数名称写到这个数组里，函数会自动执行，返回成功则后续不会再执行
const permsMap = {
    updateSystem,
    initResourceType,
    updateResourceType,
    initInstanceSelection,
    initAction
}

export const executePermMigration = async () => {
    const permsRecords = await getRepository(PermsMigraion).find()
    console.log('start')
    const keyArr = Object.keys(permsMap)
    for (let index = 0; index < keyArr.length; index++) {
        const key = keyArr[index]
        if (!permsRecords.find(item => item.name === key)) {
            // 一开始执行这个方法就插入到数据库，后面执行失败了（下面 else 分支）再删掉这行记录。避免多机部署时会插入多条记录问题
            const res = await getRepository(PermsMigraion).save([{ name: key }])
            const id = res[0] && res[0].id
            const result = await permsMap[key]()
            if (result && result.code === 0) {
                console.log(result.message)
            } else {
                console.log(result.message)
                const deleteRes = await getRepository(PermsMigraion).delete({ id })
                console.log(deleteRes, 'delete')
            }
        }
    }
    console.log('end')
}
