/**
 * @desc 特殊处理table宽度问题
 * @param { Object } item 当前组件配置
 * @returns { String }
 */
export function handleTableWidth (item) {
    // 自由布局中的表格，如果不设置宽度，那么宽度会一直增大，表格组件本身的缺陷
    let width = 0
    const colConf = (item.renderSlots.default && item.renderSlots.default.code) || []
    colConf.forEach(col => {
        if (col.width === null || col.width === undefined || col.width === '') {
            width = parseFloat(width) + 80
        } else {
            // remote 中，如果返回的 col 配置中的 width 是非数字字符串的话，那么就会是 NaN
            width = parseFloat(width) + (isNaN(col.width) ? 80 : parseFloat(col.width))
        }
    })
    return ` width: ${width}px;`
}
