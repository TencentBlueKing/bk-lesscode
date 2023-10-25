/**
 * @desc 处理需要特殊标记的组件类型
 * @param { CodeModel } code
 * @param { Object } item 当前组件的配置
 */
export default function handleSpecialTypeFlag (code, item) {
    // 使用了 element 组件库
    if (item.type.startsWith('el-')) {
        code.setProperty('isUseElement', true)
    }
    // 使用了bkcharts
    if (item.type.startsWith('bk-charts')) {
        generateBkChartsData(code, item)
        code.setProperty('isUseBkCharts', true)
    }
    // 记录是否为自定义组件
    if (item.custom && code.usingCustomArr.indexOf(item.type) === -1) {
        const prefix = process.env.BKPAAS_ENVIRONMENT === 'prod' ? '' : 'test-'
        const type = prefix + item.type
        if (code.usingCustomArr.indexOf(type) < 0) {
            code.usingCustomArr.push(type)
        }
    }
}

/**
 * @desc 将bkcharts使用到的变量跟远程函数写入到data跟methods中
 * @param { CodeModel } code
 * @param { Object } item 当前组件的配置
 */
function generateBkChartsData (code, item) {
    if (item.renderProps.options?.payload?.methodCode) {
        code.remoteMethodsTemplate(`${item.componentId}options`, item.renderProps.options.payload || {}, true)
    }
}
