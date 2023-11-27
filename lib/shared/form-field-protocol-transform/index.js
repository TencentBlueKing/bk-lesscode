import Materials from '../../client/src/form-engine/material/materials.js'

const FIELD_TYPE_MAP = {
    'STRING': 'input',
    'TEXT': 'textarea',
    'INT': 'int',
    'DATE': 'date',
    'DATETIME': 'datetime',
    'LINK': 'link',
    'SELECT': 'select',
    'MULTISELECT': 'multiple-select',
    'CHECKBOX': 'checkbox',
    'RADIO': 'radio',
    'MEMBER': 'member',
    'MEMBERS': 'members',
    'RICHTEXT': 'rich-text',
    'TABLE': 'table',
    'DESC': 'description',
    'DIVIDER': 'divider',
    'RATE': 'rate',
    'COMPUTE': 'computed',
    'SERIAL': 'auto-counting'
}


/**
 * nocode 表单字段转换为lesscode 表单容器字段，属性对照说明
 * 
 * 'columnId', // id
 * // type
 * // 为COMPUTE时，meta.compute_config_info转换为configure.computedConfig
 * // 为COMPUTE时，meta.serial_config_info转换为configure.autoCountingConfig
 * // 为TABLE时，choice转换为 configure.tableConfig
 * 'type', // type
 * 'name', // configure.name
 * 'desc', // configure.placeholder
 * 'regex', // configure.validate
 * 'key', // configure.key
 * 'source_type', // configure.dataSource，'CUSTOM'（自定义，结合choice字段）, 'FUNCTION'（函数，结合meta.function_data_source_config字段）, 'WORKSHEET'（表单，结合meta.function_data_source_config字段）
 * 'validate_type', // configure.required，'REQUIRE'为必填，'OPTION'为非必填，需要结合mandatory_conditions字段
 * 'is_readonly', // configure.readOnly，true为只读，结合read_only_conditions字段
 * 'show_type', // configure.hidden, 0表示隐藏，结合show_conditions字段
 * 'deviderAttr', // configure.dividerConfig
 * 'default', // configure.value 默认值
 * 'meta', // 存在default_val_config时，转换为 configure.valLinkageRules
 * 'tips' // configure.labelTips
 * */

/**
 * 将nocode表单字段协议转换为lesscode表单容器字段协议
 * @param {Array} fields 待转换nocode表单字段
 *
 */
export const transformNocodeFields = (fields) => {
    const list = []

    fields.forEach(field => {
        const { columnId, type: originType } = field
        const type = FIELD_TYPE_MAP[originType]
        // 不支持的字段不转换
        if (!type) {
            return
        }

        const materialConfig = Materials.find(item => item.type === type)
        const { component, props, properties } = materialConfig
        const transedField = {
            type,
            component,
            props,
            id: columnId,
            configure: {}
        }

        properties.forEach(setterKey => {
            let setterVal
            switch(setterKey) {
                case 'autoCountingConfig':
                    setterVal = {
                        config: field.meta.serial_config_info,
                        val: field.default
                    }
                    break
                case 'computedConfig':
                    let type = 'number'
                    let config = {
                        formula: '',
                        customizeFormula: [],
                        computeFields: [],
                        unit: { value: '', position: 'prefix' },
                        decimal: 0
                    }
                    if (field.meta.compute_config_info) {
                        const { type: computedType, numberComput, dateTime } = field.meta.compute_config_info
                        type = computedType === 'numberComput' ? 'number' : 'dateTime'
                        config = computedType === 'numberComput' ? numberComput : dateTime
                    }
                    setterVal = { type, config }
                    break
                case 'dataSource':
                    const sourceType = field.source_type
                    if (sourceType === 'CUSTOM') {
                        setterVal = {
                            type: 'CUSTOM',
                            config: {},
                            data: field.choice.map(item => {
                                const { key, color, name } = item
                                return { color, id: key, label: name }
                            })
                        }
                    } else if (sourceType === 'FUNCTION') {
                        setterVal = {
                            type: 'FUNCTION',
                            config: field.meta.function_data_source_config,
                            data: []
                        }
                    } else if (sourceType === 'WORKSHEET') {
                        const { conditions, field: fieldKey, tableName } = field.meta.data_config
                        setterVal = {
                            type: 'WORKSHEET',
                            config: {
                                tableName,
                                fieldKey,
                                logic: conditions.connector,
                                conditions: conditions.expressions
                            },
                            data: []
                        }
                    }
                    break
                case 'dividerConfig':
                    setterVal = {
                        text: field.default,
                        align: field.deviderAttr.align,
                        lineColor: field.deviderAttr.color
                    }
                    break
                case 'hidden':
                    setterVal = {
                        enable: field.show_type === 0,
                        config: {
                            logic: field.show_conditions?.type === 'or' ? 'OR' : 'AND',
                            conditions: field.show_conditions?.expressions || []
                        }
                    }
                    break
                case 'key':
                    setterVal = field.key
                    break
                case 'labelTips':
                    setterVal = field.tips || ''
                    break
                case 'name': 
                    setterVal = field.name
                    break
                case 'placeholder':
                    setterVal = field.desc || ''
                    break
                case 'readonly':
                    setterVal = {
                        enable: field.is_readonly,
                        config: {
                            logic: field.read_only_conditions?.type === 'or' ? 'OR' : 'AND',
                            conditions: field.read_only_conditions?.expressions || []
                        }
                    }
                    break
                case 'required':
                    setterVal = {
                        enable: field.validate_type === 'REQUIRE',
                        config: {
                            logic: field.mandatory_conditions?.type === 'or' ? 'OR' : 'AND',
                            conditions: field.mandatory_conditions?.expressions || []
                        }
                    }
                    break
                case 'tableConfig':
                    const colsConfig = []
                    field.choice.forEach(item => {
                        const { options = [], display, key, name, required } = item
                        colsConfig.push({
                            key,
                            required,
                            label: name,
                            type: display,
                            dataSource: options.map(op => {
                                return { id: op.id, label: op.name }
                            })
                        })
                    })
                    setterVal = colsConfig
                    break
                case 'valLinkageRules':
                    setterVal = field.meta.default_val_config || {
                        type: 'currentTable',
                        tableName: '',
                        rules: [{
                            intervals: [],
                            relations: [{ field: '', type: '', value: '' }],
                            target: { type: '', value: '' }
                        }]
                    }
                    break
                case 'validate':
                    setterVal = field.regex || ''
                    break
                case 'value':
                    setterVal = field.default
                    break
            }
            transedField.configure[setterKey] = setterVal
        })

        list.push(transedField)
    })

    return list
}
