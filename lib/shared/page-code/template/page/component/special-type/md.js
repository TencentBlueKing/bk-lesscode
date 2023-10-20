/**
 * @desc 生成markdown类型组件源码
 * @param { Object } item 当前组件配置
 * @param { Object } payload { styles, vueDirective, propDirective, css, alignStr }
 * @returns { String }
 */
export default function generateMd (code, item, { itemClass }) {
    const componentType = 'mavon-editor'
    const content = item.renderProps?.value?.renderValue || ''
    const bgColor = item.renderProps?.previewBackground?.renderValue || '#fff'
    const mdContent = content && content.replace(/"/g, '\'')
    const propsStr = `value="${mdContent}" preview-background="${bgColor}" :editable="false" :subfield="false" :toolbars-flag="false" default-open="preview"`
    return `
        <!-- eslint-disable -->
        <!-- prettier-ignore -->
        <${componentType} ${itemClass} ${propsStr} style="z-index: 1;"></${componentType}>
        <!-- eslint-enable -->
    `
}
