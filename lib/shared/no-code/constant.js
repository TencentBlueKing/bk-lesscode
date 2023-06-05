import { sharedI18n } from '../util'
export const FIELDS_TYPES = () => ([
    {
        type: 'STRING',
        name: sharedI18n().t('单行文本'),
        default: '',
        comp: 'Input',
        icon: 'icon bk-drag-icon bk-drag-danxingwenben'
    },
    {
        type: 'TEXT',
        name: sharedI18n().t('多行文本'),
        default: '',
        comp: 'Textarea',
        icon: 'icon bk-drag-icon bk-drag-duoxingwenben'
    },
    {
        type: 'INT',
        name: sharedI18n().t('数字'),
        default: 0,
        comp: 'Int',
        icon: 'icon bk-drag-icon bk-drag-shuzi'
    },
    {
        type: 'DATE',
        name: sharedI18n().t('日期'),
        default: '',
        comp: 'Date',
        icon: 'icon bk-drag-icon bk-drag-riqi'
    },
    {
        type: 'DATETIME',
        name: sharedI18n().t('时间'),
        default: '',
        comp: 'Datetime',
        icon: 'icon bk-drag-icon bk-drag-shijian'
    },
    {
        type: 'LINK',
        name: sharedI18n().t('链接'),
        default: '',
        comp: 'Link',
        icon: 'icon bk-drag-icon bk-drag-lianjie'
    },
    {
        type: 'SELECT',
        name: sharedI18n().t('单选下拉框'),
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
        name: sharedI18n().t('多选下拉框'),
        default: [],
        comp: 'MultiSelect',
        icon: 'icon bk-drag-icon bk-drag-duoxuanxiala'
    },
    {
        type: 'CHECKBOX',
        name: sharedI18n().t('复选框'),
        default: [],
        comp: 'Checkbox',
        icon: 'icon bk-drag-icon bk-drag-duoxuankuang'
    },
    {
        type: 'RADIO',
        name: sharedI18n().t('单选框'),
        default: '',
        comp: 'Radio',
        icon: 'icon bk-drag-icon bk-drag-danxuankuang'
    },
    {
        type: 'MEMBER',
        name: sharedI18n().t('单选人员选择'),
        default: [],
        comp: 'Member',
        icon: 'icon bk-drag-icon bk-drag-danxuanrenyuanxuanze'
    },
    {
        type: 'MEMBERS',
        name: sharedI18n().t('多选人员选择'),
        default: [],
        comp: 'Members',
        icon: 'icon bk-drag-icon bk-drag-duoxuanrenyuanxuanze'
    },
    {
        type: 'RICHTEXT',
        name: sharedI18n().t('富文本'),
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
        name: sharedI18n().t('表格'),
        default: [],
        comp: 'Table',
        icon: 'icon bk-drag-icon bk-drag-zidingyibiaoge'
    },
    {
        type: 'DESC',
        name: sharedI18n().t('描述文本'),
        default: '',
        comp: 'Description',
        icon: 'icon bk-drag-icon bk-drag-miaoshuwenben'
    },
    {
        type: 'DIVIDER',
        name: sharedI18n().t('分割线'),
        comp: 'Divider',
        icon: 'icon bk-drag-icon bk-drag-fengexian'
    },
    {
        type: 'RATE',
        name: sharedI18n().t('评分'),
        default: 0,
        comp: 'Rate',
        icon: 'icon bk-drag-icon bk-drag-rate'
    },
    {
        type: 'COMPUTE',
        name: sharedI18n().t('计算控件'),
        default: '--',
        comp: 'Compute',
        icon: 'icon bk-drag-icon bk-drag-fc-count'
    },
    {
        type: 'SERIAL',
        name: sharedI18n().t('自动编号'),
        default: '--',
        comp: 'Serial',
        icon: 'icon bk-drag-icon bk-drag-liebiao'
    }
])

// 可以比较值是否相等的字段类型
export const COMPARABLE_VALUE_TYPES = [
    'STRING', 'TEXT', 'INT', 'DATE', 'DATETIME', 'LINK', 'SELECT', 'INPUTSELECT',
    'MULTISELECT', 'CHECKBOX', 'RADIO', 'MEMBER', 'MEMBERS', 'RATE'
]
// 值可能为多个的字段类型
export const MULTIPLE_VALUE_TYPES = ['MULTISELECT', 'CHECKBOX', 'MEMBERS', 'FILE', 'TABLE']

