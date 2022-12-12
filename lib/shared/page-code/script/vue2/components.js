import { camelCase, camelCaseTransformMerge } from 'change-case'

/**
 * @desc 返回components内容
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    // 预览时，用到的组件都已在工程中全局导入，不需要这部分
    if (['preview', 'previewSingle'].includes(code.pageType)) return ''

    // 工程中使用了charts或者nocode类型组件
    let componentStr = ''
    if (code.chartTypeArr && code.chartTypeArr.length) {
        componentStr += 'chart: ECharts,\n'
    }
    if (code.isUseBkCharts) {
        componentStr += 'bkCharts: bkCharts,\n'
    }
    if (['FORM', 'FLOW'].includes(code.nocodeType)) {
        componentStr += 'ProcessForm,\n'
    }
    if (['FORM_MANAGE', 'FLOW_MANAGE'].includes(code.nocodeType)) {
        componentStr += 'DataManage,\n'
    }
    if (code.isUseSwiper) {
        componentStr += 'Swiper,\n SwiperSlide\n'
    }

    // 引入自定义组件
    if (code.usingCustomArr && code.usingCustomArr.length) {
        let customStr = ''
        // dev 和 t 环境，npm 包名字前面加了 test- 前缀，生成的变量名字应该去掉 test 前缀
        let forkUsingCustomArr = code.usingCustomArr
        if (process.env.BKPAAS_ENVIRONMENT !== 'prod') {
            forkUsingCustomArr = code.usingCustomArr.map(item => item.replace(/^test\-/, ''))
        }
        for (const i in code.usingCustomArr) {
            customStr += `${camelCase(forkUsingCustomArr[i], { transform: camelCaseTransformMerge })},\n`
        }
        componentStr += customStr
    }
    if (componentStr) {
        if (componentStr.endsWith(',\n')) {
            componentStr = componentStr.substr(0, componentStr.length - 2)
        }
        componentStr = `components: {
            ${componentStr}
        },`
    }
    return componentStr
}
