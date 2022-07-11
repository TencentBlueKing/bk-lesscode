import { isEqual } from 'lodash'
import { CONDITION_FUNCTION_MAP } from './constants/forms.js'
export default {
    methods: {
        isObjectHaveAttr (value) {
            return !!Object.keys(value).length
        },

        parseFieldConditions () {
            const len = this.fields.length
            for (let i = 0; i < len; i++) {
                // 必填
                if (this.isObjectHaveAttr(this.fields[i].mandatory_conditions)) {
                    this.isFullfillCondition(this.fields[i].mandatory_conditions)
                        ? this.$set(this.fields[i], 'validate_type', 'REQUIRE')
                        : this.$set(this.fields[i], 'validate_type', 'OPTION')
                    // function 判断是否符合设置条件 里面包含 各种操作符号 >= ...
                }
                // 只读
                if (this.isObjectHaveAttr(this.fields[i].read_only_conditions)) {
                    this.isFullfillCondition(this.fields[i].read_only_conditions)
                        ? this.$set(this.fields[i], 'is_readonly', true)
                        : this.$set(this.fields[i], 'is_readonly', false)
                }
                // 显隐
                if (this.isObjectHaveAttr(this.fields[i].show_conditions)) {
                    this.isFullfillCondition(this.fields[i].show_conditions)
                        ? this.$set(this.fields[i], 'show_type', 1)
                        : this.$set(this.fields[i], 'show_type', 0)
                }
            }
        },
        // 是否满足条件
        isFullfillCondition (condition) {
            // 且或逻辑处理        遍历条件  or  some || and every
            if (condition.connector === 'and' || condition.type === 'and') {
                // 这里需要对符号判断
                return condition.expressions?.every((item) => {
                    const func = CONDITION_FUNCTION_MAP[item.condition]
                    return this[func](this.localValue[item.key], item.value)
                })
            }
            //  or 的条件处理
            return condition.expressions?.some((item) => {
                const func = CONDITION_FUNCTION_MAP[item.condition]
                return this[func](this.localValue[item.key], item.value)
            })
        },
        // 流程详情中判断显隐
        isFieldShow (condition, fieldList) {
            // 且或逻辑处理        遍历条件  or  some || and every
            if (condition.connector === 'and' || condition.type === 'and') {
                // 这里需要对符号判断
                return condition.expressions?.every((item) => {
                    const func = CONDITION_FUNCTION_MAP[item.condition]
                    return this[func](
                        fieldList.find(el => el.key === item.key)?.value,
                        item.value

                    )
                })
            }
            //  or 的条件处理
            return condition.expressions?.some((item) => {
                const func = CONDITION_FUNCTION_MAP[item.condition]
                return this[func](
                    fieldList.find(el => el.key === item.key)?.value,
                    item.value
                )
            })
        },
        equeal (param1, param2) {
            return isEqual(param1, param2)
        },
        greaterOrEqual (param1, param2) {
            return param1 >= param2
        },
        lessOrEaqual (param1, param2) {
            return param1 <= param2
        },
        greater (param1, param2) {
            return param1 > param2
        },
        lesser (param1, param2) {
            return param2 < param1
        },
        include (param1, param2) {
            return param1.includes(param2)
        }
    }
}
