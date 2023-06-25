import { sharedI18n } from '../../../util'
/**
 * @desc 从renderDivectives属性中解析中设置在组件或布局中的指令
 * @param { CodeModel } code
 * @param { Object } renderDirectives 指令配置
 * @param { Object } componentId 组件id
 * @returns { String }
 */
export default function (code, renderDirectives, componentId) {
    // 过滤出有效的指令
    const exisDirectives = (renderDirectives || []).filter((directive) => (directive.code !== '' && directive.val !== ''))
    // 指令种类划分
    const vueDirectives = []
    const templateDirectives = []
    const propDirectives = []
    const id = componentId.replace(/\-(.)/g, x => (x.slice(1)).toUpperCase())

    exisDirectives.forEach((directive) => {
        const { type, modifiers = [], prop = '', format, code: val, dataSourceType } = directive
        const modifierStr = (modifiers || []).map((modifier) => `.${modifier}`).join('')
        const dataSourceId = (componentId + type).replace(/\-(.)/g, x => (x.slice(1)).toUpperCase())
        const disPlayVal = code.handleUsedVariable(format, val, `${sharedI18n().t('组件')}【${componentId}【${type}】${sharedI18n().t('指令')}`, dataSourceId, dataSourceType)

        // 兼容旧数据，v-model为undefined的情形(v-model不能为undefined)
        if (type === 'v-model' && val === undefined) return
        switch (type) {
            case 'v-if':
                const exitsVFor = exisDirectives.find((dir) => (dir.type === 'v-for'))
                const expression = `v-if="${disPlayVal}"`
                if (exitsVFor) templateDirectives.push(expression)
                else vueDirectives.push(expression)
                break
            case 'v-for':
                vueDirectives.push(`v-for="(${id}Item, ${id}Index) in ${disPlayVal}" :key="${id}Index"`)
                break
            case 'v-model':
            case 'v-show':
            case 'v-html':
                propDirectives.push(`${type}="${disPlayVal}"`)
                break
            case 'v-bkloading':
                vueDirectives.push(`${type}="{ isLoading: ${disPlayVal} }"`)
                break
            case 'v-bk-tooltips':
                vueDirectives.push(`${type}="{ content: ${disPlayVal} }"`)
                break
            case 'v-bind':
                propDirectives.push(`:${prop}${modifierStr}="${disPlayVal}"`)
                break

            default:
                propDirectives.push(`${type}${prop ? `:${prop}` : ''}${modifierStr}="${disPlayVal}"`)
                break
        }
    })
    return { vueDirectives, propDirectives, templateDirectives }
}
