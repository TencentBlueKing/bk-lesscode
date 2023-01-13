import { getMethodByCode } from '../../common/utils'

/**
 * @desc 从renderEvent中解析出绑定的event事件
 * @param { CodeModel } code
 * @param { Object } events 事件配置
 * @returns { String }
 */
export default function getItemEvents (code, events = {}) {
    let eventStr = ''
    // 解析events里面绑定配置的事件
    if (typeof events === 'object' && Object.keys(events).length) {
        for (const key in events) {
            const event = events[key]
            const [fun, params] = getMethodByCode(event, code.funcGroups)
            // event.enable === undefined是为了兼容老数据没有开启关闭函数选项
            if (fun.id && (event.enable === undefined || event.enable)) {
                let curEventStr = `@${key}="${fun.funcName}" `
                if (fun?.funcParams?.length > 0) curEventStr = `@${key}="(...args) => ${fun.funcName}(${code.getFuncParamStr(fun, params, `事件【${key}】`, false, 'event')}, ...args)" `
                eventStr += curEventStr
                code.addUsedFunc(fun.funcCode)
            }
        }
    }
    return eventStr
}
