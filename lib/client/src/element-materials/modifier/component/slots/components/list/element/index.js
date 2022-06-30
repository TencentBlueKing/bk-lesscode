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
            label: `单选项${index}`,
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
            label: `选项${index}`,
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
                name: '步骤描述',
                key: 'description',
                type: 'input'
            }
        ],
        generateFunc: index => ({
            title: `步骤${index}`,
            icon: '',
            description: ''
        }),
        displayKey: 'title'
    },
    
    'el-carousel-item': {
        template: [
            {
                name: '文本label',
                key: 'label',
                type: 'input'
            }, {
                name: '名字name',
                key: 'name',
                type: 'input'
            }, {
                name: '内容content',
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
                name: '选项id',
                key: 'id',
                type: 'input'
            }, {
                name: '选项name',
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
            label: `面包屑${index}`,
            to: null
        }),
        displayKey: 'label'
    },
    'el-timeline-item': {
        template: [
            {
                name: '内容',
                key: 'label',
                type: 'input'
            }, {
                name: '时间戳',
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
