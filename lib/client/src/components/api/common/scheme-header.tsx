import './scheme.css'

export default ({ props }) => {
    return (
        <section class="object-layout layout-header">
            <span class="layout-icon"></span>
            <span class="layout-flex">参数名</span>
            { props.hideRequired ? '' : <span class="layout-small">是否必填</span> }
            <span class="layout-middle">类型</span>
            <span class="layout-item">{props.slotLabel || '值'}</span>
            <span class="layout-middle">备注</span>
            <span class="layout-icons">操作</span>
        </section>
    )
}
