const dayjs = require('dayjs')

// 有校验规则的组件类型
const hasValidateRulesType = ['INT', 'DATE', 'DATETIME', 'STRING', 'TEXT']

// 时间比较规则  -另外处理
const timeValidateKeys = ['AFTER_DATE', 'BEFORE_DATE', 'ONLY_NOW_DATE', 'AFTER_TIME', 'BEFORE_TIME']
// 规则key - name映射
const ruleNameMap = {
    'NUM': '数字0-9',
    'NUMWITHOUTZERO': '非零正整数',
    'FLOAT': '浮点数',
    'NON_NEGATIVE': '非负数（0，正数，正浮点数）',
    'NON_POSITIVE': '非正数（0，负数，负浮点数）',
    'GTE_ZERO': '大于零的数（包括正数和正浮点数）',
    'LTE_ZERO': '小于零的数（包括负数和负浮点数）',
    'LOWER_EN': '仅小写字母',
    'UPPER_EN': '仅大写字母',
    'EN': '仅英文字符',
    'EN_NUM': '仅能包含英文字符和数字',
    'CH': '仅中文字符',
    'EN_CH': '仅能包含中英文字符',
    'EN_CH_NUM': '仅能包含中英文，数字，下划线',
    'START_EN': '包含中英文，数字，以英文字符开头',
    'EMAIL': '邮箱',
    'PHONE_NUM': '内地手机号码',
    'ID_CARD': '身份证',
    'IP': 'IP地址',
    'QQ': '腾讯QQ号',
    'AFTER_DATE': '系统日期之后',
    'BEFORE_DATE': '系统日期之前',
    'ONLY_NOW_DATE': '系统日期',
    'AFTER_TIME': '系统时间之后',
    'BEFORE_TIME': '系统时间之前'
}

// 规则key-正则映射
const ruleRegexMap = {
    'NUM': /^[0-9]$/g,
    'NUMWITHOUTZERO': /^\+?[1-9][0-9]*$/g,
    'FLOAT': /^(-?\d+)\.(\d+)?$/g,
    'NON_NEGATIVE': /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*|[0-9]\d*$/g,
    'NON_POSITIVE': /^(-([1-9]\d*\.\d*|0\.\d*[1-9]\d*|[1-9]\d*))|0?\.0+|0$/g,
    'GTE_ZERO': /(?:^[1-9]([0-9]+)?(?:\.[0-9]{1,2})?$)|(?:^[0-9]\.[0-9](?:[0-9])?$)/g,
    'LTE_ZERO': /^(-([1-9]\d*\.\d*|0\.\d*[1-9]\d*|[1-9]\d*))$/g,
    'LOWER_EN': /^[a-z]+$/g,
    'UPPER_EN': /^[A-Z]+$/g,
    'EN': /^[a-zA-Z]+$/g,
    'EN_NUM': /^[a-zA-Z1-9]+$/g,
    'CH': /^[\u4E00-\u9FA5]+$/g,
    'EN_CH': /^[\u4e00-\u9fa5_a-zA-Z]*$/g,
    'EN_CH_NUM': /^[\u4e00-\u9fa5_a-zA-Z0-9]*$/g,
    'START_EN': /^[a-zA-Z]([\u4e00-\u9fa5a-zA-Z0-9])*$/g,
    'EMAIL': /^[0-9a-zA-Z_]{0,19}@[0-9a-zA-Z]{1,13}\.[com,cn,net]{1,3}$/g,
    'PHONE_NUM': /^(?:(?:\+|00)86)?1[3-9]\d{9}$/g,
    'ID_CARD': /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0\d|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/g,
    'IP': /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g,
    'QQ': /^[1-9][0-9]{4,10}$/g
}

const isPassValidate = (regexKey, value) => {
    // 重置正则得 lastIndex
    ruleRegexMap[regexKey].lastIndex = 0
    return ruleRegexMap[regexKey].test(value)
}
const timeValidate = (regexKey, value) => {
    switch (regexKey) {
        case 'AFTER_DATE': // 系统日期之后
            return dayjs(value).format('YYYY-MM-DD').valueOf() > dayjs().format('YYYY-MM-DD').valueOf()
        case 'BEFORE_DATE':
            return dayjs(value).format('YYYY-MM-DD').valueOf() < dayjs().format('YYYY-MM-DD').valueOf()
        case 'ONLY_NOW_DATE':
            return dayjs(value).format('YYYY-MM-DD').valueOf() === dayjs().format('YYYY-MM-DD').valueOf()
        case 'AFTER_TIME': // 系统时间之后
            return dayjs(value).format('YYYY-MM-DD HH:mm:ss').valueOf() > dayjs().format('YYYY-MM-DD HH:mm:ss').valueOf()
        case 'BEFORE_TIME':
            return dayjs(value).format('YYYY-MM-DD HH:mm:ss').valueOf() < dayjs().format('YYYY-MM-DD HH:mm:ss').valueOf()
    }
}

const returnValidataMsg = (regexKey) => {
    return {
        result: false,
        errorMsg: `校验规则 ${ruleNameMap[regexKey]},校验失败`
    }
}

/**
 * nocode表单校验
 * @param {[]fields} fields 字段列表
 * @returns validateDataMsg  {result:'' , errorMsg:''}
 */
export const validateData = (fields) => {
    let validateDataMsg = { result: true, errorMsg: '' }
    const len = fields.length || 0
    for (let i = 0; i < len; i++) {
        if (hasValidateRulesType.includes(fields[i].type) && fields[i].regex !== 'EMPTY') {
            const regexKey = fields[i].regex
            const value = fields[i].type === 'INT' ? Number(fields[i].value) : fields[i].value
            if (!timeValidateKeys.includes(regexKey)) {
                console.log('isPassValidate', isPassValidate(regexKey, value))
                console.log('!   isPassValidate', !isPassValidate(regexKey, value))
                if (!isPassValidate(regexKey, value)) {
                    validateDataMsg = returnValidataMsg(regexKey)
                    break
                }
            } else {
                const isPassTimeValidate = timeValidate(regexKey, value)
                if (!isPassTimeValidate) {
                    validateDataMsg = returnValidataMsg(regexKey)
                    break
                }
            }
        }
    }
    return validateDataMsg
}
