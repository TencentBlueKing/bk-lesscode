export default {
    name: 'form-container',
    type: 'widget-form-container',
    displayName: '表单容器',
    icon: 'bk-drag-biaodan',
    group: '表单编辑器',
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
                submit: false,
                reset: false
            }
        }
    }
}
