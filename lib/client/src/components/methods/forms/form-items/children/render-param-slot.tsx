export default (row, handleUpdate, variableList) => {
    return (
        <bk-compose-form-item>
            <bk-select
                style="width: 72px"
                value={row.valueType}
                clearable={false}
            >
                <bk-option id="value" name="值"></bk-option>
                <bk-option id="variable" name="变量"></bk-option>
            </bk-select>
            {
                row.valueType === 'variable'
                    ? <bk-select
                        style="width: calc(100% - 72px)"
                        placeholder="请选择变量"
                        value={row.code}
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
                            style="width: calc(100% - 72px)"
                            value={row.value}
                            onChange={(val) => handleUpdate(row, { value: val })}
                        ></bk-checkbox>
                        : <bk-input
                            style="width: calc(100% - 72px)"
                            placeholder="请输入参数值"
                            value={row.value}
                            onChange={(val) => handleUpdate(row, { value: val })}
                        >
                        </bk-input>
            }
        </bk-compose-form-item>
    )
}
