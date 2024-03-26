/**
 * @desc 生成echarts类型组件源码
 * @param { Object } item 当前组件配置
 * @param { Object } payload { styles, vueDirective, propDirective, css, alignStr }
 * @returns { String }
 */
export default function generateChart (code, item, { styles, vueDirective, propDirective, css, alignStr = '' }) {
    generateEChartData(code, item)
    const width = item.renderProps.width && item.renderProps.width.code
    const widthVal = width ? (typeof width === 'number' ? `${width}px` : width) : '100%'
    const widthStr = `width:${widthVal};`
    const height = item.renderProps.height && item.renderProps.height.code
    const heightStr = `height:${height || 200}px;`
    const displayStr = styles.display ? `display: ${styles.display};vertical-align: ${styles.verticalAlign || 'middle'};` : ''

    let componentCode = ''
    if (css) {
        componentCode = `
            <div${alignStr}style="${css}" ${vueDirective}>
                <div style="${widthStr}${heightStr}${displayStr}">
                    <chart component-id="${item.componentId}" :options="${item.componentId}" ${propDirective} autoresize></chart>
                </div>
            </div>`
    } else {
        componentCode = `
            <div${alignStr}style="${widthStr}${heightStr}${displayStr}" ${vueDirective}>
                <chart component-id="${item.componentId}" :options="${item.componentId}" ${propDirective} autoresize></chart>
            </div>`
    }
    return componentCode
}

/**
 * @desc 将echarts图表使用到的变量跟远程函数写入到data跟methods中
 * @param { Object } item 当前组件配置
 */
export function generateEChartData (code, item) {
    code.setProperty('isUseEcharts', true)
    
    code.dataTemplate(item.componentId, JSON.stringify(item.renderProps.options?.code))
    // 兼容配置文件有一段时间写成remote_options的情况
    const oldRemotOptions = item.renderProps['remote-options'] || {}
    const remoteOptions = item.renderProps.remoteOptions || {}
    let optionPayload = remoteOptions?.payload || {}
    if (oldRemotOptions?.payload?.methodCode && !remoteOptions?.payload?.methodCode) {
        optionPayload = oldRemotOptions?.payload || {}
    }
    
    if (optionPayload?.methodCode) {
        code.remoteMethodsTemplate(item.componentId, optionPayload || {}, true)
    }
}
