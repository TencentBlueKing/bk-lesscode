
import { MoreThanOrEqual } from 'typeorm'
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
let validateDataMsg = { result: true, errorMsg: '' }

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

function setSerialFielVlaue (serialNumber, serialRules, fieldData, data) {
    fieldData.value = serialRules.map(item => {
        if (item.type === 'formField') {
            const formField = data.find((formValue) => {
                return formValue.key === item.configValue
            }) || {}
            if (formField.choice?.length) {
                const values = formField.value.split(',')
                return formField.choice.filter((choiceItem) => {
                    return values.includes(choiceItem.key)
                }).map((choiceItem) => {
                    return choiceItem.name
                }).join(',')
            }
            return formField.value
        } else if (item.type === 'serialNumber') {
            return setSerialNumber(serialNumber, item.configValue)
        }
        return item.serialValue
    }).join('-')
}
// 查询周期内的表单数据
async function queryofrmDataList (resetCycle, formData, dataService) {
    let serialNumber = 0
    // 查询数据添加时间大于等于presentCycleStartDateTime的表单数据
    const dateTime = getResetCycleDate(resetCycle)
    const leng = await dataService.count(formData.tableName, {
        createTime: MoreThanOrEqual(dayjs(dateTime).format())
    })
    if (leng) {
        serialNumber = leng + 1
    }
    return serialNumber
}
// 获取周期时间
function getResetCycleDate (resetCycle) {
// 当前周期开始时间
    let presentCycleStartDateTime = 0
    const presentYear = new Date().getFullYear()
    const presentMonth = new Date().getMonth() + 1
    let presentWeek = new Date().getDay()
    const presentDay = new Date().getDate()
    
    if (presentWeek === 0) {
        // 由于周期要求认定一周的开始是从周一开始的，所以周日时需要减7
        presentWeek = -7
    }
    // 按重置周期查询当前周期内数据的条数，有数据则流水号延续，没有则使用初始值为流水号
    switch (resetCycle) {
        case 'year':
            presentCycleStartDateTime = new Date(`${presentYear}/01/01`).getTime()
            break
        case 'month':
            presentCycleStartDateTime = new Date(`${presentYear}/${presentMonth}/01`).getTime()
            break
        case 'week':
            presentCycleStartDateTime = new Date(presentYear, presentMonth, presentDay - presentWeek + 1).getTime()
            break
        case 'day':
            presentCycleStartDateTime = new Date(`${presentYear}/${presentMonth}/${presentDay}`).getTime()
            break
        default:
            break
    }
    return presentCycleStartDateTime
}
// 获取流水号
async function getSerialNumber (resetCycle, formData, dataService) {
    const num = await queryofrmDataList(resetCycle, formData, dataService)
    return num
}
// 获取流水号
function setSerialNumber (serialNumber, number) {
    const serialNumberStr = `${serialNumber}`
    if (number > serialNumberStr.length) {
        serialNumber = serialNumberStr.padStart(number, '0')
    } else if (number < serialNumberStr.length) {
        validateDataMsg = {
            result: false, errorMsg: '当前周期内编号位数已超过流水号所设置的位数值'
        }
    }
    return serialNumber
}
// const isValueInOption = (field, val) => {
//     // 无值的时候 默认为true（必填在提交的时候校验）
//     console.log(field.choice.map(item => item.key), val)
//     return val ? true : field.choice.some(option => option.key === val)
// }
/**
 * nocode表单校验
 * @param {[]fields} fields 字段列表
 * @returns validateDataMsg  {result:'' , errorMsg:''}
 */
export const validateData = async (fields, data, formData, dataService) => {
    const len = fields.length
    for (let i = 0; i < len; i++) {
        const field = fields[i]
        const fieldData = data.find(item => item.key === field.key)
        const val = fieldData?.value || ''
        const { type, regex, meta } = field
        if (type === 'SERIAL' && meta.serial_config_info) {
            const { resetCycle, initNumber, serialRules } = meta.serial_config_info
            const serialNumber = await getSerialNumber(resetCycle, formData, dataService) || initNumber
            setSerialFielVlaue(serialNumber, serialRules, fieldData, data)
        }
        if (hasValidateRulesType.includes(type) && regex !== 'EMPTY') {
            const value = type === 'INT' ? Number(val) : val
            if (!timeValidateKeys.includes(regex)) {
                if (!isPassValidate(regex, value)) {
                    validateDataMsg = returnValidataMsg(regex)
                    break
                }
            } else {
                const isPassTimeValidate = timeValidate(regex, value)
                if (!isPassTimeValidate) {
                    validateDataMsg = returnValidataMsg(regex)
                    break
                }
            }
        }
    }
    return validateDataMsg
}
