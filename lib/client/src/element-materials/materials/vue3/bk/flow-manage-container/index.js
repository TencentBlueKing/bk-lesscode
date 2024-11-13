export default {
    name: 'flow-manage-container',
    type: 'widget-flow-manage-container',
    displayName: '流程管理容器',
    icon: 'bk-drag-icon bk-drag-rongqi',
    group: '表单编辑器',
    order: 1,
    events: [],
    styles: [
        'size',
        'margin'
    ],
    renderStyles: {},
    props: {
        id: {
            type: 'hidden',
            val: ''
        },
        nodeList: {
            type: 'hidden',
            val: []
        },
        tableColsExclude: {
            type: 'hidden',
            val: ['createUser', 'createTime', 'updateUser', 'updateTime']
        }
    }
}