export const REGX_CHIOCE_LIST = () => ([
    { id: 'EMPTY', name: sharedI18n().t('无'), type: '' },
    { id: 'NUM', name: sharedI18n().t('数字0-9'), type: 'INT' },
    { id: 'NUMWITHOUTZERO', name: sharedI18n().t('非零正整数'), type: 'INT' },
    { id: 'FLOAT', name: sharedI18n().t('浮点数'), type: 'STRING' },
    { id: 'NON_NEGATIVE', name: sharedI18n().t('非负数（0，正数，正浮点数）'), type: 'STRING' },
    { id: 'NON_POSITIVE', name: sharedI18n().t('非正数（0，负数，负浮点数）'), type: 'STRING' },
    { id: 'GTE_ZERO', name: sharedI18n().t('大于零的数（包括正数和正浮点数）'), type: 'STRING' },
    { id: 'LTE_ZERO', name: sharedI18n().t('小于零的数（包括负数和负浮点数）'), type: 'STRING' },
    { id: 'LOWER_EN', name: sharedI18n().t('仅小写字母'), type: ['STRING', 'TEXT'] },
    { id: 'UPPER_EN', name: sharedI18n().t('仅大写字母'), type: ['STRING', 'TEXT'] },
    { id: 'EN', name: sharedI18n().t('仅英文字符'), type: ['STRING', 'TEXT'] },
    { id: 'EN_NUM', name: sharedI18n().t('仅能包含英文字符和数字'), type: ['STRING', 'TEXT'] },
    { id: 'CH', name: sharedI18n().t('仅中文字符'), type: ['STRING', 'TEXT'] },
    { id: 'EN_CH', name: sharedI18n().t('仅能包含中英文字符'), type: ['STRING', 'TEXT'] },
    { id: 'EN_CH_NUM', name: sharedI18n().t('仅能包含中英文，数字，下划线'), type: ['STRING', 'TEXT'] },
    { id: 'START_EN', name: sharedI18n().t('包含中英文，数字，以英文字符开头'), type: ['STRING', 'TEXT'] },
    { id: 'EMAIL', name: sharedI18n().t('邮箱'), type: 'STRING' },
    { id: 'PHONE_NUM', name: sharedI18n().t('内地手机号码'), type: 'STRING' },
    { id: 'ID_CARD', name: sharedI18n().t('身份证'), type: 'STRING' },
    { id: 'IP', name: sharedI18n().t('IP地址'), type: 'STRING' },
    { id: 'QQ', name: sharedI18n().t('腾讯QQ号'), type: 'STRING' },
    { id: 'AFTER_DATE', name: sharedI18n().t('系统日期之后'), type: 'DATE' },
    { id: 'BEFORE_DATE', name: sharedI18n().t('系统日期之前'), type: 'DATE' },
    { id: 'ONLY_NOW_DATE', name: sharedI18n().t('系统日期'), type: 'DATE' },
    { id: 'AFTER_TIME', name: sharedI18n().t('系统时间之后'), type: 'DATETIME' },
    { id: 'BEFORE_TIME', name: sharedI18n().t('系统时间之前'), type: 'DATETIME' }
])

export const INIT_FLOW_STRUCTURE = () => ({
    states: [
        {
            id: 0,
            name: sharedI18n().t('开始'),
            desc: '',
            type: 'START',
            axis: {
                x: 80,
                y: 150
            },
            is_builtin: true,
            is_draft: false,
            fields: [],
            extras: {},
            variables: {
                inputs: [],
                outputs: []
            }
        },
        {
            id: 1,
            name: sharedI18n().t('提单'),
            desc: '',
            axis: {
                x: 200,
                y: 150
            },
            is_builtin: true,
            is_draft: true,
            fields: [],
            type: 'NORMAL',
            extras: {},
            variables: {
                inputs: [],
                outputs: []
            }
        },
        {
            id: 2,
            name: sharedI18n().t('数据处理节点'),
            desc: '',
            type: 'WEBHOOK',
            axis: {
                x: 550,
                y: 160
            },
            is_builtin: false,
            is_draft: true,
            fields: [],
            extras: {
                node_type: 'DATA_PROC',
                webhook_info: {},
                is_system_add: true
            },
            variables: {
                inputs: [],
                outputs: []
            }
        },
        {
            id: 3,
            name: sharedI18n().t('结束'),
            desc: '',
            type: 'END',
            axis: {
                x: 925,
                y: 150
            },
            is_builtin: true,
            is_draft: false,
            fields: [],
            extras: {},
            variables: {
                inputs: [],
                outputs: []
            }
        }
    ],
    transitions: [
        {
            from_state: 0,
            to_state: 1
        },
        {
            from_state: 1,
            to_state: 2
        },
        {
            from_state: 2,
            to_state: 3
        }
    ]
})

export const TICKET_STATUS = () => ([
    {
        name: sharedI18n().t('新'),
        key: 'NEW',
        color: '#3a84ff',
        backgroundColor: '#edf4ff'
    },
    {
        name: sharedI18n().t('处理中'),
        key: 'RUNNING',
        color: '#3a84ff',
        backgroundColor: '#edf4ff'
    },
    {
        name: sharedI18n().t('已解决'),
        key: 'RESOLVED',
        color: '#14a568',
        backgroundColor: '#e4faf0'
    },
    {
        name: sharedI18n().t('待确认'),
        key: 'CONFIRMED',
        color: '#3a84ff',
        backgroundColor: '#edf4ff'
    },
    {
        name: sharedI18n().t('挂起'),
        key: 'SUSPENDED',
        color: '#63656e',
        backgroundColor: '#f0f1f5'
    },
    {
        name: sharedI18n().t('已完成'),
        key: 'FINISHED',
        color: '#14a568',
        backgroundColor: '#e4faf0'
    },
    {
        name: sharedI18n().t('已终止'),
        key: 'TERMINATED',
        color: '#ea3536',
        backgroundColor: '#feebea'
    },
    {
        name: sharedI18n().t('已撤销'),
        key: 'REVOKED',
        color: '#63656e',
        backgroundColor: '#f0f1f5'
    }
])
