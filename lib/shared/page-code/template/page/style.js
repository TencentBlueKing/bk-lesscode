import { paramCase } from 'change-case'
import { unitFilter } from '../../../util'
import { handleRenderStyles } from '../../common/utils'

/**
 * @desc 从renderStyle中解析生成组件的样式，样式写到css中并返回class名称
 * @param { CodeModel } code
 * @param { String } compId 组件id
 * @param { Object } renderStyles 样式配置
 * @param { Object } renderProps props配置
 * @param { Object } payload 放置个别需要特殊处理的情景 { cssNamePrefix = '', componentType = '', inFreeLayout = false }
 * @returns { Object } 返回style跟class两种方式的引用方式
 */
export default function getItemStyles (code, compId, renderStyles, renderProps, { cssNamePrefix = '', componentType = '', inFreeLayout = false }) {
    // 默认compId为class名称
    let className = compId
    // 添加原生标签的用户自定义class
    className += (renderProps && renderProps.hasOwnProperty('class') && ` ${renderProps.class.code}`) || ''

    // 处理合并样式面板的样式设置跟自定义样式
    const styles = handleRenderStyles(renderStyles)
        
    const hasStyle = Object.keys(styles).length > 0

    // 有设置class的话，将样式写至<style>
    if (hasStyle) {
        let tmpStr = ''
        for (const i in styles) {
            // 自由布局的组件由父元素来绝对定位，left 和 top 也由父元素控制，因此组件本身的 top 和 left 设置为 0
            if (inFreeLayout && (i === 'top' || i === 'left')) {
                tmpStr += `${i}: 0px;\n`
            } else if (i === 'height' && componentType === 'h5-page' && code.pageType !== 'previewSingle') {
                // 模板市场预览(previewSingle)时，非iframe实现，不能使用100vh
                tmpStr += `${i}: 100vh;\n`
            } else {
                tmpStr += `${paramCase(i)}: ${unitFilter(styles[i])};\n`
            }
        }

        code.appendCss(compId.startsWith('elIcon') ? `\n.${compId}` : `\n${cssNamePrefix}.${className}`)
        code.appendCss(` {\n${tmpStr}}`)
    }

    // const itemStyles = `${(!hasStyle || className) ? '' : `:style='${JSON.stringify(styles)}'`}`
    const itemStyles = ''

    // swiper组件需要添加ani前缀
    const aniSuffix = (renderProps && renderProps.hasOwnProperty('swiper-animate-effect') && ' ani') || ''
    const itemClass = `class='bk-layout-component-${code.uniqueKey} ${className + aniSuffix}'`
    
    return { itemStyles, itemClass }
}
