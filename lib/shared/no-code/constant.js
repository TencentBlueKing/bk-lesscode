export const FIELDS_TYPES = [
    {
        type: 'STRING',
        name: '单行文本',
        default: '',
        comp: 'Input'
    },
    {
        type: 'TEXT',
        name: '多行文本',
        default: '',
        comp: 'Textarea'
    },
    {
        type: 'INT',
        name: '数字',
        default: 0,
        comp: 'Int'
    },
    {
        type: 'DATE',
        name: '日期',
        default: '',
        comp: 'Date'
    },
    {
        type: 'DATETIME',
        name: '时间',
        default: '',
        comp: 'Datetime'
    },
    {
        type: 'LINK',
        name: '链接',
        default: '',
        comp: 'Link'
    },
    {
        type: 'SELECT',
        name: '单选下拉框',
        default: '',
        comp: 'Select'
    },
    {
        type: 'INPUTSELECT',
        name: '可输入单选下拉框',
        default: '',
        comp: 'InputSelect'
    },
    {
        type: 'MULTISELECT',
        name: '多选下拉框',
        default: [],
        comp: 'MultiSelect'
    },
    {
        type: 'CHECKBOX',
        name: '复选框',
        default: [],
        comp: 'Checkbox'
    },
    {
        type: 'RADIO',
        name: '单选框',
        default: '',
        comp: 'Radio'
    },
    {
        type: 'MEMBER',
        name: '单选人员选择',
        default: [],
        comp: 'Member'
    },
    {
        type: 'MEMBERS',
        name: '多选人员选择',
        default: [],
        comp: 'Members'
    },
    {
        type: 'RICHTEXT',
        name: '富文本',
        default: '',
        comp: 'RichText'
    },
    {
        type: 'FILE',
        name: '附件上传',
        default: '',
        comp: 'Upload'
    },
    {
        type: 'TABLE',
        name: '表格',
        default: [],
        comp: 'Table'
    },
    {
        type: 'DESC',
        name: '描述文本',
        default: '',
        comp: 'Description'
    },
    {
        type: 'DIVIDER',
        name: '分割线',
        comp: 'Divider'
    }
]

export const REGX_CHIOCE_LIST = [
    { id: 'EMPTY', name: '无', type: '' },
    { id: 'NUM', name: '数字0-9', type: 'INT' },
    { id: 'NUMWITHOUTZERO', name: '非零正整数', type: 'INT' },
    { id: 'FLOAT', name: '浮点数', type: 'STRING' },
    { id: 'NON_NEGATIVE', name: '非负数（0，正数，正浮点数）', type: 'STRING' },
    { id: 'NON_POSITIVE', name: '非正数（0，负数，负浮点数）', type: 'STRING' },
    { id: 'GTE_ZERO', name: '大于零的数（包括正数和正浮点数）', type: 'STRING' },
    { id: 'LTE_ZERO', name: '小于零的数（包括负数和负浮点数）', type: 'STRING' },
    { id: 'LOWER_EN', name: '仅小写字母', type: ['STRING', 'TEXT'] },
    { id: 'UPPER_EN', name: '仅大写字母', type: ['STRING', 'TEXT'] },
    { id: 'EN', name: '仅英文字符', type: ['STRING', 'TEXT'] },
    { id: 'EN_NUM', name: '仅能包含英文字符和数字', type: ['STRING', 'TEXT'] },
    { id: 'CH', name: '仅中文字符', type: ['STRING', 'TEXT'] },
    { id: 'EN_CH', name: '仅能包含中英文字符', type: ['STRING', 'TEXT'] },
    { id: 'EN_CH_NUM', name: '仅能包含中英文，数字，下划线', type: ['STRING', 'TEXT'] },
    { id: 'START_EN', name: '包含中英文，数字，以英文字符开头', type: ['STRING', 'TEXT'] },
    { id: 'EMAIL', name: '邮箱', type: 'STRING' },
    { id: 'PHONE_NUM', name: '内地手机号码', type: 'STRING' },
    { id: 'ID_CARD', name: '身份证', type: 'STRING' },
    { id: 'IP', name: 'IP地址', type: 'STRING' },
    { id: 'QQ', name: '腾讯QQ号', type: 'STRING' },
    { id: 'AFTER_DATE', name: '系统日期之后', type: 'DATE' },
    { id: 'BEFORE_DATE', name: '系统日期之前', type: 'DATE' },
    { id: 'ONLY_NOW_DATE', name: '系统日期', type: 'DATE' },
    { id: 'AFTER_TIME', name: '系统时间之后', type: 'DATETIME' },
    { id: 'BEFORE_TIME', name: '系统时间之前', type: 'DATETIME' }
]
