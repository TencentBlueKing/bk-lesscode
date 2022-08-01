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
    develop_app: ['develop_app', '应用开发'],
    // 应用部署
    deploy_app: ['deploy_app', '应用部署'],
    // 应用内权限设计
    manage_perms_in_app: ['manage_perms_in_app', '应用内权限设计'],
    // 应用管理
    manage_app: ['manage_app', '应用管理'],
    // 平台管理
    manage_platform: ['manage_platform', '平台管理'],
    // 函数管理
    manage_function: ['manage_function', '函数管理'],
    // 模板管理
    manage_template: ['manage_template', '模板管理'],
    // 运营数据查看
    view_operation_data: ['view_operation_data', '运营数据查看'],
    // 应用新建
    create_app: ['create_app', '应用新建'],
    // 应用公开模板创建为新应用
    create_app_with_template: ['create_app_with_template', '应用公开模板创建为新应用'],
    // 应用公开模板预览
    preview_app_template: ['preview_app_template', '应用公开模板预览'],
    // 应用公开模板源码下载
    download_app_template_source: ['download_app_template_source', '应用公开模板源码下载'],
    // 页面公开模板添加至应用
    create_page_with_template: ['create_page_with_template', '页面公开模板添加至应用'],
    // 页面公开模板预览
    preview_page_template: ['preview_page_template', '页面公开模板预览'],
    // 页面公开模板源码下载
    download_page_template_source: ['download_page_template_source', '页面公开模板源码下载']
}

// 资源类型 ID
export const IAM_RESOURCE_TYPE_ID = 'app'

// 实例视图 ID
export const IAM_INSTANCE_SELECTION_ID = 'app_list'
