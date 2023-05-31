import './render-param-slot.css'
import ChooseVariable from '@/components/variable/variable-select/components/variable.vue'
import {
    API_PARAM_TYPES
} from 'shared/api'
export default (row, handleUpdate) => {
    const disabled = [
        API_PARAM_TYPES.ARRAY.VAL,
        API_PARAM_TYPES.OBJECT.VAL
    ].includes(row.type)
    return (
        disabled
            ? '--'
            : <bk-compose-form-item class="render-param-form">
                <bk-select
                    class="render-param-type"
                    value={row.valueType}
                    clearable={false}
                    disabled={disabled}
                    onChange={(valueType) => handleUpdate(row, { valueType })}
                >
                    <bk-option id="value" name={window.i18n.t('值')}></bk-option>
                    <bk-option id="variable" name={window.i18n.t('变量')}></bk-option>
                </bk-select>
                {
                    row.valueType === 'variable'
                        ? <ChooseVariable
                            class="render-param-val"
                            remoteConfig={{}}
                            options={{ valueTypeInclude: [row.type] }}
                            formData={{ code: row.code }}
                            onOn-change={({ code }) => handleUpdate(row, { code })}
                        >
                        </ChooseVariable>
                        : row.type === 'boolean'
                            ? <bk-checkbox
                                class="render-param-val pl5"
                                value={row.value}
                                disabled={disabled}
                                onChange={(val) => handleUpdate(row, { value: val })}
                            ></bk-checkbox>
                            : <bk-input
                                class="render-param-val"
                                placeholder={window.i18n.t('请输入参数值')}
                                value={row.value}
                                disabled={disabled}
                                onChange={(val) => handleUpdate(row, { value: val })}
                            >
                            </bk-input>
                }
            </bk-compose-form-item>
    )
}
