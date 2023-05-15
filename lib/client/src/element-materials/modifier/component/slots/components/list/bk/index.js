const bkListMap = {
    'bk-radio': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'value',
                key: 'value',
                type: 'input'
            }, {
                name: window.i18n.t('默认选中'),
                key: 'checked',
                type: 'radio'
            }
        ],
        generateFunc: index => ({
            label: window.i18n.t('单选项{0}', [index]),
            value: window.i18n.t('单选项{0}', [index]),
            checked: false
        }),
        displayKey: 'label'
    },
    'bk-radio-button': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'value',
                key: 'value',
                type: 'input'
            }, {
                name: window.i18n.t('是否禁用'),
                key: 'disabled',
                type: 'checkbox'
            }
        ],
        generateFunc: index => ({
            label: window.i18n.t('选项{0}', [index]),
            value: window.i18n.t('选项{0}', [index]),
            checked: false
        }),
        displayKey: 'label'
    },
    
    'bk-checkbox': {
        template: [
            {
                name: 'label',
                key: 'label',
                type: 'input'
            }, {
                name: 'value',
                key: 'value',
                type: 'input'
            }, {
                name: window.i18n.t('默认选中'),
                key: 'checked',
                type: 'checkbox'
            }
        ],
        generateFunc: index => ({
            label: window.i18n.t('选项{0}', [index]),
            value: window.i18n.t('选项{0}', [index]),
            checked: false
        }),
        displayKey: 'label'
    },
    'bk-breadcrumb-item': {
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
    'bk-step': {
        template: [
            {
                name: 'title',
                key: 'title',
                type: 'input'
            }, {
                name: 'icon',
                key: 'icon',
                type: 'icon'
            }, {
                name: window.i18n.t('步骤描述'),
                key: 'description',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            title: window.i18n.t('步骤{0}', [index]),
            icon: index,
            description: ''
        }),
        displayKey: 'title'
    },
    'bk-option': {
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
    'bk-tab-panel': {
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
            label: `Tab-${index}`,
            'name': `Tab-${index}`
        }),
        displayKey: 'label'
    },
    'bk-timeline': {
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

export default bkListMap
