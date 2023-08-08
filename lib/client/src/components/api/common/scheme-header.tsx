import './scheme.css'

export default ({ props }) => {
    return (
        <section class="object-layout layout-header">
            <span class="layout-icon"></span>
            <span class="layout-flex">{window.i18n.t('table_参数名')}</span>
            <span class="layout-middle">{window.i18n.t('类型')}</span>
            <span class="layout-item">{props.slotLabel || window.i18n.t('值')}</span>
            { props.showRule === false ? '' : <span class="layout-middle">{window.i18n.t('自定义校验')}</span> }
            <span class="layout-middle">{window.i18n.t('备注')}</span>
            <span class="layout-icons">{window.i18n.t('操作')}</span>
        </section>
    )
}
