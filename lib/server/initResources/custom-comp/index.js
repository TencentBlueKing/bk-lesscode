import { LCDataService, TABLE_FILE_NAME } from '../../service/common/data-service'
import { getConnection } from 'typeorm'
import fileService from '../../utils/file-service/index'
import { checkNpmSetting, npmPublish } from '../../utils/npm'
import * as ComponentModel from '../../model/component'
import Comp from '../../model/entities/comp'
import Version from '../../model/entities/version'

export const initCustomComp = async function (belongProjectId, projectCode, compData = {}) {
    // 先检测是否有bkrepo跟npm镜像源配置
    fileService.checkBkRepoSetting()
    checkNpmSetting()

    const successComps = []

    let categoryId = ''
    const { list: categoryList = [] } = await LCDataService.get({
        tableFileName: TABLE_FILE_NAME.COMP_CATEGORY,
        query: {
            belongProjectId
        }
    })
    if (categoryList.length) {
        categoryId = categoryList[0].id
    } else {
        const { id } = await LCDataService.add(TABLE_FILE_NAME.COMP_CATEGORY, {
            name: global.i18n.t('默认分类'),
            belongProjectId
        })
        categoryId = id
    }
    
    if (compData.importList?.length) {
        const md5 = require('md5')
        const path = require('path')
        const fs = require('fs')
        const fse = require('fs-extra')

        for (const compItem of compData.importList) {
            const comp = compItem.name
            
            // 上传新组件需要检测重名
            const compRow = await ComponentModel.getOne({
                type: `${projectCode}-${comp}`
            })
            if (compRow) {
                console.log(global.i18n.t('已存在同名组件type {{n}}', { n: comp }))
            } else {
                const componentRealPath = path.resolve(__dirname, `./resources/${comp}`)
           
                const componentChild = fs.readdirSync(componentRealPath)
                if (!componentChild.includes('config.json')) {
                    throw new Error(global.i18n.t('组件包需包含config.json'))
                }
                if (!componentChild.includes('index.iife.min.js') || !componentChild.includes('index.umd.min.js')) {
                    throw new Error(global.i18n.t('请先编译组件源码'))
                }

                // 解析组件的config.json
                let componentConfig = {}
                try {
                    componentConfig = await fse.readJson(path.resolve(componentRealPath, 'config.json'))
                } catch {
                    throw new Error(global.i18n.t(`${comp}: config.json解析失败`))
                }

                // 验证组件名是否合法
                const { name, displayName, type, framework } = componentConfig
                const realType = `${projectCode}-${type}`
                const version = compItem.version || '1.0.0'
                const compType = compItem.compType || 'PC'

                // 组件存放目录md5计算时间戳
                const componentDirName = md5(`${type}_${Date.now()}`)
                
                await getConnection().transaction(async transactionalEntityManager => {
                    // bkrepo存储（下载的组件源码推到bkrepo的component目录）
                    const fileComponentPath = `component/${componentDirName}`
                    await fileService.uploadFolder(componentRealPath, fileComponentPath)

                    console.log(path.resolve(__dirname, componentRealPath), 2211)
                    // 推送tnpm
                    await npmPublish({
                        sourceDir: path.resolve(__dirname, componentRealPath),
                        componentDirName: componentDirName,
                        name: realType,
                        version,
                        description: `lesscode自定义组件: ${comp}`
                    })
                    const nowDate = new Date()
        
                    // 数据插入记录
                    const newComp = await transactionalEntityManager.save(Comp, {
                        name,
                        displayName,
                        type: realType,
                        categoryId,
                        belongProjectId,
                        compType,
                        framework,
                        isPublic: true,
                        createTime: nowDate,
                        createUser: 'admin',
                        updateTime: nowDate,
                        updateUser: 'admin'
                    })
                    await transactionalEntityManager.save(Version, {
                        version,
                        versionLog: `内置自定义组件: ${comp}`,
                        componentId: newComp.id,
                        componentDest: fileComponentPath,
                        description: `内置自定义组件: ${comp}`,
                        isLast: 1,
                        createTime: nowDate,
                        createUser: 'admin',
                        updateTime: nowDate,
                        updateUser: 'admin'
                    })
                })
            }
            successComps.push(comp)        
        }
        console.log('成功导入的组件列表:', successComps)
        return successComps
    }
}