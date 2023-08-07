import './render-param-slot.css'
import {
    API_PARAM_TYPES
} from 'shared/api'

export default (row, handleUpdate, variableList) => {
    const disabled = [
        API_PARAM_TYPES.ARRAY.VAL,
        API_PARAM_TYPES.OBJECT.VAL
    ].includes(row.type)
    return (
      disabled
        ? '--'
        : 
        <bk-compose-form-item class="render-param-form">
            <bk-select
                class="render-param-type"
                value={row.valueType}
                clearable={false}
                disabled={disabled}
                onChange={(valueType) => handleUpdate(row, { valueType })}
            >
                <bk-option id="value" name="值"></bk-option>
                <bk-option id="variable" name="变量"></bk-option>
            </bk-select>
            {
                row.valueType === 'variable'
                    ? <bk-select
                        class="render-param-val"
                        placeholder="请选择变量"
                        value={row.code}
                        disabled={disabled}
                        onChange={(code) => handleUpdate(row, { code })}
                    >
                        {
                            variableList.map((variable) => (
                                <bk-option
                                    id={variable.variableCode}
                                    name={variable.variableName}
                                ></bk-option>
                            ))
                        }
                    </bk-select>
                    : row.type === 'boolean'
                        ? <bk-checkbox
                            class="render-param-val"
                            value={row.value}
                            disabled={disabled}
                            onChange={(val) => handleUpdate(row, { value: val })}
                        ></bk-checkbox>
                        : <bk-input
                            class="render-param-val"
                            placeholder="请输入参数值"
                            value={row.value}
                            disabled={disabled}
                            onChange={(val) => handleUpdate(row, { value: val })}
                        >
                        </bk-input>
            }
        </bk-compose-form-item>
    )
}