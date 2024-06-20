import { isEqual } from 'lodash'
import dayjs from 'dayjs'
/**
 * 是否满足条件
 * @param {Object} condition 条件配置
 * @param {Object} formValue 整个表单的value
 */
const getResult = (condition, formValue) => {
    const { key, logic, value } = condition
    const fieldVal = (key in formValue) ? formValue[key] : ''
    switch (logic) {
        case '==':
            return isEqual(value, fieldVal)
        case '>=':
            return fieldVal >= value
        case '<=':
            return fieldVal <= value
        case '>':
            return fieldVal > value
        case '<':
            return fieldVal < value
        case 'in':
            return fieldVal.includes(value)
        default:
            return false
    }
}

export const isConditionsMet = (config, formValue) => {
    const { logic = 'and', conditions = [] } = config

    if (logic.toLowerCase() === 'and') {
        return conditions.every(condition => getResult(condition, formValue))
    } else {
        return conditions.some(condition => getResult(condition, formValue))
    }
}

// 计算公式
export const computeFormulas = {
    sum (fields) {
        let sum = 0
        fields.forEach((item) => {
            sum += Number(item.value)
        })
        return sum
    },
    averageValue (fields) {
        const leng = fields.length
        const res = this.sum(fields) / leng
        return res
    },
    median (fields) {
        const leng = fields.length
        let res = 0
        const fieldsNumber = fields.map((item) => {
            return Number(item.value)
        })
        fieldsNumber.sort((a, b) => {
            return a - b
        })
        if (leng % 2 === 0) {
            const index = leng / 2
            res = (fieldsNumber[index] + fieldsNumber[index + 1]) / 2
        } else {
            res = fieldsNumber[parseInt((leng / 2))]
        }
        return res
    },
    product (fields) {
        let res = 1
        fields.forEach((item) => {
            res *= Number(item.value)
        })
        return res
    },
    maxVlaue (fields) {
        const fieldsNumber = fields.map((item) => {
            return item.value
        })
        return Math.max(...fieldsNumber)
    },
    minVlaue (fields) {
        const fieldsNumber = fields.map((item) => {
            return item.value
        })
        return Math.min(...fieldsNumber)
    }
}

// 获取真实公式
export function getRealFormula (customizeFormula) {
    let formula = ''
    customizeFormula.forEach((item) => {
        const chars = ['+', '-', '*', '/', '(', ')']
        let value = item.key
        if (!chars.includes(item.key)) {
            value = item.value
        }
        formula += value
    })
    return formula
}
// 获取自定义公式计算结果
export function evalFun (formulaStr) {
    const safetyChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '(', ')']
    let res = ''
    const isSafety = [...formulaStr].some((char) => {
        return !safetyChars.includes(char)
    })
    if (!isSafety) {
        // 表示不存在危险字符
        try {
            // eslint-disable-next-line no-eval
            res = eval(formulaStr)
        } catch (error) {
            const err = { msg: '请设置正确的计算公式' }
            throw err
        }
    } else {
        const err = { msg: '无法确定表达式的安全性' }
        throw err
    }
    return res
}

export function computeDateDiff (config) {
    const { startDate, endDate } = config
    const { startDateValue, endDateValue } = setDateAccuracy(startDate.value, endDate.value, config)
    let value = '--'
    if (startDateValue && endDateValue && (dayjs(endDateValue).diff(dayjs(startDateValue)) > 0)) {
        // 结束日期-开始日期
        const startDate = dayjs(startDateValue)
        const endDate = dayjs(endDateValue)
        const days = endDate.diff(startDate, 'day')
        const hours = parseInt(endDate.diff(startDate, 'hour') - (days * 24))
        const minutes = parseInt(endDate.diff(startDate, 'minute') - (days * 24 * 60 + hours * 60))
        value = `${days}天`
        const accuracyResult = config.accuracyResult
        if (accuracyResult !== 'day') {
            value += `${hours}小时`
            if (accuracyResult === 'minutes') {
                value += `${minutes}分钟`
            }
        }
    }
    return value
}
// 检查日期精度
export function checkAccuracy (startDateValue, endDateValue) {
    if (!startDateValue || !endDateValue) {
        return true
    }
    const startDate = dayjs(startDateValue).format('YYYY-MM-DD HH:mm:ss')
    const endDate = dayjs(endDateValue).format('YYYY-MM-DD HH:mm:ss')
    // 时间格式字符串以00:00:00则表示精度为天
    if (startDate.includes('00:00:00') || endDate.includes('00:00:00')) {
        return true
    }
    return false
}
// 设置时间精度
function setDateAccuracy (startDateValue, endDateValue, config) {
    // 如果开始和结束日期的精度不是时分秒，且精度选择时或分
    if (checkAccuracy(startDateValue, endDateValue) && config.accuracyResult !== 'day') {
        const defaultTime = config.defaultTime
        if (defaultTime) {
            startDateValue = `${dayjs(startDateValue).format('YYYY-MM-DD ')} ${defaultTime}`
            endDateValue = `${dayjs(endDateValue).format('YYYY-MM-DD ')} ${defaultTime}`
        } else {
            startDateValue = ''
            endDateValue = ''
        }
    }
    return { startDateValue, endDateValue }
}
