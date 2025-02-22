import { uuid } from '../util'
import generateTemplate from './template'
import generateScript from './script'
import generateStyle from './style'
import {
    setProperty,
    appendCss,
    dataTemplate,
    remoteMethodsTemplate,
    dataSourceTemplate,
    getFuncParamStr,
    handleUsedVariable,
    addUsedFunc,
    addUsedVariable,
    eventActionTemplate,
    addFlowActionTemplate
} from './common/modelMethods'

class NewPageCode {
    cssStr = '' // css样式str
    dataObj = {} // 暂存使用到的data变量map
    remoteDataStr = '' // 远程函数使用列表str
    eventActionList = [] // 事件描述
    flowActionList = [] // 操作函数列表
    isUseElement = false // 是都使用element组件库
    isUseSwiper = false // 是否使用H5-container容器，使用Swiper组件
    isUseBkCharts = false // 是否使用bkcharts标志位
    isUseEcharts = false // 是否使用echarts标志位
    usingCustomArr = [] // 使用的自定义组件列表
    usingFuncCodes = [] // 使用到的函数code
    unhandledFunc = [] // 暂存未处理的函数列表
    usingVariables = [] // 使用到的变量列表
    unhandledVariables = [] // 暂存未处理的变量列表
    projectVariables = [] // 放到store文件的应用级变量列表
    pageDataVariables = [] // 放到data中的非computed类型变量
    pageComputedVariables = [] // computed类型变量
    methodStrList = [] // 使用到的函数字符串列表
    codeErrMessage = '' // 记录生成源码中里的错误信息
    h5ContainerInitOption = true // h5容器初始化选项
    framework = 'vue2'
    isStaticCommonStyle = false // 是否接入公共样式
    
    // 支持设置权限的组件 type 集合
    appPermComponents = {
        'bk-button': 'auth-button'
    }
    
    constructor ({
        platform = 'PC',
        targetData = [],
        pageType = 'vueCode',
        funcGroups = [],
        lifeCycle = {},
        styleSetting = {},
        projectId = '',
        pageId = '',
        layoutContent = {},
        isGenerateNav = false,
        isEmpty = false,
        layoutType = '',
        nocodeType = '',
        nocodePayload = {},
        deletePageCodes = [],
        variableList = [],
        user = {},
        npmConf = {},
        apiList = [],
        isRenderAppPermComponents = true,
        framework = 'vue2'
    }) {
        // vueCode: 查看页面源码 projectCode：项目源码 preview：预览项目 previewSingle：预览单页面/导航
        this.pageType = pageType
        this.framework = framework
        // PC、MOBILE
        this.platform = platform || 'PC'
        // nocode页面类型及payload
        this.nocodeType = nocodeType || ''
        this.nocodePayload = nocodePayload || {}

        // 页面内容及配置、包括页面内容targetData、样式设置、生命周期函数
        this.targetData = targetData || []
        this.styleSetting = styleSetting || {}
        this.lifeCycle = typeof lifeCycle === 'string' ? JSON.parse(lifeCycle) : lifeCycle
        this.exisLifyCycle = Object.values(this.lifeCycle).filter(x => x) || []

        // 页面导航布局信息
        this.isEmpty = isEmpty
        this.isGenerateNav = isGenerateNav
        this.layoutType = layoutType
        this.layoutContent = layoutContent || {}
        this.hasLayout = layoutContent && ((layoutContent.menuList && layoutContent.menuList.length) || (layoutContent.topMenuList && layoutContent.topMenuList.length) || (layoutContent.helpMenuList && layoutContent.helpMenuList.length))

        // uniqueKey、用作页面唯一标识
        this.projectId = projectId
        this.pageId = pageId
        // this.uniqueKey = `${projectId}-${pageId}`
        this.uniqueKey = uuid()

        // 是否渲染绑定权限操作的组件，默认为渲染，当预览时，不渲染
        this.isRenderAppPermComponents = isRenderAppPermComponents
        
        // 已删除的页面pagecode
        this.deletePageCodes = deletePageCodes || []

        // 应用函数及变量
        this.variableList = variableList || []
        this.funcGroups = funcGroups || []
        this.apiList = apiList || []

        // 配置信息
        this.user = user || {}
        this.npmConf = npmConf || {}
    }

