import { getMethodByCode } from '../../common/utils'
import { sharedI18n } from '../../../util'

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

    const createLifeCycleFunc = (lifeCycle, code, method) => {
        if (!lifeCycleStrObj[lifeCycle]) lifeCycleStrObj[lifeCycle] = []
        if (!lifeCycleKeys.includes(lifeCycle)) lifeCycleKeys.push(lifeCycle)
        lifeCycleStrObj[lifeCycle][method](code)
    }

    lifeCycleKeys.forEach((key) => {
        const funcPayload = lifeCycle[key]
        const [method, params] = getMethodByCode(funcPayload, code.funcGroups)
        lifeCycleStrObj[key] = []
        if (method.id) {
            if (method.funcCode) code.addUsedFunc(method.funcCode)
            lifeCycleStrObj[key].push(`this.${method.funcName}(${code.getFuncParamStr(method, params, `${sharedI18n().t('页面的')}【${key}】${sharedI18n().t('生命周期')}`, true)})`)
        }
    })
    // 如果使用了远程函数
    if (code.remoteDataStr) {
        createLifeCycleFunc('created', 'await this.initRemoteData()', 'unshift')
    }
    // 如果页面中存在web端导航布局
    if (code.hasLayout && code.platform !== 'MOBILE') {
        createLifeCycleFunc('created', 'this.setNav()', 'push')
    }

    // 如果使用h5容器, 必须调用register方法 注册swiper-container
    if (code.isUseSwiper && code.platform === 'MOBILE') {
        const createdMethod = '(window.swiperRegister = window.swiperRegister || register)()'
        const mountedMethod = `const swiperAnimation = new SwiperAnimation()
        const swiperParams = {
            on: {
                init() {
                    swiperAnimation.init(this).animate()
                },
                slideChange() {
                    swiperAnimation.init(this).animate()
                }
            }
        }
        
        Object.assign(this.$refs['h5-container'], swiperParams)

        ${code.h5ContainerInitOption ? 'this.$refs[\'h5-container\'].initialize()' : ''}
        `
        createLifeCycleFunc('created', createdMethod, 'unshift')
        createLifeCycleFunc('mounted', mountedMethod, 'unshift')
    }

    // 内容不为空的生命周期，写入到页面源码中
    let lifeCycleStr = ''
    lifeCycleKeys.forEach((key) => {
        // 如果是created并且设置了远程函数，则添加async
        const keyStr = (key === 'created' && code.remoteDataStr) ? 'async created' : key

        const curFuncStrList = lifeCycleStrObj[key] || []
        if (curFuncStrList.length > 0) lifeCycleStr += `${keyStr} () {${curFuncStrList.join('\r\n')}},`
    })
    return lifeCycleStr
}
