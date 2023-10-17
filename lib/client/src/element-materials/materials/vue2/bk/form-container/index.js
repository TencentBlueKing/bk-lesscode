export default {
    name: 'form-container',
    type: 'widget-form-container',
    displayName: '表单容器',
    icon: 'bk-drag-xing-2',
    group: '编辑容器',
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
                type: 'NEW_FORM', // NEW_FORM、COPY_FORM、USE_FORM
                relatedId: '', // 关联id，引用或复用的表单id
                id: '' // 表单id，若为复用类型则取所复用表单id
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
