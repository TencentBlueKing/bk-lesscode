import getImportContent from './import'
import getComponents from './components'
import getMixins from './mixins'
import getData from './data'
import getComputed from './computed'
import getWatch from './watch'
import getLifeCycle from './lifeCycle'
import getMethods from './methods'

import handleUsedVarAndFunc from './handle-var-and-func'

/**
 * @desc 返回vue2的script， 根据vue2源码的结构组成，返回script
 * @param { CodeModel } code
 * @returns { string } 源码中的script内容
 */
export default function (code) {
    // 处理页面用到的函数跟变量
    handleUsedVarAndFunc(code)

    const importContent = getImportContent(code)
    const componentsStr = getComponents(code)
    const mixinsStr = getMixins(code)
    const dataStr = getData(code)
    const computedStr = getComputed(code)
    const watchStr = getWatch(code)
    const lifeCycleStr = getLifeCycle(code)
    const methodsStr = getMethods(code)

    let scriptContent = `
        ${componentsStr}
        ${mixinsStr}
        ${dataStr}
        ${computedStr}
        ${watchStr}
        ${lifeCycleStr}
        ${methodsStr}`

    if (scriptContent.endsWith(',')) {
        scriptContent = scriptContent.substr(0, scriptContent.length - 1)
    }
    return `<script>
            ${importContent}
            export default {
                ${scriptContent}
            }
            <\/script>\n`
}
