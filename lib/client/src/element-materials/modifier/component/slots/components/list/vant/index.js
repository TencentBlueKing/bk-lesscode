const vantListMap = {
    'van-checkbox': {
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
            disabled: false
        }),
        displayKey: 'label'
    },
    'van-radio': {
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
            label: window.i18n.t('单选项{0}', [index]),
            value: window.i18n.t('单选项{0}', [index]),
            disabled: false
        }),
        displayKey: 'label'
    },
    'van-step': {
        template: [
            {
                name: 'text',
                key: 'text',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            text: window.i18n.t('步骤{0}', [index])
        }),
        displayKey: 'text'
    },
    'van-tab': {
        template: [
            {
                name: 'title',
                key: 'title',
                type: 'input'
            },
            {
                name: 'name',
                key: 'name',
                type: 'input'
            },
            {
                name: window.i18n.t('点击后跳转的链接地址'),
                key: 'url',
                type: 'input'
            },
            {
                name: window.i18n.t('点击后跳转的目标路由对象，同 vue-router 的 to 属性'),
                key: 'to',
                type: 'input'
            },
            {
                name: window.i18n.t('是否禁用'),
                key: 'disabled',
                type: 'checkbox'
            },
            {
                name: window.i18n.t('是否在标题右上角显示小红点'),
                key: 'dot',
                type: 'checkbox'
            }
        ],
        generateFunc: index => ({
            label: window.i18n.t('选项{0}', [index]),
            value: window.i18n.t('选项{0}', [index]),
            disabled: false
        }),
        displayKey: 'title'
    }
}

export default vantListMap
