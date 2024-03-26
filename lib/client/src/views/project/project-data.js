export function getProjectNavList () {
    const navList = [
        {
            name: window.i18n.t('前端模块开发'),
            children: [
                {
                    title: window.i18n.t('页面开发'),
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
                    title: window.i18n.t('JS函数开发'),
                    icon: 'hanshuku',
                    url: 'functionManage',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'functionManage'
                    }
                },
                {
                    title: window.i18n.t('变量管理'),
                    icon: 'page-variable',
                    url: 'variableManage',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'variableManage'
                    }
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
                        // {
                        //     title: window.i18n.t('图标管理'),
                        //     url: 'iconManage',
                        //     iamAction: 'develop_app',
                        //     permission: false,
                        //     toPath: {
                        //         name: 'iconManage'
                        //     }
                        // },
                        {
                            title: window.i18n.t('页面模板管理'),
                            url: 'templateManage',
                            iamAction: 'develop_app',
                            permission: false,
                            toPath: {
                                name: 'templateManage'
                            },
                            redPoint: true
                        },
                        {
                            title: window.i18n.t('API 管理'),
                            url: 'apiManage',
                            iamAction: 'develop_app',
                            permission: false,
                            toPath: {
                                name: 'apiManage'
                            }
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
                }
            ]
        },
        {
            id: 'backendModule',
            name: window.i18n.t('后台模块开发'),
            children: [
                {
                    title: window.i18n.t('模块开发'),
                    bkicon: 'block-shape',
                    url: 'backendModule',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'backendModule'
                    }
                }
            ]
        },
        // {
        //     id: 'flowList',
        //     name: window.i18n.t('流程管理'),
        //     children: [
        //         {
        //             title: window.i18n.t('流程设计'),
        //             icon: 'flow',
        //             url: 'flowList',
        //             iamAction: 'develop_app',
        //             permission: false,
        //             toPath: {
        //                 name: 'flowList'
        //             }
        //         }
        //     ]
        // },
        {
            name: window.i18n.t('数据源管理'),
            children: [
                {
                    title: window.i18n.t('数据表管理'),
                    icon: 'data-source-manage',
                    url: 'tableList',
                    iamAction: 'develop_app',
                    permission: false,
                    toPath: {
                        name: 'tableList'
                    }
                },
                {
                    title: window.i18n.t('数据操作'),
                    icon: 'data-source-manage',
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
            id: 'authManage',
            name: window.i18n.t('权限管理'),
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
            name: '其它',
            children: [
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
        }
    ]
    return navList
}
