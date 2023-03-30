const elementListMap = {
    'el-radio': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            },
            {
                name: 'value',
                key: 'value',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            label: window.i18n.t('单选项{0}', [index]),
            value: `${index}`
        }),
        displayKey: 'label'
    },
    'el-checkbox': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'value',
                key: 'value',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            label: window.i18n.t('选项{0}', [index]),
            value: `${index}`
        }),
        displayKey: 'label'
    },
    
    'el-step': {
        template: [
            {
                name: 'title',
                key: 'title',
                type: 'input'
            }, {
                name: 'icon',
                key: 'icon',
                type: 'input'
            }, {
                name: window.i18n.t('步骤描述'),
                key: 'description',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            title: window.i18n.t('步骤{0}', [index]),
            icon: '',
            description: ''
        }),
        displayKey: 'title'
    },
    
    'el-carousel-item': {
        template: [
            {
                name: window.i18n.t('文本label'),
                key: 'label',
                type: 'input'
            }, {
                name: window.i18n.t('名字name'),
                key: 'name',
                type: 'input'
            }, {
                name: window.i18n.t('内容content'),
                key: 'content',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            label: `carousel-${index}`,
            'name': `carousel-${index}`,
            content: `<h3>carousel-${index}</h3>`
        }),
        displayKey: 'label'
    },
    'el-option': {
        template: [
            {
                name: window.i18n.t('选项id'),
                key: 'id',
                type: 'input'
            }, {
                name: window.i18n.t('选项name'),
                key: 'name',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            id: `option${index}`,
            'name': ''
        }),
        displayKey: 'name'
    },
    'el-tab-pane': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'name',
                key: 'name',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            'name': `Tab-${index}`,
            label: `Tab-${index}`
        }),
        displayKey: 'label'
    },
    'el-breadcrumb-item': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'to',
                key: 'to',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            label: window.i18n.t('面包屑{0}', [index]),
            to: null
        }),
        displayKey: 'label'
    },
    'el-timeline-item': {
        template: [
            {
                name: window.i18n.t('内容'),
                key: 'label',
                type: 'input'
            }, {
                name: window.i18n.t('时间戳'),
                key: 'timestamp',
                type: 'input'
            },
            {
                name: 'color',
                key: 'color',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            label: `Timeline-${index}`,
            timestamp: '2021-06-29',
            color: ''
        }),
        displayKey: 'label'
    }
}

export default elementListMap
