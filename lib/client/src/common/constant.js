export const PROJECT_TEMPLATE_TYPE = [
    {
        id: 'OFFCIAL_WEBSITE',
        name: '企业官网'
    },
    {
        id: 'ADMIN_BACKEND',
        name: '管理后台'
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
    },
    {
        id: 'LAYOUT',
        name: '布局'
    }
]

export const NOCODE_TYPE_MAP = {
    toRouteName: {
        FORM: 'editNocode',
        FORM_MANAGE: 'editNocode',
        FLOW: 'flowConfig',
        FLOW_MANAGE: 'editNocode'
    },
    title: {
        FORM: '表单页',
        FORM_MANAGE: '表单数据管理页',
        FLOW: '流程提单页',
        FLOW_MANAGE: '流程数据管理页'
    },
    color: {
        FORM: '#7573E6',
        FORM_MANAGE: '#3A9DFF',
        FLOW: '#5EA9AD',
        FLOW_MANAGE: '#71C26E'
    },
    bgColor: {
        FORM: '#E8E6FF',
        FORM_MANAGE: '#DAE9FD',
        FLOW: '#D8F4F5',
        FLOW_MANAGE: '#DAF5C8'
    },
    deleteTips: {
        FORM: '刪除页面，对应的数据表结构和数据不会删除',
        FORM_MANAGE: '删除页面，对应绑定表单的数据不会删除，后续可通过表单设计页面再次生成',
        FLOW: '删除页面，对应绑定流程的数据不会删除，后续可以在流程管理中，选择相应流程的第一个提单节点再次生成',
        FLOW_MANAGE: '删除页面，对应绑定流程的数据不会删除，后续可以在流程管理中，选择相应流程的流程设计页再次生成'
    }
}
