import pinyin from 'pinyin'

export function getFieldConditions (type) {
    if (
        ['STRING', 'TEXT', 'DATE', 'INPUTSELECT', 'SELECT', 'MULTISELECT', 'MEMBER',
            'MEMBERS', 'RICHTEXT', 'DESC', 'LINK'
        ].includes(type)
    ) {
        return [
            { id: '==', name: '等于' },
            // { id: '!=', name: '不等于' },
            { id: 'in', name: '包含' }
            // { id: 'not_in', name: '不包含' },
        ]
    }
    return [
        { id: '==', name: '等于' },
        // { id: '!=', name: '不等于' },
        { id: '>', name: '大于' },
        { id: '<', name: '小于' },
        { id: '>=', name: '大于等于' },
        { id: '<=', name: '小于等于' }
    ]
}


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

// 需要展示默认值的字段类型
export const FIELDS_SHOW_DEFAULT_VALUE = ['STRING', 'TEXT', 'INT', 'DATE', 'DATETIME', 'SELECT', 'MULTISELECT', 'INPUTSELECT', 'CHECKBOX', 'RADIO', 'MEMBER', 'MEMBERS', 'RICHTEXT', 'DESC', 'RATE']

// 字段数据源配置
export const FIELDS_SOURCE_TYPE = [
    {
        id: 'CUSTOM',
        name: window.i18n.t('自定义数据')
    },
    {
        id: 'FUNCTION',
        name: window.i18n.t('函数')
    },
    {
        id: 'WORKSHEET',
        name: window.i18n.t('表单数据')
    },
]

// 生成字段key
export function generateFieldKey (name, id) {
    return pinyin(name, {
        style: pinyin.STYLE_NORMAL,
        heteronym: false
    }).join('_').toUpperCase().concat(`_${id}`)
}
