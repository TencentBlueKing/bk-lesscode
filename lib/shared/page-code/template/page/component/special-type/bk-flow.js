/**
 * @desc 生成bk-flow组件源码
 * @param { CodeModel } code
 * @param { Object } props props配置
 * @param { Object } payload { css, alignStr }
 * @returns { String }
 */
export default function generateFlow (code, item, { css, alignStr = ' ' }) {
    generateBkFlow(code, item)
    const widthStr = item.renderProps.width && item.renderProps.width.code ? `width: ${item.renderProps.width.code}px;` : ''
    let componentCode = ''
    if (css) {
        componentCode = `
            <div${alignStr}style="${css}">
                <div style="${widthStr}">
                <div class="bkflow-wrap bkflow-id-${item.componentId}" data-bkflow-id="${item.componentId}">
                    <div class="bkflow-instance"></div>
                </div>
            </div>
            </div>
        `
    } else {
        componentCode = `
            <div${alignStr}style="${widthStr}">
                <div class="bkflow-wrap bkflow-id-${item.componentId}" data-bkflow-id="${item.componentId}">
                    <div class="bkflow-instance"></div>
                </div>
            </div>
        `
    }
    return componentCode
}

/**
 * @desc 生成bk-flow所需的函数和变量
 * @param { CodeModel } code
 * @param { Object } item 当前组件配置
 */
function generateBkFlow (code, item) {
    code.dataTemplate(item.componentId, JSON.stringify(item.renderProps.options.code))
    code.dataTemplate(`${item.componentId}-height`, item.renderProps.height.code)
    code.dataTemplate(`${item.componentId}-readonly`, item.renderProps.readonly ? item.renderProps.readonly.code : true)
    if (item.renderProps.remoteOptions && item.renderProps.remoteOptions.payload && item.renderProps.remoteOptions.payload.methodCode) {
        code.remoteMethodsTemplate(item.componentId, item.renderProps.remoteOptions.payload || {}, true)
    }
    code.bkFlowArr.push(item.componentId)
}
