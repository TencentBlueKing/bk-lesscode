const materials = [
    {
        group: '布局控件',
        type: 'description',
        component: 'description',
        name: '描述文本',
        icon: 'bk-drag-icon bk-drag-miaoshuwenben',
        desc: '',
        props: {},
        properties: ['key', 'value']
    },
    {
        group: '布局控件',
        type: 'divider',
        component: 'divider',
        name: '分割线',
        icon: 'bk-drag-icon bk-drag-fengexian',
        desc: '',
        props: {},
        properties: ['key', 'dividerConfig']
    },
    {
        group: '基础控件',
        type: 'input',
        component: 'input',
        name: '单行文本',
        icon: 'bk-drag-icon bk-drag-danxingwenben',
        desc: '',
        props: {},
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'textarea',
        component: 'input',
        name: '多行文本',
        icon: 'bk-drag-icon bk-drag-duoxingwenben',
        desc: '',
        props: { type: 'textarea' },
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'int',
        component: 'input',
        name: '数字',
        icon: 'bk-drag-icon bk-drag-shuzi',
        desc: '',
        props: { type: 'number' },
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'date',
        component: 'date',
        name: '日期',
        icon: 'bk-drag-icon bk-drag-riqi',
        desc: '',
        props: {},
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'datetime',
        component: 'datetime',
        name: '时间',
        icon: 'bk-drag-icon bk-drag-shijian',
        desc: '',
        props: {},
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'link',
        component: 'link',
        name: '链接',
        icon: 'bk-drag-icon bk-drag-lianjie',
        desc: '',
        props: {},
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'select',
        component: 'select',
        name: '单选下拉框',
        icon: 'bk-drag-icon bk-drag-danxuanxiala',
        desc: '',
        props: {},
        properties: ['name', 'key', 'dataSource', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'multiple-select',
        component: 'select',
        name: '多选下拉框',
        icon: 'bk-drag-icon bk-drag-duoxuanxiala',
        desc: '',
        props: { multiple: true },
        properties: ['name', 'key', 'dataSource', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'radio',
        component: 'radio',
        name: '单选框',
        icon: 'bk-drag-icon bk-drag-danxuankuang',
        desc: '',
        props: {},
        properties: ['name', 'key', 'dataSource', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'checkbox',
        component: 'checkbox',
        name: '复选框',
        icon: 'bk-drag-icon bk-drag-duoxuankuang',
        desc: '',
        props: {},
        properties: ['name', 'key', 'dataSource', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'member',
        component: 'member',
        name: '单选人员选择',
        icon: 'bk-drag-icon bk-drag-danxuanrenyuanxuanze',
        desc: '',
        props: {},
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'members',
        component: 'member',
        name: '多选人员选择',
        icon: 'bk-drag-icon bk-drag-duoxuanrenyuanxuanze',
        desc: '',
        props: { multiple: true },
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'placeholder', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'rich-text',
        component: 'rich-text',
        name: '富文本',
        icon: 'bk-drag-icon bk-drag-fuwenben',
        desc: '',
        props: {},
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'table',
        component: 'table',
        name: '表格',
        icon: 'bk-drag-icon bk-drag-zidingyibiaoge',
        desc: '',
        props: {},
        properties: ['name', 'key', 'tableConfig', 'readonly', 'required', 'hidden', 'validate', 'labelTips']
    },
    {
        group: '基础控件',
        type: 'rate',
        component: 'rate',
        name: '评分',
        icon: 'bk-drag-icon bk-drag-rate',
        desc: '',
        props: {},
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'value', 'valLinkageRules', 'labelTips']
    },
    {
        group: '高级控件',
        type: 'computed',
        component: 'computed',
        name: '计算控件',
        icon: 'bk-drag-icon bk-drag-fc-count',
        desc: '',
        props: {},
        properties: ['name', 'key', 'readonly', 'required', 'hidden', 'validate', 'computedConfig', 'labelTips']
    },
    {
        group: '高级控件',
        type: 'auto-counting',
        component: 'auto-counting',
        name: '自动编号',
        icon: 'bk-drag-icon bk-drag-liebiao',
        desc: '自动编号控件在表单填写时不可见，表单值由配置规则确定',
        props: {},
        properties: ['name', 'key', 'autoCountingConfig']
    }
]

export default materials
