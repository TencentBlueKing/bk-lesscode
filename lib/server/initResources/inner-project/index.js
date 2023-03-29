import ProjectModel from '../../model/project'

const OFFCIAL_PROJECT_CODE = 'lesscodeoffcial'
const DEFAULT_PROJECT_CREATOR = 'lesscode-offcial-project-creator'
const { createDemoProject } = require('../../controller/project')
const { findUserByUsername, addUser } = require('../../controller/user')

export const initInnerProject = async () => {
    let projectId = ''
    const offcialProject = await ProjectModel.findProjectDetail({ projectCode: OFFCIAL_PROJECT_CODE })
    if (!offcialProject) {
        let userId = ''
        const userData = await findUserByUsername(DEFAULT_PROJECT_CREATOR)
        if (!userData) {
            userId = await addUser({
                username: DEFAULT_PROJECT_CREATOR,
                bk: DEFAULT_PROJECT_CREATOR
            })
        }
        projectId = await createDemoProject({}, {
            bkTicket: '',
            userInfo: {
                username: DEFAULT_PROJECT_CREATOR,
                id: userId || userData?.id
            },
            projectData: {
                copyFrom: null,
                projectCode: OFFCIAL_PROJECT_CODE,
                projectName: global.i18n.t('bk-lesscode官方内置项目'),
                projectDesc: global.i18n.t('bk-lesscode官方内置项目，用于存放内置官方页面模板、自定义组件等资源')
            }
        })
    }
    return offcialProject?.id || projectId
}
