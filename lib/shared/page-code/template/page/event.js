import { getMethodByCode } from '../../common/utils'
import { sharedI18n, toPascal, capitalizeFirstChar } from '../../../util'

/**
 * @desc 从renderEvent中解析出绑定的event事件
 * @param { CodeModel } code
 * @param { Object } events 事件配置
 * @param { Object } id 组件id
 * @returns { String }
 */
export default function getItemEvents (code, events = {}, id) {
    let eventStr = ''
    // 解析events里面绑定配置的事件
    if (typeof events === 'object' && Object.keys(events).length) {
        for (const key in events) {
            const event = events[key]
            // event.enable === undefined是为了兼容老数据没有开启关闭函数选项
            if (event.enable === undefined || event.enable) {
                let curEventStr
                if (event.type === 'action') {
                    curEventStr = `@${key}="handle${capitalizeFirstChar(toPascal(id))}${capitalizeFirstChar(toPascal(key))}" `
                    const messagePerfix = sharedI18n().t('页面') + `【${code.pageId}】` + sharedI18n().t('组件') + `【${id}】` + sharedI18n().t('事件') + `【${key}】`
                    code.eventActionTemplate(id, key, event.actions, messagePerfix)
                } else if (event.type === 'method' || !event.type) {
                    // 兼容老数据没有type属性
                    const [fun, params] = getMethodByCode(event, code.funcGroups)
                    if (fun?.id) {
                        // 校验funcname合法性
                        const funcNameReg = /^[A-Za-z_][A-Za-z0-9]*[A-Za-z_]?$/
                        if (funcNameReg?.test(fun.funcName)) {
                            curEventStr = `@${key}="${fun.funcName}" `
                            if (fun?.funcParams?.length > 0) {
                                curEventStr = `@${key}="(...args) => ${fun.funcName}(${code.getFuncParamStr(fun, params, sharedI18n().t('事件') + `【${key}】`, false, 'event')}, ...args)" `
                            }
                            code.addUsedFunc(fun.funcCode)
                        }
                    }
                } else if (event.type === 'flow') {
                    // 操作流程事件
                    const eventHandlerName = `handle${capitalizeFirstChar(toPascal(id))}${capitalizeFirstChar(toPascal(key))}`
                    curEventStr = `@${key}="${eventHandlerName}" `
                    if (event.flow.id) {
                        code.addFlowActionTemplate(eventHandlerName, event.flow)
                    }
                }
                if (curEventStr) {
                    eventStr += curEventStr
                }
            }
        }
    }
    return eventStr
}
