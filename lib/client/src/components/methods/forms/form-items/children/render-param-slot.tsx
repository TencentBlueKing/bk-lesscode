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
        <bk-compose-form-item class="render-param-form">
            <bk-select
                class="render-param-type"
                value={row.valueType}
                clearable={false}
                onChange={(valueType) => handleUpdate(row, { valueType, code: '', value: '' })}
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
                        onOn-change={({ code, renderValue }) => handleUpdate(row, { code, value: renderValue })}
                    >
                    </ChooseVariable>
                    : row.type === 'boolean'
                        ? <bk-checkbox
                            class="render-param-val pl5"
                            disabled={disabled}
                            value={row.value}
                            onChange={(val) => handleUpdate(row, { value: val })}
                        ></bk-checkbox>
                        : <bk-input
                            class="render-param-val"
                            v-bk-tooltips={{ content: window.i18n.t('可以使用 ${函数参数} 获取函数参数值'), trigger: 'click', theme: 'light' }}
                            placeholder={window.i18n.t('请输入参数值')}
                            disabled={disabled}
                            value={row.value}
                            onChange={(val) => handleUpdate(row, { value: row.type === API_PARAM_TYPES.NUMBER.VAL && !isNaN(+val) ? +val : val })}
                        >
                        </bk-input>
            }
        </bk-compose-form-item>
    )
}
