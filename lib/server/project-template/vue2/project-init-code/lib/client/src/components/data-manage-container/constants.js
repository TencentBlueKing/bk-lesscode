/* eslint-disable */
// 内置系统字段
export const FORM_SYS_FIELD = [
    { id: 'createUser', key: 'createUser', name: window.i18n.t('提交人'), type: 'member' },
    { id: 'createTime', key: 'createTime', name: window.i18n.t('提交时间'), type: 'datetime' },
    { id: 'updateUser', key: 'updateUser', name: window.i18n.t('更新人'), type: 'member' },
    { id: 'updateTime', key: 'updateTime', name: window.i18n.t('更新时间'), type: 'datetime' }
]

// 可被作为筛选条件的字段
export const CAN_BE_FILTING_FIELDS = [
    'input',
    'textarea',
    'int',
    'date',
    'datetime',
    'link',
    'select',
    'multiple-select',
    'radio',
    'checkbox',
    'member',
    'members'
]

// 不在表格中展示的字段
export const FIELDS_NOT_DISPLAYED_IN_TABLE = [
    'description',
    'divider',
    'auto-counting'
]
