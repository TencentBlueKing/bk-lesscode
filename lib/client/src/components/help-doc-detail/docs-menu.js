export function getDocsMenuList () {
    const navList = [
        {
            title: window.i18n.t('产品使用文档'),
            name: 'doc',
            childs: [{
                name: window.i18n.t('产品简介'),
                id: 'intro'
            }, {
                name: window.i18n.t('快速上手'),
                id: 'start'
            }]
        },
        {
            title: window.i18n.t('abbr_前端模块开发'),
            name: 'app',
            childs: [{
                name: window.i18n.t('页面开发'),
                level: 0,
                children: [{
                    name: window.i18n.t('页面管理'),
                    level: 1,
                    id: 'page-manage'
                }, {
                    name: window.i18n.t('画布编辑'),
                    level: 1,
                    id: 'canvas-edit'
                }, {
                    name: window.i18n.t('画布布局容器'),
                    level: 1,
                    id: 'container'
                }, {
                    name: window.i18n.t('移动端页面'),
                    level: 1,
                    id: 'mobile-page'
                }, {
                    name: window.i18n.t('表单容器跟数据管理容器'),
                    level: 1,
                    id: 'form-data-container'
                }, {
                    name: window.i18n.t('画布中函数使用'),
                    level: 1,
                    id: 'function-using'
                }, {
                    name: window.i18n.t('画布中变量使用'),
                    level: 1,
                    id: 'variable-using'
                }, {
                    name: window.i18n.t('交互式组件使用'),
                    level: 1,
                    id: 'interactive'
                }]
            }, {
                name: window.i18n.t('路由管理'),
                id: 'route-manage'
            }, {
                name: window.i18n.t('js函数开发'),
                id: 'method'
            }, {
                name: window.i18n.t('变量管理'),
                id: 'variable'
            }, {
                name: window.i18n.t('资源管理'),
                level: 0,
                children: [{
                    name: window.i18n.t('导航布局管理'),
                    level: 1,
                    id: 'layout-guide'
                }, {
                    name: window.i18n.t('文件管理'),
                    level: 1,
                    id: 'file-manage'
                }, {
                    name: window.i18n.t('自定义组件管理'),
                    level: 1,
                    id: 'custom'
                }, {
                    name: window.i18n.t('页面模板管理'),
                    level: 1,
                    id: 'page-template'
                }, {
                    name: window.i18n.t('API管理'),
                    level: 1,
                    id: 'api'
                }]
            }, {
                name: window.i18n.t('发布管理'),
                level: 0,
                children: [{
                    name: window.i18n.t('发布部署'),
                    level: 1,
                    id: 'release'
                }, {
                    name: window.i18n.t('版本管理'),
                    level: 1,
                    id: 'version'
                }]
            }]
        },
        {
            title: window.i18n.t('数据源管理'),
            name: 'data',
            childs: [{
                name: window.i18n.t('数据表管理'),
                id: 'data-manage'
            }, {
                name: window.i18n.t('数据操作'),
                id: 'data-operation'
            }]
        },
        {
            title: window.i18n.t('其他文档'),
            name: 'other',
            childs: [{
                name: window.i18n.t('资源市场'),
                level: 0,
                children: [{
                    name: window.i18n.t('应用模板'),
                    level: 1,
                    id: 'template-project'
                }, {
                    name: window.i18n.t('页面模板'),
                    level: 1,
                    id: 'template-page'
                }]
            }, {
                name: window.i18n.t('实战案例'),
                level: 0,
                children: [{
                    name: window.i18n.t('表格查询案例'),
                    level: 1,
                    id: 'table-search'
                }]
            }, {
                name: window.i18n.t('二次开发指引'),
                id: 'develop'
            }]
        }
    ]
    return navList
}
