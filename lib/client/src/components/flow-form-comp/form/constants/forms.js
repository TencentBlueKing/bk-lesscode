export const FIELDS_TYPES = [
    {
        type: 'STRING',
        name: window.i18n.t('单行文本'),
        default: '',
        comp: 'Input',
        icon: 'icon bk-drag-icon bk-drag-danxingwenben'
    },
    {
        type: 'TEXT',
        name: window.i18n.t('多行文本'),
        default: '',
        comp: 'Textarea',
        icon: 'icon bk-drag-icon bk-drag-duoxingwenben'
    },
    {
        type: 'INT',
        name: window.i18n.t('数字'),
        default: 0,
        comp: 'Int',
        icon: 'icon bk-drag-icon bk-drag-shuzi'
    },
    {
        type: 'DATE',
        name: window.i18n.t('日期'),
        default: '',
        comp: 'Date',
        icon: 'icon bk-drag-icon bk-drag-riqi'
    },
    {
        type: 'DATETIME',
        name: window.i18n.t('时间'),
        default: '',
        comp: 'Datetime',
        icon: 'icon bk-drag-icon bk-drag-shijian'
    },
    {
        type: 'LINK',
        name: window.i18n.t('链接'),
        default: '',
        comp: 'Link',
        icon: 'icon bk-drag-icon bk-drag-lianjie'
    },
    {
        type: 'SELECT',
        name: window.i18n.t('单选下拉框'),
        default: '',
        comp: 'Select',
        icon: 'icon bk-drag-icon bk-drag-danxuanxiala'
    },
    // {
    //     type: 'INPUTSELECT',
    //     name: window.i18n.t('可输入单选下拉框'),
    //     default: '',
    //     comp: 'InputSelect',
    //     icon: 'icon bk-drag-icon bk-drag-keshurudanxuanxiala'
    // },
    {
        type: 'MULTISELECT',
        name: window.i18n.t('多选下拉框'),
        default: [],
        comp: 'MultiSelect',
        icon: 'icon bk-drag-icon bk-drag-duoxuanxiala'
    },
    {
        type: 'CHECKBOX',
        name: window.i18n.t('复选框'),
        default: [],
        comp: 'Checkbox',
        icon: 'icon bk-drag-icon bk-drag-duoxuankuang'
    },
    {
        type: 'RADIO',
        name: window.i18n.t('单选框'),
        default: '',
        comp: 'Radio',
        icon: 'icon bk-drag-icon bk-drag-danxuankuang'
    },
    {
        type: 'MEMBER',
        name: window.i18n.t('单选人员选择'),
        default: [],
        comp: 'Member',
        icon: 'icon bk-drag-icon bk-drag-danxuanrenyuanxuanze'
    },
    {
        type: 'MEMBERS',
        name: window.i18n.t('多选人员选择'),
        default: [],
        comp: 'Members',
        icon: 'icon bk-drag-icon bk-drag-duoxuanrenyuanxuanze'
    },
    {
        type: 'RICHTEXT',
        name: window.i18n.t('富文本'),
        default: '',
        comp: 'RichText',
        icon: 'icon bk-drag-icon bk-drag-fuwenben'
    },
    // {
    //     type: 'FILE',
    //     name: window.i18n.t('附件上传'),
    //     default: '',
    //     comp: 'Upload',
    //     icon: 'icon bk-drag-icon bk-drag-shangchuan'
    // },
    // {
    //     type: 'IMAGE',
    //     name: window.i18n.t('图片上传'),
    //     default: '',
    //     comp: 'ImageFile',
    //     icon: 'icon bk-drag-icon bk-drag-tupian'
    // },
    {
        type: 'TABLE',
        name: window.i18n.t('表格'),
        default: [],
        comp: 'Table',
        icon: 'icon bk-drag-icon bk-drag-zidingyibiaoge'
    },
    {
        type: 'DESC',
        name: window.i18n.t('描述文本'),
        default: '',
        comp: 'Description',
        icon: 'icon bk-drag-icon bk-drag-miaoshuwenben'
    },
    {
        type: 'DIVIDER',
        name: window.i18n.t('分割线'),
        comp: 'Divider',
        icon: 'icon bk-drag-icon bk-drag-fengexian'
    },
    {
        type: 'RATE',
        name: window.i18n.t('评分组件'),
        default: 0,
        comp: 'Rate',
        icon: 'icon bk-drag-icon bk-drag-rate'
    },
    {
        type: 'COMPUTE',
        name: window.i18n.t('计算控件'),
        default: '--',
        comp: 'Compute',
        icon: 'icon bk-drag-icon bk-drag-fc-count'
    },
    {
        type: 'SERIAL',
        name: window.i18n.t('自动编号'),
        default: '--',
        comp: 'Serial',
        icon: 'icon bk-drag-icon bk-drag-liebiao'
    }
]

