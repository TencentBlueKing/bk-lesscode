import { uuid, getFieldDefaultVal } from '../utils/index'
import autoCountingConfig from './components/auto-counting-config'
import computedConfig from './components/computed-config'
import dataSource from './components/data-source'
import dividerConfig from './components/divider-config'
import hidden from './components/hidden'
import key from './components/key'
import labelTips from './components/label-tips'
import name from './components/name'
import placeholder from './components/placeholder'
import readonly from './components/readonly'
import required from './components/required'
import tableConfig from './components/table-config'
import valLinkageRules from './components/val-linkage-rules'
import validate from './components/validate'
import value from './components/value'

const setters = {
    autoCountingConfig: {
        component: autoCountingConfig,
        default: () => ({
            config: {
                resetCycle: 'noReset',
                initNumber: 1,
                serialRules: [
                    {
                        type: 'serialNumber',
                        configValue: 4,
                        serialValue: '0001',
                        name: window.i18n.t('流水号')
                    }
                ]
            },
            val: '0001'
        })
    },
    computedConfig: {
        component: computedConfig,
        default: () => ({
            type: 'number',
            config: {
                formula: '',
                customizeFormula: [],
                computeFields: [],
                unit: { value: '', position: 'prefix' },
                decimal: 0
            }
        })
    },
    dataSource: {
        component: dataSource,
        default: () => ({
            type: 'CUSTOM', // 取值有：CUSTOM(自定义)、FUNCTION(函数)、WORKSHEET(数据表)
            config: {},
            data: [
                { id: 'xuanxiang1', label: window.i18n.t('选项') + '1' },
                { id: 'xuanxiang2', label: window.i18n.t('选项') + '2' }
            ]
        })
    },
    dividerConfig: {
        component: dividerConfig,
        default: () => ({
            text: '',
            align: 'center',
            lineColor: '#787A7F'
        })
    },
    hidden: {
        component: hidden,
        default: () => ({
            enable: false,
            config: {
                logic: 'AND',
                conditions: []
            }
        })
    },
    key: {
        component: key,
        default: (type) => {
            return `${type}_${uuid()}`
        }
    },
    labelTips: {
        component: labelTips,
        default: ''
    },
    name: {
        component: name,
        default: (type, name) => name
    },
    placeholder: {
        component: placeholder,
        default: ''
    },
    readonly: {
        component: readonly,
        default: () => ({
            enable: false,
            config: {
                logic: 'AND',
                conditions: []
            }
        })
    },
    required: {
        component: required,
        default: () => ({
            enable: false,
            config: {
                logic: 'AND',
                conditions: []
            }
        })
    },
    tableConfig: {
        component: tableConfig,
        default: () => ([
            { key: uuid(), label: window.i18n.t('列') + '1', type: 'input', required: false, dataSource: [] },
            { key: uuid(), label: window.i18n.t('列') + '2', type: 'input', required: false, dataSource: [] }
        ])
    },
    valLinkageRules: {
        component: valLinkageRules,
        default: () => ({
            type: 'currentTable', // currentTable(本表字段)、otherTable(他表字段)、createTicketTime(提交时间)
            tableName: '',
            rules: [
                {
                    intervals: [], // 评分组件配置
                    relations: [{ // 关联的字段信息
                        field: '',
                        type: '', // CONST常量、VAR变量
                        value: ''
                    }],
                    target: { // 满足关联条件的默认值
                        type: '', // CONST常量、VAR变量
                        value: ''
                    }
                }
            ]
        })
    },
    validate: {
        component: validate,
        default: 'EMPTY'
    },
    value: {
        component: value,
        default: (type) => getFieldDefaultVal(type)
    }
}

export default setters
