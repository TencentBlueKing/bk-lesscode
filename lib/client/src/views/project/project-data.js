export function getProjectNavList () {
    const navList = [
        {
            title: window.i18n.t('abbr_页面管理'),
            icon: 'page',
            url: 'pageList',
            iamAction: 'develop_app',
            permission: false,
            toPath: {
                name: 'pageList'
            }
        },
        {
            title: window.i18n.t('路由管理'),
            icon: 'router',
            url: 'routes',
            iamAction: 'develop_app',
            permission: false,
            toPath: {
                name: 'routes'
            }
        },
        {
            title: window.i18n.t('流程管理'),
            icon: 'flow',
            url: 'flowList',
            iamAction: 'develop_app',
            permission: false,
            toPath: {
                name: 'flowList'
            }
        },
        {
            title: window.i18n.t('数据源管理'),
            icon: 'data-source-manage',
            url: 'tableList',
            toPath: {
                name: 'tableList'
            },
            children: [
                {
                    title: window.i18n.t('数据表管理'),
                    url: 'tableList',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'tableList'
                    }
                },
                {
                    title: window.i18n.t('数据操作'),
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
            title: window.i18n.t('资源管理'),
            icon: 'source',
            url: 'componentManage',
            children: [
                {
                    title: window.i18n.t('导航布局管理'),
                    url: 'layout',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'layout'
                    }
                },
                {
                    title: window.i18n.t('函数管理'),
                    url: 'functionManage',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'functionManage'
                    }
                },
                {
                    title: window.i18n.t('API 管理'),
                    url: 'apiManage',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'apiManage'
                    }
                },
                {
                    title: window.i18n.t('变量管理'),
                    url: 'variableManage',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'variableManage'
                    }
                },
                {
                    title: window.i18n.t('文件管理'),
                    url: 'fileManage',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'fileManage'
                    }
                },
                {
                    title: window.i18n.t('自定义组件管理'),
                    url: 'componentManage',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'componentManage'
                    }
                },
                {
                    title: window.i18n.t('页面模板管理'),
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
            title: window.i18n.t('发布管理'),
            icon: '1_deploy-fill',
            url: 'release',
            children: [
                {
                    title: window.i18n.t('发布部署'),
                    icon: 'list-fill',
                    url: 'release',
                    iamAction: 'deploy_app',
                    permission: false,
                    toPath: {
                        name: 'release'
                    }
                },
                {
                    title: window.i18n.t('版本管理'),
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
            title: window.i18n.t('权限管理'),
            icon: 'auth-set',
            url: 'authManage',
            children: [
                {
                    title: window.i18n.t('应用管理权限'),
                    icon: 'user-group',
                    url: 'authManage',
                    iamAction: 'manage_app',
                    permission: false,
                    toPath: {
                        name: 'authManage'
                    }
                },
                {
                    title: window.i18n.t('应用权限模型'),
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
            title: window.i18n.t('基本信息'),
            icon: 'set-fill',
            url: 'basicInfo',
            iamAction: 'develop_app',
            permission: false,
            toPath: {
                name: 'basicInfo'
            }
        },
        {
            title: window.i18n.t('操作审计'),
            icon: 'audit',
            url: 'logs',
            iamAction: 'develop_app',
            permission: false,
            toPath: {
                name: 'logs'
            }
        }
    ]
    return navList
}
