export const PROJECT_NAV_LIST = [
    {
        title: '页面管理',
        icon: 'page',
        url: 'pageList',
        iamAction: 'develop_app',
        permission: false,
        toPath: {
            name: 'pageList'
        }
    },
    {
        title: '路由管理',
        icon: 'router',
        url: 'routes',
        iamAction: 'develop_app',
        permission: false,
        toPath: {
            name: 'routes'
        }
    },
    {
        title: '流程管理',
        icon: 'flow',
        url: 'flowList',
        iamAction: 'develop_app',
        permission: false,
        toPath: {
            name: 'flowList'
        }
    },
    {
        title: '数据源管理',
        icon: 'data-source-manage',
        url: 'tableList',
        toPath: {
            name: 'tableList'
        },
        children: [
            {
                title: '数据表管理',
                url: 'tableList',
                iamAction: 'develop_app',
                permission: false,
                toPath: {
                    name: 'tableList'
                }
            },
            {
                title: '数据操作',
                url: 'dataOperation',
                iamAction: 'develop_app',
                permission: false,
                toPath: {
                    name: 'dataOperation'
                }
            }
        ]
    },
    {
        title: '资源管理',
        icon: 'source',
        url: 'componentManage',
        children: [
            {
                title: '导航布局管理',
                url: 'layout',
                iamAction: 'develop_app',
                permission: false,
                toPath: {
                    name: 'layout'
                }
            },
            {
                title: '函数管理',
                url: 'functionManage',
                iamAction: 'develop_app',
                permission: false,
                toPath: {
                    name: 'functionManage'
                }
            },
            {
                title: 'API 管理',
                url: 'apiManage',
                iamAction: 'develop_app',
                permission: false,
                toPath: {
                    name: 'apiManage'
                }
            },
            {
                title: '变量管理',
                url: 'variableManage',
                iamAction: 'develop_app',
                permission: false,
                toPath: {
                    name: 'variableManage'
                }
            },
            {
                title: '文件管理',
                url: 'fileManage',
                iamAction: 'develop_app',
                permission: false,
                toPath: {
                    name: 'fileManage'
                }
            },
            {
                title: '自定义组件管理',
                url: 'componentManage',
                iamAction: 'develop_app',
                permission: false,
                toPath: {
                    name: 'componentManage'
                }
            },
            {
                title: '页面模板管理',
                url: 'templateManage',
                iamAction: 'develop_app',
                permission: false,
                toPath: {
                    name: 'templateManage'
                },
                redPoint: true
            }
        ]
    },
    {
        title: '发布管理',
        icon: '1_deploy-fill',
        url: 'release',
        children: [
            {
                title: '发布部署',
                icon: 'list-fill',
                url: 'release',
                iamAction: 'deploy_app',
                permission: false,
                toPath: {
                    name: 'release'
                }
            },
            {
                title: '版本管理',
                icon: 'version',
                url: 'versions',
                iamAction: 'deploy_app',
                permission: false,
                toPath: {
                    name: 'versions'
                }
            }
        ]
    },
    {
        title: '权限管理',
        icon: 'auth-set',
        url: 'authManage',
        children: [
            {
                title: '应用管理权限',
                icon: 'user-group',
                url: 'authManage',
                iamAction: 'manage_app',
                permission: false,
                toPath: {
                    name: 'authManage'
                }
            },
            {
                title: '应用权限模型',
                icon: 'info-fill',
                url: 'appPermModel',
                iamAction: 'manage_app',
                permission: false,
                toPath: {
                    name: 'appPermModel'
                }
            }
        ]
    },
    {
        title: '基本信息',
        icon: 'set-fill',
        url: 'basicInfo',
        iamAction: 'develop_app',
        permission: false,
        toPath: {
            name: 'basicInfo'
        }
    },
    {
        title: '操作审计',
        icon: 'audit',
        url: 'logs',
        iamAction: 'develop_app',
        permission: false,
        toPath: {
            name: 'logs'
        }
    }
]
