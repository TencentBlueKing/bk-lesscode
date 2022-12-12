const nocodeTypeComponentMap = {
    'FORM': 'process-form',
    'FORM_MANAGE': 'data-manage',
    'FLOW': 'process-form',
    'FLOW_MANAGE': 'data-manage',
    'MARKDOWN': 'mavon-editor'
}

/**
 * @desc 表单、流程、markdown类型页面，通过nocodeType区分页面类型、payload数据放在nocodePayload
 * @param { CodeModel } code
 * @returns { String }
 */
export default function generataNocodePage (code) {
    if (!code.nocodeType) return
    const { config = {}, fields = [], formIds = {}, serviceId = 0, tableName = '', formId = 0, flowDeployed = true, versionId = 0, content = '' } = code.nocodePayload
    const componentType = nocodeTypeComponentMap[code.nocodeType]
    let propsStr = `type="${code.nocodeType}"`
    const key = code.uniqueKey
    switch (code.nocodeType) {
        case 'MARKDOWN':
            const mdContent = content && content.replace(/"/g, '\'')
            propsStr = `value="${mdContent}" :editable="false" :subfield="false" :toolbars-flag="false" default-open="preview" style="height: 100%;width: 100%;z-index: 5"`
            return `
                <!-- eslint-disable -->
                <!-- prettier-ignore -->
                <${componentType} ${propsStr} ></${componentType}>
                <!-- eslint-enable -->
            `
        case 'FORM':
            code.dataTemplate(`field${key}`, JSON.stringify(fields))
            propsStr += ` view-type="${code.pageType}" :fields="field${key}" table-name="${tableName || ''}" :form-id="${formId || 0}"`
            break
        case 'FLOW':
            code.dataTemplate(`field${key}`, JSON.stringify(fields))
            propsStr += ` view-type="${code.pageType}" :fields="field${key}" table-name="${tableName || ''}" :form-id="${formId || 0}" :service-id="${serviceId || 0}" :version-id="${versionId || 0}" :flow-deployed="${flowDeployed}"`
            break
        case 'FORM_MANAGE':
        case 'FLOW_MANAGE':
            code.dataTemplate(`config${key}`, JSON.stringify(config))
            code.dataTemplate(`formIds${key}`, typeof formIds === 'object' ? JSON.stringify(formIds) : formIds)
            propsStr += ` view-type="${code.pageType}" :config="config${key}" :form-ids="formIds${key}"  :service-id="${serviceId || 0}" :version-id="${versionId || 0}"`
            break
        default:
            break
    }
    return `
        <${componentType} ${propsStr} ></${componentType}>
    `
}