    /**
     * @desc 生成页面源码，源码由 template、script、style三部分组成
     * @param { Object } params
     * @returns { String } 整个页面源码
     */
    getCode () {
        return generateTemplate(this) + generateScript(this) + generateStyle(this)
    }

    /**
     * @desc 修改内部属性的值
     * @param { String } key
     * @param { Any } value
     */
    setProperty (key, value) {
        setProperty(this, key, value)
    }

    /**
     * @desc 追加样式，将页面每个元素的样式追加到css中
     * @param { String } cssStr 需要拼接的css样式
     */
    appendCss (cssStr) {
        appendCss(this, cssStr)
    }

    /**
     * @desc 添加变量到data中
     * @param { String } key 需要添加的变量key
     * @param { String } value 需要添加的变量value
     */
    dataTemplate (key, value) {
        dataTemplate(this, key, value)
    }

    /**
     * @desc 生成远程函数
     * @param { String } key 远程函数key
     * @param { Object } payload 放置远程函数相关的信息
     * @param { Boolean } isChartType 是否是图表组件相关函数
     */
    remoteMethodsTemplate (key, payload, isChartType = false) {
        remoteMethodsTemplate(this, key, payload, isChartType)
    }

    /**
     * @desc 生成数据源函数
     * @param { String } key 数据源函数key
     * @param { Object } payload 放置远程函数相关的信息
     */
    dataSourceTemplate (key, sourceData) {
        dataSourceTemplate(this, key, sourceData)
    }

    /**
     * @desc 生成事件描述
     * @param {*} componentId 组件id
     * @param {*} eventName 事件名
     * @param {*} actions 事件描述
     * @param { String } errMessagePerfix 错误提示
     */
    eventActionTemplate (componentId, eventName, actions, errMessagePerfix) {
        eventActionTemplate(this, componentId, eventName, actions, errMessagePerfix)
    }

    /**
     * @desc 添加操作函数事件到flowActionList中
     * @param { String } eventHandlerName 模板中生成事件名
     * @param { Object } config 事件配置
     */
    addFlowActionTemplate (eventHandlerName, config) {
        addFlowActionTemplate(this, eventHandlerName, config)
    }

    /**
     * @desc 获取解析后的函数参数
     * @param { Object } params 参数列表
     * @param { String } errMessagePerfix 错误提示
     * @param { Boolean } withThis 是否包含this
     * @returns { String } 解析后的参数字符串
     */
    getFuncParamStr (method, params, errMessagePerfix, withThis, defaultFormat) {
        return getFuncParamStr(this, method, params, errMessagePerfix, withThis, defaultFormat)
    }

    /**
     * @desc 处理页面用到的变量
     * @param { String } 处理页面用到的变量
     */
    handleUsedVariable (valType, val, errMessagePerfix, dataSourceId, dataSourceType, thirdPartDBName) {
        return handleUsedVariable(this, valType, val, errMessagePerfix, dataSourceId, dataSourceType, thirdPartDBName)
    }

    /**
     * @desc 记录页面用到的函数
     * @param { String } 函数code
     */
    addUsedFunc (funcCode) {
        addUsedFunc(this, funcCode)
    }

    /**
     * @desc 记录页面用到的变量
     * @param { String } 变量code
     */
    addUsedVariable (variable) {
        addUsedVariable(this, variable)
    }
}

/**
 * @desc 暴露给外部调用的入口函数，接收参数、返回源码、函数列表跟错误提示信息
 * @param { Object } params
 * @returns { Object } code: 源码、methodStrList：函数列表、codeErrMessage： 错误提示信息
 */
export default function (params) {
    const pageCode = new NewPageCode(params)
    try {
        return {
            code: pageCode.getCode(),
            methodStrList: pageCode.methodStrList || [],
            codeErrMessage: pageCode.codeErrMessage || ''
        }
    } catch (err) {
        return {
            code: '',
            methodStrList: pageCode.methodStrList || [],
            codeErrMessage: pageCode.codeErrMessage || err.message
        }
    }
}
