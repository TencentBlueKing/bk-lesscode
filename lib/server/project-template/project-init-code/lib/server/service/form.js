import {
    LessThan,
    LessThanOrEqual,
    MoreThan,
    MoreThanOrEqual
} from './data-service'

// 基于 conditions 获取查询数据
export const parseConditions = (conditions) => {
    const {
        connector,
        expressions
    } = conditions
    const where = connector === 'or' ? [] : {}
    const getExpression = ({
        key,
        type,
        condition,
        value
    }) => {
        const whereCondition = {
            [key]: value
        }
        if (type === 'system' && value === '{{date}}') {
            whereCondition[key] = new Date()
        }
        switch (condition) {
            case '>':
                whereCondition[key] = MoreThan(whereCondition[key])
                break
            case '>=':
                whereCondition[key] = MoreThanOrEqual(whereCondition[key])
                break
            case '<':
                whereCondition[key] = LessThan(whereCondition[key])
                break
            case '<=':
                whereCondition[key] = LessThanOrEqual(whereCondition[key])
                break
        }
        return whereCondition
    }
    expressions.forEach((expression) => {
        if (connector === 'or') {
            where.push(getExpression(expression))
        } else {
            Object.assign(
                where,
                getExpression(expression)
            )
        }
    })
    return where
}
