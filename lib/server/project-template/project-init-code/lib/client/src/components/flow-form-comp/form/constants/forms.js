export const FIELDS_TYPES = [
    {
        type: 'STRING',
        name: '单行文本',
        default: '',
        comp: 'Input',
        icon: 'icon bk-drag-icon bk-drag-danxingwenben'
    },
    {
        type: 'TEXT',
        name: '多行文本',
        default: '',
        comp: 'Textarea',
        icon: 'icon bk-drag-icon bk-drag-duoxingwenben'
    },
    {
        type: 'INT',
        name: '数字',
        default: 0,
        comp: 'Int',
        icon: 'icon bk-drag-icon bk-drag-shuzi'
    },
    {
        type: 'DATE',
        name: '日期',
        default: '',
        comp: 'Date',
        icon: 'icon bk-drag-icon bk-drag-riqi'
    },
    {
        type: 'DATETIME',
        name: '时间',
        default: '',
        comp: 'Datetime',
        icon: 'icon bk-drag-icon bk-drag-shijian'
    },
    {
        type: 'LINK',
        name: '链接',
        default: '',
        comp: 'Link',
        icon: 'icon bk-drag-icon bk-drag-lianjie'
    },
    {
        type: 'SELECT',
        name: '单选下拉框',
        default: '',
        comp: 'Select',
        icon: 'icon bk-drag-icon bk-drag-danxuanxiala'
    },
    {
        type: 'INPUTSELECT',
        name: '可输入单选下拉框',
        default: '',
        comp: 'InputSelect',
        icon: 'icon bk-drag-icon bk-drag-keshurudanxuanxiala'
    },
    {
        type: 'MULTISELECT',
        name: '多选下拉框',
        default: [],
        comp: 'MultiSelect',
        icon: 'icon bk-drag-icon bk-drag-duoxuanxiala'
    },
    {
        type: 'CHECKBOX',
        name: '复选框',
        default: [],
        comp: 'Checkbox',
        icon: 'icon bk-drag-icon bk-drag-duoxuankuang'
    },
    {
        type: 'RADIO',
        name: '单选框',
        default: '',
        comp: 'Radio',
        icon: 'icon bk-drag-icon bk-drag-danxuankuang'
    },
    {
        type: 'MEMBER',
        name: '单选人员选择',
        default: [],
        comp: 'Member',
        icon: 'icon bk-drag-icon bk-drag-danxuanrenyuanxuanze'
    },
    {
        type: 'MEMBERS',
        name: '多选人员选择',
        default: [],
        comp: 'Members',
        icon: 'icon bk-drag-icon bk-drag-duoxuanrenyuanxuanze'
    },
    {
        type: 'RICHTEXT',
        name: '富文本',
        default: '',
        comp: 'RichText',
        icon: 'icon bk-drag-icon bk-drag-fuwenben'
    },
    // {
    //     type: 'FILE',
    //     name: '附件上传',
    //     default: '',
    //     comp: 'Upload',
    //     icon: 'icon bk-drag-icon bk-drag-shangchuan'
    // },
    // {
    //     type: 'IMAGE',
    //     name: '图片上传',
    //     default: '',
    //     comp: 'ImageFile',
    //     icon: 'icon bk-drag-icon bk-drag-tupian'
    // },
    {
        type: 'TABLE',
        name: '表格',
        default: [],
        comp: 'Table',
        icon: 'icon bk-drag-icon bk-drag-zidingyibiaoge'
    },
    {
        type: 'DESC',
        name: '描述文本',
        default: '',
        comp: 'Description',
        icon: 'icon bk-drag-icon bk-drag-miaoshuwenben'
    },
    {
        type: 'DIVIDER',
        name: '分割线',
        comp: 'Divider',
        icon: 'icon bk-drag-icon bk-drag-fengexian'
    }
]

// 表单字段类型映射
export const FIELDS_TYPES_MAPS = {
    STRING: '单行文本',
    TEXT: '多行文本',
    INT: '数字',
    DATE: '日期',
    DATETIME: '时间',
    TABLE: '表格',
    SELECT: '单选下拉框',
    INPUTSELECT: '可输入单选下拉框',
    MULTISELECT: '多选下拉框',
    CHECKBOX: '复选框',
    RADIO: '单选框',
    MEMBER: '单选人员选择',
    MEMBERS: '多选人员选择',
    RICHTEXT: '富文本',
    FILE: '附件上传',
    IMAGE: '图片上传',
    LINK: '链接',
    DESC: '描述文本',
    FORMULA: '计算控件',
    DIVIDER: '分割线'
}

// 只支持全行展示的字段类型
export const FIELDS_FULL_LAYOUT = ['TABLE', 'RICHTEXT', 'DESC']

// 支持数据源的字段类型
export const DATA_SOURCE_FIELD = ['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO']

// 不需要查看的字段
export const NO_VIEWED_FIELD = ['DESC', 'DIVIDER']

// 需要展示默认值的字段类型
export const FIELDS_SHOW_DEFAULT_VALUE = ['STRING', 'TEXT', 'INT', 'DATE', 'DATETIME', 'SELECT', 'MULTISELECT', 'INPUTSELECT', 'CHECKBOX', 'RADIO', 'MEMBER', 'MEMBERS', 'RICHTEXT', 'DESC']

// 字段数据源配置
export const FIELDS_SOURCE_TYPE = [
    {
        id: 'CUSTOM',
        name: '自定义数据'
    },
    // {
    //     id: 'API',
    //     name: '接口数据'
    // },
    {
        id: 'WORKSHEET',
        name: '表单数据'
    }
]

// 条件关系
export const CONDITION_RELATIONS = [
    { id: '==', name: '等于' },
    { id: '!=', name: '不等于' },
    { id: '>', name: '大于' },
    { id: '<', name: '小于' },
    { id: '>=', name: '大于等于' },
    { id: '<=', name: '小于等于' },
    { id: 'in', name: '包含' },
    { id: 'not_in', name: '不包含' }
]

export const CONDITION_FUNCTION_MAP = {
    '==': 'equeal',
    '>=': 'greaterOrEqual',
    '<=': 'lessOrEaqual',
    '>': 'greater',
    '<': 'lesser',
    in: 'include'
}
