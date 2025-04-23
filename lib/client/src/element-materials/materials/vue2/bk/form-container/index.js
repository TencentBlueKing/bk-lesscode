export default {
    name: 'form-container',
    type: 'widget-form-container',
    displayName: '表单编辑容器',
    icon: 'bk-drag-biaodan',
    group: '容器',
    order: 1,
    events: [],
    styles: [
        'size',
        'margin'
    ],
    renderStyles: {},
    props: {
        dataSource: {
            type: 'hidden',
            val: {
                action: 'submitData', // 提交按钮的行为，submitData(存储数据)、executeFlow(流程提单)
                flowTplId: '', // 流程模板id, action为executeFlow时需要
                nodeId: '', // 流程第一个节点为人工节点，该节点的id, action为executeFlow时需要
                type: 'NEW_FORM', // NEW_FORM、USE_FORM
                relatedId: '', // 关联id，引用或复用的表单id
                id: '', // 表单id，若为复用类型则取所复用表单id
                tableName: '' // form对应的数据表名称
            }
        },
        fields: {
            type: 'hidden',
            val: []
        },
        rowLayout: {
            type: 'hidden',
            val: 'full'
        },
        actions: {
            type: 'hidden',
            val: {
                submit: true,
                reset: true
            }
        }
    }
}
