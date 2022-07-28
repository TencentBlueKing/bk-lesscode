export const PROJECT_TEMPLATE_TYPE = [
    {
        id: 'OFFCIAL_WEBSITE',
        name: '企业官网'
    },
    {
        id: 'ADMIN_BACKEND',
        name: '管理后台'
    },
    {
        id: 'OPERATION_PRODUCT',
        name: '运维产品'
    }
]

export const PAGE_TEMPLATE_TYPE = [
    {
        id: 'FORM',
        name: '表单'
    },
    {
        id: 'CHART',
        name: '图表'
    },
    {
        id: 'INFO',
        name: '信息'
    }
]

// 权限中心操作集合
export const IAM_ACTION = {
    // 应用开发
    DEVELOP_APP: 'develop_app',
    // 应用部署
    DEPLOY_APP: 'deploy_app',
    // 应用内权限设计
    MANAGE_PERMS_IN_APP: 'manage_perms_in_app',
    // 应用管理
    MANAGE_APP: 'manage_app',
    // 平台管理
    MANAGE_PLATFORM: 'manage_platform',
    // 函数管理
    MANAGE_FUNCTION: 'manage_function',
    // 模板管理
    MANAGE_TEMPLATE: 'manage_template',
    // 运营数据查看
    VIEW_OPERATION_DATA: 'view_operation_data',
    // 应用新建
    CREATE_APP: 'create_app',
    // 应用公开模板创建为新应用
    CREATE_APP_WITH_TEMPLATE: 'create_app_with_template',
    // 应用公开模板预览
    PREVIEW_APP_TEMPLATE: 'preview_app_template',
    // 应用公开模板源码下载
    DOWNLOAD_APP_TEMPLATE_SOURCE: 'download_app_template_source',
    // 页面公开模板添加至应用
    CREATE_PAGE_WITH_TEMPLATE: 'create_page_with_template',
    // 页面公开模板预览
    PREVIEW_PAGE_TEMPLATE: 'preview_page_template',
    // 页面公开模板源码下载
    DOWNLOAD_PAGE_TEMPLATE_SOURCE: 'download_page_template_source'
}
