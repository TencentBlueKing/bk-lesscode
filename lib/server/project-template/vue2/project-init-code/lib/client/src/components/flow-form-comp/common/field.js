export const RICHTEXT_FIELD = {
    api_instance_id: null,
    choice: [],
    default: '',
    desc: '',
    is_readonly: false,
    key: 'FU_WEN_BEN',
    kv_relation: Object,
    layout: 'COL_12',
    mandatory_conditions: Object,
    meta: {},
    name: window.i18n.t('富文本'),
    regex: 'EMPTY',
    show_conditions: {},
    show_type: 1, // 为0表示条件隐藏
    source_type: 'CUSTOM',
    type: 'RICHTEXT',
    unique: false,
    validate_type: 'OPTION'
}

export const FORM_SYS_FIELD = [
    { id: 'createUser', key: 'createUser', name: window.i18n.t('提交人'), type: 'MEMBER' },
    { id: 'createTime', key: 'createTime', name: window.i18n.t('提交时间'), type: 'DATETIME' },
    { id: 'updateUser', key: 'updateUser', name: window.i18n.t('更新人'), type: 'MEMBER' },
    { id: 'updateTime', key: 'updateTime', name: window.i18n.t('更新时间'), type: 'DATETIME' }
]

export const FLOW_SYS_FIELD = [
    { id: 'operator', key: 'operator', name: window.i18n.t('处理人'), type: 'MEMBER' },
    { id: 'operate_at', key: 'operate_at', name: window.i18n.t('处理时间'), type: 'DATETIME' }
]
