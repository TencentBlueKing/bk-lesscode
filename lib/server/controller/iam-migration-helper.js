import { getRepository } from 'typeorm'

import IamMigraion from '../model/entities/iam-migration'

import http from '../utils/http'

import { IAM_HOST, IAM_APP_ID, IAM_APP_SECRET, IAM_PROVIDER_HOST } from '../conf/iam'

async function initSystem () {
    try {
        const url = `${IAM_HOST}/api/v1/model/systems`
        const data = {
            'id': IAM_APP_ID,
            'name': 'lesscode 测试',
            'name_en': 'hiei-test-name',
            'description': 'hiei-test demo',
            'description_en': 'hiei-test demo',
            'clients': 'hiei-test',
            'provider_config': {
                'host': IAM_PROVIDER_HOST,
                'auth': 'basic',
                'healthz': ''
            }
        }

        await http.post(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
        })

        return {
            code: 0,
            message: `${initSystem.name}: Insert success`
        }
    } catch (err) {
        return {
            code: -1,
            message: `${initSystem.name}: ${err.message || err}`
        }
    }
}

async function updateSystem () {
    try {
        const url = `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}`
        const data = {
            'id': IAM_APP_ID,
            'name': 'lesscode 测试',
            'name_en': 'hiei-test-name',
            'description': 'hiei-test demo',
            'description_en': 'hiei-test demo',
            'clients': 'hiei-test',
            'provider_config': {
                'host': IAM_PROVIDER_HOST,
                'auth': 'basic',
                'healthz': ''
            }
        }

        await http.put(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
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
        const url = `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/resource-types`
        const data = [
            {
                'id': 'app',
                'name': '应用',
                'name_en': 'app',
                'description': '应用是...',
                'description_en': 'app is a ...',
                'parents': [],
                'provider_config': {
                    'path': '/api/iam/resource'
                },
                'version': 1
            }
        ]

        await http.post(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
        })

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
        const url = `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/resource-types/app`
        const data = {
            'id': 'app',
            'name': '应用',
            'name_en': 'app',
            'description': '应用是...',
            'description_en': 'app is a ...',
            'parents': [],
            'provider_config': {
                'path': '/api/iam/resource'
            },
            'version': 1
        }

        await http.put(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
        })

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
        const url = `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/instance-selections`
        const data = [
            {
                'id': 'app_list',
                'name': '应用视图',
                'name_en': 'app_list',
                'resource_type_chain': [
                    {
                        // 系统 ID
                        'system_id': IAM_APP_ID,
                        // 资源类型 ID
                        'id': 'app'
                    }
                ]
            }
        ]

        await http.post(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
        })

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
        const url = `${IAM_HOST}/api/v1/model/systems/${IAM_APP_ID}/actions`
        const data = [
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
                        'system_id': IAM_APP_ID,
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
                                'system_id': IAM_APP_ID,
                                // 实例视图 ID
                                'id': 'app_list'
                            }
                        ]
                    }
                ],
                'version': 1
            }
        ]

        await http.post(url, data, {
            headers: {
                'X-Bkapi-Authorization': JSON.stringify({
                    bk_app_code: IAM_APP_ID,
                    bk_app_secret: IAM_APP_SECRET
                })
            }
        })

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
const iamMap = {
    initSystem,
    updateSystem,
    initResourceType,
    updateResourceType,
    initInstanceSelection,
    initAction
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
