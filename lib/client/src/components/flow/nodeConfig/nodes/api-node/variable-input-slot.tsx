import './variable-input-slot.css'

export default (row, handleUpdate) => {
    return (
        <section class="render-param-form">
            <bk-checkbox
                class="hook-checkbox"
                disabled={row.disabled}
                value={row.hooked}
                onChange={(val) => handleUpdate(row, 'hooked', val)}>
            </bk-checkbox>
            <bk-input
                class="variable-input"
                placeholder={window.i18n.t('请输入变量名称')}
                disabled={row.disabled || !row.hooked}
                value={row.code}
                onBlur={(val) => handleUpdate(row, 'code', val)}>
            </bk-input>
        </section>
    )
}
