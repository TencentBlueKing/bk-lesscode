import { getMethodByCode } from '../../common/utils'

/**
 * @desc 返回生命周期内容， 生命周期内容来源于页面设置中的手动绑定及如果页面使用了远程函数、使用了web端导航布局，需要放到created中执行
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    const lifeCycle = code.lifeCycle
    const lifeCycleKeys = Object.keys(lifeCycle) || []
    // 生成使用函数的对象
    const lifeCycleStrObj = {}
    lifeCycleKeys.forEach((key) => {
        const funcPayload = lifeCycle[key]
        const [method, params] = getMethodByCode(funcPayload, code.funcGroups)
        lifeCycleStrObj[key] = []
        if (method.id) {
            if (method.funcCode) code.addUsedFunc(method.funcCode)
            lifeCycleStrObj[key].push(`this.${method.funcName}(${code.getFuncParamStr(method, params, `页面的【${key}】生命周期`, true)})`)
        }
    })
    // 如果使用了远程函数
    if (code.remoteDataStr) {
        if (!lifeCycleStrObj.created) lifeCycleStrObj.created = []
        if (!lifeCycleKeys.includes('created')) lifeCycleKeys.push('created')
        lifeCycleStrObj.created.push('this.initRemoteData()')
    }
    // 如果页面中存在web端导航布局
    if (code.hasLayout && code.platform !== 'MOBILE') {
        if (!lifeCycleStrObj.created) lifeCycleStrObj.created = []
        if (!lifeCycleKeys.includes('created')) lifeCycleKeys.push('created')
        lifeCycleStrObj.created.push('this.setNav()')
    }

    // 内容不为空的生命周期，写入到页面源码中
    let lifeCycleStr = ''
    lifeCycleKeys.forEach((key) => {
        const curFuncStrList = lifeCycleStrObj[key] || []
        if (curFuncStrList.length > 0) lifeCycleStr += `${key} () {${curFuncStrList.join('\r\n')}},`
    })
    return lifeCycleStr
}
