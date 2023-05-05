import dayjs from 'dayjs'
export function deepClone (obj) {
    if (obj === null) return null
    if (['string', 'number', 'boolean', 'undefined', 'symbol'].includes(typeof obj)) {
        return obj
    }
    const clone = Object.assign({}, obj)
    Object.keys(clone).forEach(
        key =>
            (clone[key]
            = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key])
    )
    if (Array.isArray(obj)) {
        clone.length = obj.length
        return Array.from(clone)
    }
    return clone
}
export function getComBaseDefault (fieldesType, type) {
    const fielde = fieldesType.find(item => item.type === type) || {}
    if (fielde.hasOwnProperty('default')) {
        return fielde.default
    }
    return ''
}

export function computDateDiff (computConfigInfo) {
    const startDate = computConfigInfo.dateTime.startDate
    const endDate = computConfigInfo.dateTime.endDate
    const { startDateValue, endDateValue } = setDateAccuracy(startDate.value, endDate.value, computConfigInfo)
    let value = '--'
    if (startDateValue && endDateValue && (dayjs(endDateValue).diff(dayjs(startDateValue)) > 0)) {
        // 结束日期-开始日期
        const startDate = dayjs(startDateValue)
        const endDate = dayjs(endDateValue)
        const days = endDate.diff(startDate, 'day')
        const hours = parseInt(endDate.diff(startDate, 'hour') - (days * 24))
        const minutes = parseInt(endDate.diff(startDate, 'minute') - (days * 24 * 60 + hours * 60))
        value = this.$t('{0}天', [days])
        const accuracyResult = computConfigInfo.dateTime.accuracyResult
        if (accuracyResult !== 'day') {
            value += this.$t('{0}小时', [hours])
            if (accuracyResult === 'minutes') {
                value += this.$t('{0}分钟', [minutes])
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
function setDateAccuracy (startDateValue, endDateValue, computConfigInfo) {
    // 如果开始和结束日期的精度不是时分秒，且精度选择时或分
    if (checkAccuracy(startDateValue, endDateValue) && computConfigInfo.dateTime.accuracyResult !== 'day') {
        const defaultTime = computConfigInfo.dateTime.defaultTime
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
            const err = { msg: this.$t('请设置正确的计算公式') }
            throw err
        }
    } else {
        const err = { msg: this.$t('无法确定表达式的安全性') }
        throw err
    }
    return res
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
// 计算数值结果
export function computeNumberResult (numberComput) {
    let res = 0
    // 数值计算
    if (numberComput.formula) {
        if (numberComput.formula === 'customize') {
            const realFormula = getRealFormula(numberComput.customizeFormula)
            res = evalFun(realFormula)
        } else {
            res = computeFormulas[numberComput.formula](numberComput.computeFields)
        }
        res = Number(res || 0).toFixed(numberComput.decimal)
    } else {
        res = '--'
    }
    if (numberComput.unit.position === 'prefix') {
        res = `${numberComput.unit.value}${res}`
    } else {
        res = `${res}${numberComput.unit.value}`
    }
    return res
}