// 表单字段类型映射
export const FIELDS_TYPES_MAPS = {
    STRING: window.i18n.t('单行文本'),
    TEXT: window.i18n.t('多行文本'),
    INT: window.i18n.t('数字'),
    DATE: window.i18n.t('日期'),
    DATETIME: window.i18n.t('时间'),
    TABLE: window.i18n.t('表格'),
    SELECT: window.i18n.t('单选下拉框'),
    INPUTSELECT: window.i18n.t('可输入单选下拉框'),
    MULTISELECT: window.i18n.t('多选下拉框'),
    CHECKBOX: window.i18n.t('复选框'),
    RADIO: window.i18n.t('单选框'),
    MEMBER: window.i18n.t('单选人员选择'),
    MEMBERS: window.i18n.t('多选人员选择'),
    RICHTEXT: window.i18n.t('富文本'),
    FILE: window.i18n.t('附件上传'),
    IMAGE: window.i18n.t('图片上传'),
    LINK: window.i18n.t('链接'),
    DESC: window.i18n.t('描述文本'),
    FORMULA: window.i18n.t('计算控件'),
    DIVIDER: window.i18n.t('分割线'),
    SERIAL: window.i18n.t('自动编号'),
    COMPUTE: window.i18n.t('计算控件'),
    RATE: window.i18n.t('评分组件')
}

// 只支持全行展示的字段类型
export const FIELDS_FULL_LAYOUT = ['TABLE', 'RICHTEXT', 'DESC']

// 支持数据源的字段类型
export const DATA_SOURCE_FIELD = ['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO']

// 不需要查看的字段
export const NO_VIEWED_FIELD = ['DESC', 'DIVIDER']

// 需要展示默认值的字段类型
export const FIELDS_SHOW_DEFAULT_VALUE = ['STRING', 'TEXT', 'INT', 'DATE', 'DATETIME', 'SELECT', 'MULTISELECT', 'INPUTSELECT', 'CHECKBOX', 'RADIO', 'MEMBER', 'MEMBERS', 'RICHTEXT', 'DESC', 'RATE']

// 流程表单不支持的字段类型
export const FIELDS_NO_AVAILABLE_IN_PROCESS = ['DESC', 'DIVIDER', 'FORMULA', 'SERIAL', 'RATE']

// 字段数据源配置
export const FIELDS_SOURCE_TYPE = [
    {
        id: 'CUSTOM',
        name: window.i18n.t('自定义数据')
    },
    // {
    //     id: 'API',
    //     name: '接口数据'
    // },
    {
        id: 'WORKSHEET',
        name: window.i18n.t('表单数据')
    }
]

// 条件关系
export const CONDITION_RELATIONS = [
    { id: '==', name: window.i18n.t('等于') },
    { id: '!=', name: window.i18n.t('不等于') },
    { id: '>', name: window.i18n.t('大于') },
    { id: '<', name: window.i18n.t('小于') },
    { id: '>=', name: window.i18n.t('大于等于') },
    { id: '<=', name: window.i18n.t('小于等于') },
    { id: 'in', name: window.i18n.t('包含') },
    { id: 'not_in', name: window.i18n.t('不包含') }
]

export const CONDITION_FUNCTION_MAP = {
    '==': 'equeal',
    '>=': 'greaterOrEqual',
    '<=': 'lessOrEaqual',
    '>': 'greater',
    '<': 'lesser',
    in: 'include'
}
