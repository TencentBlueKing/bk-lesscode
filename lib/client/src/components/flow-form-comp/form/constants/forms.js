// 支持数据源的字段类型
export const DATA_SOURCE_FIELD = ['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO']

// 不需要查看的字段
export const NO_VIEWED_FIELD = ['DESC', 'DIVIDER']

export const CONDITION_FUNCTION_MAP = {
    '==': 'equeal',
    '>=': 'greaterOrEqual',
    '<=': 'lessOrEaqual',
    '>': 'greater',
    '<': 'lesser',
    in: 'include'
}
