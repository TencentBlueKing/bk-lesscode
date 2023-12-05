import { h, framework } from 'bk-lesscode-render'
import { cloneDeep, debounce, isEqual } from 'lodash'
import dayjs from 'dayjs'
import { isValEmpty } from '@/common/util'
import { getFieldDefaultVal } from '../utils/index'
import { isConditionsMet, computeFormulas, getRealFormula, evalFun, computeDateDiff } from '../utils/condition-parser'
import fieldWidget from '../fields/index'
import './index.postcss'

export default {
    name: 'form-engine-renderer',
    inheritAttrs: false,
    props: {
        dataSource: Object,
        // 字段列表
        fields: {
            type: Array,
            default: () => []
        },
        // 表单行布局
        rowLayout: {
            type: String,
            default: 'full'
        },
        // 表单操作按钮
        actions: {
            type: Object,
            default: () => ({
                submit: false,
                reset: false
            })
        }
    },
    data () {
        const { type, id, relatedId } = this.dataSource
        const formId = type === 'USE_FORM' ? relatedId : id
        return {
            formId,
            tableName: '',
            value: this.getDefaultVal(),
            readonlyMap: {},
            requiredMap: {},
            hiddenMap: {},
            loading: false,
            pending: false
        }
    },
    mounted () {
        this.setFieldsWriteAttr()
        this.getFormDetail()
        // 解析默认值关联规则，将满足关联规则的值设置为字段的默认值
        this.fields.forEach(async (field) => {
            const { key } = field.configure
            if ('valLinkageRules' in field.configure) {
                this.parseAssociationValRules(key)
            }
            if ('computedConfig' in field.configure) {
                this.setComputedFieldValue(field)
            }
        })
        this.parseAssociationValRulesDebounce = debounce(this.parseAssociationValRules, 500)
        this.setFieldsWriteAttrDebounce = debounce(this.setFieldsWriteAttr, 500)
    },
    methods: {
        getDefaultVal () {
            const value = {}
            this.fields.forEach(field => {
                if ('value' in field.configure) {
                    value[field.configure.key] = cloneDeep(field.configure.value)
                } else if (field.type === 'table') {
                    value[field.configure.key] = []
                }
            })
            return value
        },
        async getFormDetail () {
            this.loading = true
            const res = await this.$http.get(`/nocode-form/detail?formId=${this.formId}`)
            this.tableName = res.data.tableName
            this.loading = false
        },
        // 设置字段的只读、必填、显隐属性
        setFieldsWriteAttr () {
            this.fields.forEach(field => {
                const { key, readonly, required, hidden } = field.configure
                if (readonly && readonly.enable) {
                    this.setDataAttr(this.readonlyMap, key, isConditionsMet(readonly.config, this.value))
                }
                if (required && required.enable) {
                    this.setDataAttr(this.requiredMap, key, isConditionsMet(required.config, this.value))
                }
                if (hidden && hidden.enable) {
                    this.setDataAttr(this.hiddenMap, key, isConditionsMet(hidden.config, this.value))
                }
            })
        },
        // 设置字段的只读、必填、显隐映射
        setDataAttr (attr, key, val) {
            if (framework === 'vue3') {
                attr[key] = val
            } else {
                this.$set(attr, key, val)
            }
        },
        // 设置计算控件字段的值
        setComputedFieldValue (field) {
            const { key, computedConfig } = field.configure
            // 修改计算控件的值
            const { type, config } = computedConfig
            if (type === 'dateTime') {
                // 计算时间间隔
                let isChange = false
                // 日期计算
                const dateKeys = ['creation_date', 'update_date', 'specify_date']
                const dateTimeKeys = ['startDate', 'endDate']
                dateTimeKeys.forEach((strItem) => {
                    const key = config[strItem].key
                    if (!dateKeys.includes(key)) {
                        // 找到对应的日期字段的值
                        config[strItem].value = this.value[key]
                        isChange = true
                    }
                })
                if (isChange) {
                    this.value[key] = computeDateDiff(computedConfig)
                }
                this.value[key] = ''
            } else {
                let fieldsKey = 'computeFields'
                if (config.formula === 'customize') {
                    fieldsKey = 'customizeFormula'
                }
                config[fieldsKey] = config[fieldsKey].map((item) => {
                    const key = item.key || item
                    return {
                        key,
                        value: this.value[key]
                    }
                })
                let result = 0
                // 数值计算
                if (config.formula) {
                    if (config.formula === 'customize') {
                        const realFormula = getRealFormula(config.customizeFormula)
                        result = evalFun(realFormula)
                    } else {
                        result = computeFormulas[config.formula](config.computeFields)
                    }
                    result = Number(result || 0).toFixed(config.decimal)
                } else {
                    result = '--'
                }
                if (config.unit.position === 'prefix') {
                    result = `${config.unit.value}${result}`
                } else {
                    result = `${result}${config.unit.value}`
                }
                this.value[key] = result
            }
        },
        // 获取当前表单满足联动规则设置的生效规则项
        getFulfillAssociationRule (rules, fieldType) {
            // 某个字段所配置的所有规则
            let fulfillRule = null
            rules.forEach(group => {
                // 找出最后一条满足所有关联字段所设置条件的规则
                const isfullFill = group.relations.every(relation => {
                    const { field: relFieldKey, type, value } = relation
                    // 如果是评分组件
                    if (fieldType === 'rate') {
                        // 评分组件所绑定的字段默认为变量类型
                        const relationValue = relation.type === 'CONST' ? (relation.value * 1) : this.value[relation.value] * 1
                        return group.intervals?.some((item) => {
                            return (item.min <= relationValue) && (relationValue < item.max)
                        })
                    } else {
                        if (!(relFieldKey in this.value)) {
                            return
                        }
                        if (type === 'CONST') { // 字段值是否等于常量
                            return isEqual(this.value[relFieldKey], value)
                        }
                        // 字段值是否等于变量
                        return value in this.value && isEqual(this.value[relFieldKey], this.value[value])
                    }
                })
                if (isfullFill) {
                    fulfillRule = group
                }
            })
            return fulfillRule
        },
        // 获取关联他表字段的筛选数据
        getAssociationFilterData (key) {
            const field = this.fields.find(item => item.configure.key === key)
            const { tableName, rules } = field.configure.valLinkageRules
            const query = {}
            rules[0].relations.forEach(item => {
                const val = item.type === 'CONST' ? item.value : this.value[item.value]
                query[item.field] = val
            })
            const params = {
                fields: [rules[0].target.value, 'id'],
                query
            }
            return this.$http.post(`/nocode/filterTableData/keys/tableName/${tableName}`, params)
        },
        // 获取关联规则中包含当前字段key的字段列表
        getValAssociatedFields (key) {
            return this.fields.filter(field => {
                if (field.configure.valLinkageRules) {
                    const { type, rules } = field.configure.valLinkageRules
                    return rules.some(group => {
                        return group.relations.find(item => {
                            if (type === 'currentTable') {
                                return item.field === key
                            } else {
                                return item.type === 'VAR' && item.value === key
                            }
                        })
                    })
                }
            })
        },
        // 解析表单字段间的默认值联动
        parseAssociationValRules (key) {
            const associatedFields = this.getValAssociatedFields(key)
            associatedFields.forEach(async field => {
                const { type, rules } = field.configure.valLinkageRules
                if (type === 'currentTable') {
                    // 获取每个字段的有效规则
                    const rule = this.getFulfillAssociationRule(rules, field.type)
                    if (rule) {
                        let value = null
                        if (field.type === 'rate') {
                            // 遍历所有区间，看所绑定的字段值命中那个区间，评分组件的值就是该区间的值
                            rule.intervals?.forEach((item) => {
                                const triggerValue = this.value[key] * 1
                                if ((item.min <= triggerValue) && triggerValue < item.max) {
                                    value = item.value
                                }
                            })
                        } else {
                            value = rule.target.type === 'CONST' ? rule.target.value : this.value[rule.target.value]
                        }
                        this.value[field.configure.key] = value
                    }
                } else if (type === 'otherTable') {
                    const res = await this.getAssociationFilterData(field.configure.key)
                    if (res.data.list.length === 1) {
                        this.value[field.configure.key] = res.data.list[0][rules[0].target.value]
                    }
                } else if (type === 'createTicketTime') {
                    this.value[field.key] = field.type === 'date' ? dayjs().format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD HH:mm:ss')
                }
            })
        },
        handleChange (key, val) {
            this.value[key] = cloneDeep(val)
            this.setFieldsWriteAttrDebounce()
            this.parseAssociationValRulesDebounce(key)
            this.fields.forEach(field => {
                if ('computedConfig' in field.configure) {
                    this.setComputedFieldValue(field)
                }
            })
        },
        validate () {
            let valid = true
            this.fields.some(field => {
                // 隐藏的表单不校验
                if (this.hiddenMap[field.configure.key]) {
                    return
                }
                if (this.requiredMap[field.configure.key] && isValEmpty(this.value[field.configure.key])) {
                    valid = false
                    this.$bkMessage({
                        theme: 'error',
                        message: this.$t('字段【{0}】为必填项', [field.configure.name])
                    })
                    return true
                }
            })
            return valid
        },
        async handleSubmit () {
            if (!this.validate()) {
                return
            }
            try {
                this.pending = true
                const formattedVal = []
                Object.keys(this.value).forEach(key => {
                    const val = this.value[key]
                    const field = this.fields.find(item => item.configure.key === key)
                    if (Array.isArray(val) && field.type !== 'table') {
                        formattedVal.push({ key, value: val.join(',') })
                    } else {
                        formattedVal.push({ key, value: val })
                    }
                })
                await this.$http.post(`/data-source/user/tableName/${this.tableName}?formId=${this.formId}`, formattedVal)
                this.$bkMessage({
                    theme: 'success',
                    message: this.$t('表单数据添加成功')
                })
            } catch (e) {
                console.error(e)
            } finally {
                this.pending = false
            }
        },
        handleReset () {
            const defaultVal = {}
            this.fields.forEach(field => {
                defaultVal[field.configure.key] = getFieldDefaultVal(field.type)
            })
            this.value = defaultVal
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderFields = () => h({
            component: 'div',
            class: ['bkform-engine-renderer-fields', { 'half-row-layout': self.rowLayout === 'half' }],
            children: self.fields.filter(field => field.type !== 'auto-counting' && !self.hiddenMap[field.configure.key]).map(field => h({
                component: fieldWidget,
                class: { 'full-row': field.type === 'rich-text' },
                props: {
                    key: field.id,
                    fieldData: field,
                    formValue: self.value,
                    required: self.requiredMap[field.configure.key],
                    readonly: self.readonlyMap[field.configure.key],
                    value: self.value[field.configure.key]
                },
                on: {
                    change (val) {
                        // vue3 组件会多触发两次事件
                        if (!(val instanceof Event)) {
                            self.handleChange(field.configure.key, val)
                        }
                    }
                }
            }))
        })

        const renderActions = () => {
            const actionComps = []

            if (self.actions.submit) {
                actionComps.push(h({
                    component: 'bk-button',
                    props: {
                        theme: 'primary',
                        disabled: self.loading,
                        loading: self.pending
                    },
                    on: {
                        click: () => {
                            self.handleSubmit()
                        }
                    },
                    children: [self.$t('提交')]
                }))
            }

            if (self.actions.reset) {
                actionComps.push(h({
                    component: 'bk-button',
                    on: {
                        click: () => {
                            self.handleReset()
                        }
                    },
                    children: [self.$t('清空')]
                }))
            }

            if (actionComps.length > 0) {
                return h({
                    component: 'div',
                    class: 'bkform-engine-renderer-actions',
                    children: actionComps
                })
            }

            return null
        }

        return h({
            component: 'div',
            class: ['bkform-engine-renderer', { 'has-btns-area': self.actions.submit || self.actions.reset }],
            children: [
                renderFields(),
                renderActions()
            ]
        })
    }
}
