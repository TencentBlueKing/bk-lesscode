export default {
    name: 'data-manage-container',
    type: 'widget-data-manage-container',
    displayName: '数据管理容器',
    icon: 'bk-drag-zidingyibiaoge',
    group: '表单编辑器',
    order: 1,
    events: [],
    styles: [
        'size',
        'margin'
    ],
    renderStyles: {},
    props: {
        formId: {
            type: 'hidden',
            val: ''
        },
        buttons: {
            type: 'hidden',
            val: []
        },
        filters: {
            type: 'hidden',
            val: []
        },
        tableRowActions: {
            type: 'hidden',
            val: []
        },
        tableColsExclude: {
            type: 'hidden',
            val: ['createUser', 'createTime', 'updateUser', 'updateTime']
        }
    }
}
