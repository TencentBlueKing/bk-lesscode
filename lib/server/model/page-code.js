/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import { paramCase, camelCase, camelCaseTransformMerge } from 'change-case'

import { uuid, unitFilter } from '../../shared/util.js'
import { replaceFuncKeyword, replaceFuncParam, getRemoteFunctionInfo } from '../../shared/function/helper'
import slotRenderConfig from '../../client/src/element-materials/modifier/component/slots/render-config'
import safeStringify from '../../client/src/common/json-safe-stringify'
import { VARIABLE_TYPE, VARIABLE_EFFECTIVE_RANGE } from '../../shared/variable/constant'

function transformToString (val) {
    const type = typeof val
    let res
    switch (type) {
        case 'object':
            res = safeStringify(val)
            break
        case 'string':
            res = `'${val}'`
            break
        default:
            res = val
            break
    }
    return res
}

const nocodeTypeComponentMap = {
    'FORM': 'process-form',
    'FORM_MANAGE': 'data-manage',
    'FLOW': 'process-form',
    'FLOW_MANAGE': 'data-manage',
    'MARKDOWN': 'mavon-editor'
}

class PageCode {
    targetData = []
    /**
     * 1. vueCode: 单页面代码
     * 2. preview: 预览代码
     * 3. projectCode: 生成整个项目代码
     */
    pageType = ''
    platform = '' // ['PC', 'MOBILE']
    funcGroups = []
    nocodeType = ''
    nocodePayload = {}
    code = ''
    scriptStr = ''
    cssStr = ''
    dataStr = ''
    remoteDataStr = ''
    lifeCircleStr = ''
    chartTypeArr = [] // echarts 相关，要引入echarts依赖
    useBkCharts = false // 是否使用bkcharts标志位
    usingCustomArr = []
    usingFuncCodes = [] // 使用到的函数code
    unhandledFunc = [] // 未处理的函数列表
    usingVariables = [] // 使用到的变量列表
    unhandledVariables = [] // 未处理的变量列表
    projectVariables = []
    pageDataVariables = []
    pageComputedVariables = []
    methodStrList = [] // 使用到的函数字符串列表
    codeErrMessage = '' // 记录函数里的错误信息
    selfClosingTags = ['img', 'input', 'link', 'hr', 'br']
    lifeCycle = {} // 页面的生命周期
    styleSetting = {} // 页面样式设置
    projectId = ''
    pageId = ''
    deletePageCodes = []
    layoutContent = ''
    hasLayOut = false
    isGenerateNav = false
    layoutType = ''
    isUseElementComponentLib = false
    isUseSwiper = false // 是否使用H5-container容器，使用Swiper组件

    // 是否渲染绑定权限操作的组件，默认为渲染，当预览时，不渲染
    isRenderAppPermComponents = true

    // 支持设置权限的组件 type 集合
    appPermComponents = {
        'bk-button': 'auth-button'
    }

    apiList = [] // api 列表

    constructor (
        {
            targetData = [],
            pageType = 'vueCode',
            platform = 'PC',
            nocodeType = '',
            nocodePayload = {},
            funcGroups = [],
            lifeCycle = '',
            projectId,
            pageId,
            deletePageCodes = [],
            layoutContent,
            isGenerateNav = false,
            isEmpty = false,
            layoutType,
            variableList,
            styleSetting = '',
            user = {},
            npmConf = {},
            origin = '',
            // 是否渲染绑定权限操作的组件，默认为渲染，当预览时，不渲染
            isRenderAppPermComponents = true,
            apiList = []
        }
    ) {
        this.targetData = targetData || []
        this.pageType = pageType
        this.platform = platform
        this.nocodeType = nocodeType
        this.nocodePayload = nocodePayload
        this.funcGroups = funcGroups || []
        this.uniqueKey = uuid()
        this.lifeCycle = lifeCycle || {}
        this.projectId = projectId
        this.pageId = pageId
        this.deletePageCodes = deletePageCodes || []
        this.layoutContent = layoutContent || {}
        this.hasLayOut = layoutContent && ((layoutContent.menuList && layoutContent.menuList.length) || (layoutContent.topMenuList && layoutContent.topMenuList.length))
        this.isGenerateNav = isGenerateNav
        this.isEmpty = isEmpty
        this.layoutType = layoutType
        this.variableList = variableList || []
        this.styleSetting = styleSetting || {}
        this.user = user
        this.npmConf = npmConf
        this.origin = origin
        this.isPCLayout = this.hasLayOut && this.platform !== 'MOBILE'
        this.isRenderAppPermComponents = isRenderAppPermComponents
        this.apiList = apiList
    }

    getCode () {
        return this.generateTemplate() + this.generateScript() + this.generateCss()
    }

    // 解析完json以后，处理使用到的函数和变量，方便后续生成源码使用
    handleUsedVarAndFunc () {
        while (this.unhandledFunc.length > 0 || this.unhandledVariables.length > 0) {
            // 处理函数
            for (let index = 0, l = this.unhandledFunc.length; index < l; index++) {
                const funcCode = this.unhandledFunc.shift()
                const func = this.getComplateFuncByCode(funcCode) || {}
                if (func.code) {
                    this.methodStrList.push({
                        id: func.id,
                        funcStr: func.code
                    })
                }
            }

            // 处理变量
            for (let index = 0, l = this.unhandledVariables.length; index < l; index++) {
                const variable = this.unhandledVariables.shift()

                // 项目级别变量，添加到store中
                if (
                    !['vueCode', 'previewSingle'].includes(this.pageType)
                      && variable.effectiveRange === VARIABLE_EFFECTIVE_RANGE.PROJECT
                ) {
                    this.projectVariables.push(variable)
                }

                // 页面级别变量
                if (
                    ['vueCode', 'previewSingle'].includes(this.pageType)
                      || variable.effectiveRange === VARIABLE_EFFECTIVE_RANGE.PAGE
                ) {
                    // 处理非计算变量
                    if (variable.valueType !== VARIABLE_TYPE.COMPUTED.VAL) {
                        const { defaultValue = {}, variableCode, defaultValueType } = variable
                        if ([VARIABLE_TYPE.ARRAY.VAL, VARIABLE_TYPE.OBJECT.VAL].includes(variable.valueType)) {
                            ['all', 'prod', 'stag'].forEach((key) => {
                                const val = defaultValue[key]
                                if (typeof val === 'string' && val) {
                                    defaultValue[key] = JSON.parse(val)
                                }
                            })
                        }
                        this.dataTemplate(variableCode, `getInitVariableValue(${JSON.stringify(defaultValue)}, ${defaultValueType})`)
                        this.pageDataVariables.push(variable)
                    }

                    // 处理计算变量
                    if (variable.valueType === VARIABLE_TYPE.COMPUTED.VAL) {
                        variable.defaultValue.all = this.processFuncBody(variable.defaultValue.all)
                        this.pageComputedVariables.push(variable)
                    }
                }
            }
        }
    }

    addUsedFunc (funcCode) {
        if (this.usingFuncCodes.includes(funcCode)) return

        this.unhandledFunc.push(funcCode)
        this.usingFuncCodes.push(funcCode)
    }

    addUsedVariable (variable) {
        if (this.usingVariables.find(x => x.variableCode === variable.variableCode)) return

        this.unhandledVariables.push(variable)
        this.usingVariables.push(variable)
    }

    getValueType (val) {
        const Fn = Function
        let type = 'undefined'
        // 用户输入的不符合规范的json，按照字符串处理
        try {
            type = new Fn(`return typeof ${val}`)()
        } catch (error) {
        }
        return type
    }

    getValue (val) {
        let value = val
        const type = this.getValueType(val)
        switch (type) {
            case 'undefined':
                value = `'${val}'`
                if (val === 'undefined') value = 'undefined'
                break
        }
        if (/[^\.\=><]+[\.\=><\']+[^\.\=><\']+/.test(val)) value = val
        return value
    }

    getMethodByCode (methodCode) {
        let params = []

        if (typeof methodCode === 'object') {
            params = methodCode.params || []
            methodCode = methodCode.methodCode
        }
        const res = this.funcGroups.map(group => group.children).flat().find(func => func.funcCode === methodCode)
        return [res || {}, params]
    }

    generateComponment (item, vueDirective, propDirective, inFreeLayout = false) {
        item = Object.assign({}, item, { componentType: item.type, componentId: camelCase(item.componentId, { transform: camelCaseTransformMerge }) })
        let css = ''

        const styles = this.handleRenderStyles(item.renderStyles)
        const alignStr = this.getAlignStr(item.renderAlign || {}, inFreeLayout)

        if (item.type === 'render-block') {
            item.type = 'div'
            if (!styles['position']) {
                styles.position = 'relative'
            }
        }
        if (inFreeLayout) {
            css += 'position: absolute;'
            delete styles.position

            // 自由布局部分属性需要设置在外层div
            const containerStyles = ['top', 'left', 'margin-left', 'margin-bottom', 'margin-right', 'margin-top', 'margin', 'z-index']
            containerStyles.forEach(style => {
                if (styles[style]) {
                    css += ` ${style}: ${styles[style]};`
                    delete styles[style]
                }
            })
            if (styles.height && styles.height.endsWith('%')) {
                css += ` height: ${styles.height};`
                styles.height = '100%'
            }
        }
        if (item.name && item.name.startsWith('chart-')) {
            this.generateCharts(item)
            const width = item.renderProps.width && item.renderProps.width.code
            const widthVal = width ? (typeof width === 'number' ? `${width}px` : width) : '100%'
            const widthStr = `width:${widthVal};`
            const height = item.renderProps.height && item.renderProps.height.code
            const heightStr = `height:${height || 200}px;`
            const displayStr = styles.display ? `display: ${styles.display};vertical-align: ${styles.verticalAlign || 'middle'};` : ''

            let componentCode = ''
            if (inFreeLayout) {
                componentCode = `
                    <div${alignStr}style="${css}" ${vueDirective}>
                        <div style="${widthStr}${heightStr}${displayStr}">
                            <chart :options="${item.componentId}" ${propDirective} autoresize></chart>
                        </div>
                    </div>`
            } else {
                componentCode = `
                    <div${alignStr}style="${widthStr}${heightStr}${displayStr}" ${vueDirective}>
                        <chart :options="${item.componentId}" ${propDirective} autoresize></chart>
                    </div>`
            }
            return componentCode
        } else if (item.type === 'widget-form') {
            let componentCode = ''
            const { itemClass = '' } = this.getItemStyles(item.componentId, styles, item.renderProps)
            const itemProps = this.getItemProps(item.type, item.renderProps, item.componentId, item.renderDirectives, item.renderSlots)
            componentCode = `
                    <div${alignStr}${itemClass} style="${css}">
                        <bk-form ${vueDirective} ${propDirective} ${itemProps}>
                            ${this.generateCode(item.renderSlots.default)}
                        </bk-form>
                    </div>
                   `
            return componentCode
        } else {
            // 使用了 element 组件库
            if (item.type.startsWith('el-')) {
                this.isUseElementComponentLib = true
            }
            // 使用了bkcharts
            if (item.type.startsWith('bk-charts')) {
                this.generateCharts(item)
                this.useBkCharts = true
            }
            // item.componentId = item.componentId.replace('_', '')
            // 记录是否为自定义组件
            if (item.custom && this.usingCustomArr.indexOf(item.type) === -1) {
                const prefix = process.env.BKPAAS_ENVIRONMENT === 'prod' ? '' : 'test-'
                const type = prefix + item.type
                if (this.usingCustomArr.indexOf(type) < 0) {
                    this.usingCustomArr.push(type)
                }
            }

            // icon 组件，样式中设置字体大小不生效，是因为 bk-icon 组件通过 size 属性来设置 font-size，默认值为 inherit
            if (item.type === 'bk-icon') {
                item.renderProps['size'] = {
                    format: 'value',
                    code: item.renderStyles.fontSize,
                    valueType: 'string',
                    renderValue: item.renderStyles.fontSize
                }
            }

            // widget-tab类型，转换成bk-tab， 并处理内置的active变量
            if (item.type === 'widget-tab') item.type = 'bk-tab'

            const { width } = styles
            if (inFreeLayout && width && width.endsWith('%')) {
                styles.width = '100%'
            }
            const componentCssPrefix = `.bk-layout-component-${this.uniqueKey}`
            let itemProps = this.getItemProps(item.componentType, item.renderProps, item.componentId, item.renderDirectives, item.renderSlots)
            const { itemStyles = '', itemClass = '' } = this.getItemStyles(item.componentId, styles, item.renderProps, componentCssPrefix)
            const itemEvents = this.getItemEvents(item.renderEvents)
            // <auth-button
            //     :permission="ACTION_PERM"
            //     auth="develop_app,deploy_app"
            //     :resource-id="30"
            //     class="edit-btn"
            //     theme="primary"
            //     @click="xxx"
            //     @keypress="yyy">
            //     xxx
            // </auth-button>
            if (this.isRenderAppPermComponents) {
                if (item.renderPerms && item.renderPerms.length) {
                    if (this.appPermComponents[item.type]) {
                        item.type = this.appPermComponents[item.type]
                        itemProps += ` auth="${item.renderPerms.map(perm => perm.actionId).join(',')}"`
                    }
                }
            }

            let componentCode = ''
            if (inFreeLayout) {
                if (styles.width) {
                    css += ` width: ${width};`
                } else {
                    // 自由布局中的表格，如果不设置宽度，那么宽度会一直增大，表格组件本身的缺陷
                    if (item.type === 'bk-table' || item.type === 'el-table') {
                        let width = 0
                        const colConf = item.renderSlots.default.code || []
                        colConf.forEach(col => {
                            if (col.width === null || col.width === undefined || col.width === '') {
                                width = parseFloat(width) + 80
                            } else {
                                // remote 中，如果返回的 col 配置中的 width 是非数字字符串的话，那么就会是 NaN
                                width = parseFloat(width) + (isNaN(col.width) ? 80 : parseFloat(col.width))
                            }
                        })
                        css += ` width: ${width}px;`
                    }
                }

                if (this.selfClosingTags.includes(item.type)) {
                    componentCode += `
                        <div${alignStr}style="${css}" ${vueDirective}>
                            <${item.type} ${itemProps} ${itemStyles} ${itemClass} ${itemEvents} ${propDirective} />
                        </div>`
                } else {
                    /** 段落组件对返回的html格式有要求，因此去掉换行和空格，此处模板不可以随意添加换行和空格 */
                    const slotStr = this.renderSlot(item.type, item.renderSlots, item.componentId)
                    if (item.type === 'p') {
                        // premitter 格式化代码，但是格式化代码带来的问题是，会把 p 标签内部的 inntertext 也做换行，这就导致最终 p 标签效果和预期效果不一致
                        // eslint-disable 要在 prettier-ignore 前面
                        componentCode += `
                            <div${alignStr}style="${css}" ${vueDirective}>
                                <!-- eslint-disable -->
                                <!-- prettier-ignore -->
                                <${item.type} ${itemProps} ${itemStyles} ${itemClass} ${itemEvents} ${propDirective}
                                    >${slotStr}
                                </${item.type}>
                                <!-- eslint-enable -->
                            </div>`
                    } else {
                        componentCode += `
                            <div${alignStr}style="${css}" ${vueDirective}>
                                <${item.type} ${itemProps} ${itemStyles} ${itemClass} ${itemEvents} ${propDirective}>${slotStr}</${item.type}>
                            </div>`
                    }
                }
            } else {
                if (this.selfClosingTags.includes(item.type)) {
                    componentCode += `
                          <${item.type}${alignStr}${itemProps} ${itemStyles} ${itemClass} ${itemEvents} ${vueDirective} ${propDirective} />`
                } else {
                    /** 段落组件对返回的html格式有要求，因此去掉换行和空格，此处模板不可以随意添加换行和空格 */
                    const slotStr = this.renderSlot(item.type, item.renderSlots, item.componentId)
                    if (item.type === 'p') {
                        // premitter 格式化代码，但是格式化代码带来的问题是，会把 p 标签内部的 inntertext 也做换行，这就导致最终 p 标签效果和预期效果不一致
                        // eslint-disable 要在 prettier-ignore 前面
                        componentCode += `
                            <!-- eslint-disable -->
                            <!-- prettier-ignore -->
                            <${item.type}${alignStr}${itemProps} ${itemStyles} ${itemClass} ${itemEvents} ${vueDirective} ${propDirective}
                            >${slotStr}</${item.type}>
                            <!-- eslint-enable -->`
                    } else {
                        componentCode += `
                            <${item.type}${alignStr}${itemProps} ${itemStyles} ${itemClass} ${itemEvents} ${vueDirective} ${propDirective}
                                >${slotStr}
                            </${item.type}>`
                    }
                }
            }
            return componentCode
        }
    }

    getAlignStr (renderAlign = {}, inFreeLayout = false) {
        let alignStr = ' '
        const prefix = inFreeLayout ? 'absolute-' : ''
        if (renderAlign.horizontal) {
            alignStr += `${prefix}${renderAlign.horizontal} `
        }
        if (renderAlign.vertical) {
            alignStr += `${prefix}${renderAlign.vertical} `
        }
        return alignStr
    }

    generateCss () {
        // 页面级样式设置
        const styleSetting = typeof this.styleSetting === 'string' ? JSON.parse(this.styleSetting) : this.styleSetting
        let pageStyle = ''

        // const paddingArr = ['padding', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom']
        const defaultPadding = this.platform === 'PC'
            ? { 'padding-left': '24px', 'padding-right': '24px', 'padding-top': '20px', 'padding-bottom': '0px' }
            : { 'padding': '0' }
        const pageSetting = Object.assign({}, defaultPadding, styleSetting)
        const styleSettings = this.handleRenderStyles(pageSetting)

        for (const i in styleSettings) {
            if (styleSettings[i] !== '') {
                pageStyle += `${paramCase(i)}: ${styleSettings[i]};\n`
            }
        }
        !styleSettings['height'] && (pageStyle += 'height: 100%')

        let head = '<style lang="css" scoped>'
        head += `.container-${this.uniqueKey} {
                ${pageStyle}
            }
            .bk-layout-row-${this.uniqueKey} {
                display: flex;
            }
            .bk-layout-row-${this.uniqueKey}:after {
                display: block;
                clear: both;
                content: "";
                font-size: 0;
                height: 0;
                visibility: hidden;
            }
            .bk-layout-col-${this.uniqueKey} {
                float: left;
                position: relative;
                min-height: 1px;
            }
            .bk-free-layout-${this.uniqueKey} {
                height: 500px;
                width: 100%;
                display: inline-block;
                position: relative;
            }
            .bk-free-layout-item-inner-${this.uniqueKey} {
                height: 100%;
                position: relative;
            }
            .bk-form-radio {
                margin-right: 20px;
            }
            .bk-form-checkbox {
                margin-right: 20px;
            }
            .echarts {
                width: 100%;
                height: 100%;
            }
            /* 设置 bk-exception 组件宽度为 100% */
            .bk-exception-img {
                width: 100%;
            }
            .bk-form-item {
                margin: 10px;
            }
            .bk-sideslider {
                margin: 0;
            }
            /* 设置 .bk-form-control 组件宽度为 auto */
            .bk-form-control {
                width: auto;
            }
            .bk-form-control .bk-input-text {
                font-size: 12px;
            }
            [align-horizontal-left] > *,
            [align-horizontal-center] > *,
            [align-horizontal-right] > *,
            [align-horizontal-space-between] > *,
            [align-vertical-top] > *,
            [align-vertical-center] > *,
            [align-vertical-bottom] > *{
                flex-shrink: 0;
            }
            [align-horizontal-left],
            [align-horizontal-center],
            [align-horizontal-right],
            [align-horizontal-space-between]{
                display: flex !important;
                align-items: flex-start;
                flex-wrap: wrap;
            }
            [align-horizontal-left]{
                justify-content: flex-start;
            }
            [align-horizontal-center]{
                justify-content: center;
            }
            [align-horizontal-right]{
                justify-content: flex-end;
            }
            [align-horizontal-space-between]{
                justify-content: space-between;
            }
            [align-vertical-top],
            [align-vertical-center],
            [align-vertical-bottom]{
                display: flex !important;
                flex-wrap: wrap;
            }
            [align-vertical-top]{
                align-items: flex-start;
            }
            [align-vertical-center]{
                align-items: center;
            }
            [align-vertical-bottom]{
                align-items: flex-end;
            }
            [absolute-align-horizontal-left] {
                left: 0 !important;
            }
            [absolute-align-horizontal-center] {
                left: 50% !important;
                transform: translateX(-50%) !important;
            }
            [absolute-align-horizontal-right] {
                left: unset !important;
                right: 0 !important;
            }
            [absolute-align-vertical-top] {
                top: 0 !important;
            }
            [absolute-align-vertical-center] {
                top: 50% !important;
                transform: translateY(-50%) !important;
            }
            [absolute-align-vertical-bottom] {
                top: unset !important;
                bottom: 0 !important;
            }
            [absolute-align-horizontal-center][absolute-align-vertical-center]{
                transform: translate(-50%, -50%) !important;
            }
         `
        if (this.isEmpty) {
            head += `.bk-exception {
                    margin-top:50px;
                }
            `
        }
        if (this.hasLayOut) {
            head += `
                .bk-navigation {
                    width:auto;
                    height:100vh;
                    outline:1px solid #ebebeb;
                }
                .bk-navigation .bk-navigation-wrapper {
                    height:calc(100vh - 252px)!important;
                }
                .bk-navigation-wrapper .navigation-container .container-content {
                padding: 0px;
                }
                .navigation-header {
                    -webkit-box-flex:1;
                    -ms-flex:1;
                    flex:1;
                    height:100%;
                    display:-webkit-box;
                    display:-ms-flexbox;
                    display:flex;
                    -webkit-box-align:center;
                    -ms-flex-align:center;
                    align-items:center;
                    font-size:14px;
                }
                .navigation-header .header-nav {
                    display:-webkit-box;
                    display:-ms-flexbox;
                    display:flex;
                    padding:0;
                    margin:0;
                }
                .navigation-header .header-title {
                    font-size:16px;
                }
                .navigation-header .header-nav-item,
                .navigation-header .is-complex-item
                 {
                    list-style:none;
                    height:50px;
                    display:-webkit-box;
                    display:-ms-flexbox;
                    display:flex;
                    -webkit-box-align:center;
                    -ms-flex-align:center;
                    align-items:center;
                    margin-right:40px;
                    color:#96A2B9;
                    min-width:56px
                }
                .navigation-header .header-nav-item:hover,
                .navigation-header .is-complex-item:hover {
                    cursor:pointer;
                }
                .navigation-head-nav {
                    width:150px;
                    display:-webkit-box;
                    display:-ms-flexbox;
                    display:flex;
                    -webkit-box-orient:vertical;
                    -webkit-box-direction:normal;
                    -ms-flex-direction:column;
                    flex-direction:column;
                    background:#FFFFFF;
                    border:1px solid #E2E2E2;
                    -webkit-box-shadow:0px 3px 4px 0px rgba(64,112,203,0.06);
                    box-shadow:0px 3px 4px 0px rgba(64,112,203,0.06);
                    padding:6px 0;
                    margin:0;
                    color:#63656E;
                }
                .navigation-head-nav .nav-item {
                    -webkit-box-flex:0;
                    -ms-flex:0 0 32px;
                    flex:0 0 32px;
                    display:-webkit-box;
                    display:-ms-flexbox;
                    display:flex;
                    -webkit-box-align:center;
                    -ms-flex-align:center;
                    align-items:center;
                    padding:0 20px;
                    list-style:none
                }
                .navigation-head-nav .nav-item:hover {
                    color:#3A84FF;
                    cursor:pointer;
                    background-color:#F0F1F5;
                }
                .tippy-popper .tippy-tooltip.navigation-message-theme {
                    padding:0;
                    border-radius:0;
                    -webkit-box-shadow:none;
                    box-shadow:none;
                }
                .nav-sign-out {
                    display: inline-block;
                    cursor: pointer;
                    background: #FFFFFF;
                    border: 1px solid #E2E2E2;
                    box-shadow: 0px 3px 4px 0px rgb(64 112 203 / 6%);
                    padding: 0 25px;
                    line-height: 30px;
                }
                .nav-sign-out:hover {
                    color:#3A84FF;
                    background-color:#F0F1F5;
                }
                .header-user {
                    height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#96A2B9;
                }
                .header-user:hover {
                    color:#D3D9E4;
                }
                .header-user .bk-icon {
                    margin-left:5px;
                    font-size:12px;
                }
                .white-theme .header-user {
                    color: #63656e;
                }
                .white-theme .header-user:hover {
                    color: #3a84ff;
                }
                .nav-head-right {
                    color: #d3d9e4;
                    margin-left: auto;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }
            `

            // 设置了导航主题色 则添加以下样式
            // if (this.layoutContent.theme && this.layoutContent.theme !== '#182132') {
            if (this.layoutContent.themeConfig) {
                head += `
                    .bk-navigation .theme-style {
                        color:#FFFFFF;
                        opacity:0.86;
                        font-weight:normal;
                    }
                    .title-desc.white-theme-title {
                        color:#313238;
                        font-weight:normal;
                    }
                    .white-navigation .theme-style {
                        color:#313238;
                    }
                    .white-navigation .header-user {
                        color:#63656E;
                    }
                    .white-navigation .header-user:hover {
                        color:#000000;
                    }
                    .white-theme-menu .navigation-sbmenu-title-arrow {
                        color:#c4c6cc !important;
                    }
                    .white-theme .title-desc {
                        color: #313238;
                    }
                    .other-theme .title-desc {
                        color: #fff;
                        opacity: 0.86;
                    }
                `

                // 动态设置顶部栏选中、hover样式
                if (['top-bottom', 'complex'].some(val => val === this.layoutType)) {
                    const topMenuBackground = this.layoutContent.themeConfig?.topMenuBackground || '#182132'
                    const topMenuTheme = this.layoutContent.themeConfig?.topMenuTheme || '#ffffff'
                    const isDefaultTheme = topMenuBackground === '#182132' // 默认主题
                    const isWhiteTheme = topMenuBackground === '#ffffff' // 白色主题
                    const defaultColor = isDefaultTheme ? '#96a2b9' : isWhiteTheme ? '#63656E' : '#ffffffad'
                    const activeColor = isDefaultTheme ? '#d3d9e4' : '#ffffffe6'
                    const defaultHoverTheme = topMenuTheme === '#ffffff' ? activeColor : `${topMenuTheme}ad`

                    if (this.layoutType === 'top-bottom') {
                        head += `
                        .header-nav-item {
                            color: ${defaultColor} !important;
                        }
                        .header-nav-item.item-active,
                        .header-nav-item.item-active:hover {
                            color: ${topMenuTheme} !important;
                        }
                        .header-nav-item:hover {
                            color: ${defaultHoverTheme} !important;
                        }
                    `
                    } else {
                        head += `
                        .is-complex-item {
                            color: ${defaultColor} !important;
                        }
                        .is-complex-active,
                        .is-complex-active:hover {
                            color: ${topMenuTheme} !important;
                        }
                        .is-complex-item:hover {
                            color: ${defaultHoverTheme} !important;
                        }
                    `
                    }
                }
            }
        }
        const end = '</style>\n'

        return head + this.cssStr + end
    }

    generateTemplate () {
        let pageCode = this.isGenerateNav ? '<router-view class="page-container"></router-view>' : `\n<section class="bk-layout-custom-component-wrapper container-${this.uniqueKey}">\n${this.nocodeType ? this.generataNocodePage() : this.generateCode(this.targetData)}\n</section>\n`
        if (this.isEmpty) pageCode = '<bk-exception class="exception-wrap-item" type="404"></bk-exception>'
        let source = pageCode
        if (this.hasLayOut) source = this.getLayout(pageCode)
        // bk-layout-custom-component-wrapper 打包自定义组件时添加此类作为最上层父类，避免自定义组件的类污染画布页面的东西
        // 预览时最顶层容器也要加上此类，让自定义组件的样式生效
        return '<template>\n' + source + '\n</template>'
    }

    getLayout (navContent) {
        const { layoutContent } = this
        const hasTopMenu = layoutContent.topMenuList && layoutContent.topMenuList.length
        const hasLeftMenu = layoutContent.menuList && layoutContent.menuList.length
        if (!hasLeftMenu && !hasTopMenu) return navContent

        this.dataTemplate('curNav', '{}')
        if (['preview', 'previewSingle'].includes(this.pageType)) {
            const user = JSON.stringify(this.user)
            this.dataTemplate('user', user)
        }

        const renderProps = layoutContent.renderProps || {}
        const propArray = []
        for (const prop in renderProps) {
            const value = renderProps[prop]
            const isString = typeof value === 'string'
            const perStr = isString ? '' : ':'
            propArray.push(`${perStr}${prop}="${value}"`)
        }
        const componentProps = propArray.join(' ')
        switch (this.layoutType) {
            case 'top-bottom':
                return this.getTopBottomLayout(navContent, componentProps)
            case 'left-right':
                return this.getLeftRightLayout(navContent, componentProps)
            case 'complex':
                return this.getComplexLayout(navContent, componentProps)
            case 'mobile-bottom':
                return this.getMobileBottomLayout(navContent, componentProps)
        }
    }

    getMobileBottomLayout (navContent, componentProps) {
        const menuKey = 'mobileBottomMenuLesscode'
        const { layoutContent } = this
        this.dataTemplate(menuKey, JSON.stringify(layoutContent.menuList))
        return `
            <div class="mobile-layout-wrapper">
                ${navContent}
                <van-tabbar route ${componentProps}>
                    <van-tabbar-item replace v-for="menu in ${menuKey}"
                        :key="menu.id"
                        :to="menu.fullPath"
                        :icon="menu.icon">
                        {{menu.name}}
                    </van-tabbar-item>
                </van-tabbar>
            </div>
        `
    }
    getTopBottomLayout (navContent, componentProps) {
        const topMenuKey = 'topMenuLesscode'
        const { layoutContent } = this
        const topMenuBackground = layoutContent.themeConfig?.topMenuBackground || '#182132'
        const isDefaultTheme = topMenuBackground === '#182132' // 默认主题
        const isWhiteTheme = topMenuBackground === '#ffffff' // 白色主题
        this.dataTemplate(topMenuKey, JSON.stringify(layoutContent.topMenuList))

        return `
            <bk-navigation head-theme-color=${topMenuBackground} ${componentProps} navigation-type="top-bottom" :need-menu="false" class="bk-layout-custom-component-wrapper" :class="{ 'white-navigation': ${isWhiteTheme} }">
                <template slot="side-header">
                    <span class="title-icon">
                        <img src="${layoutContent.logo}" style="width: 28px; height: 28px;">
                    </span>
                    <span class="title-desc" :class="{ 'theme-style': ${!isDefaultTheme} }">${layoutContent.siteName}</span>
                </template>
                <div class="navigation-header" slot="header">
                    <ol class="header-nav">
                        <bk-popover v-for="item in  ${topMenuKey}" :disabled="!item.children || item.children.length <= 0" :key="item.id" theme="light navigation-message" :arrow="false" offset="0, -5" placement="bottom" :tippy-options="{ flipBehavior: ['bottom'], appendTo: 'parent' }">
                            <li class="header-nav-item" :class="{ 'item-active': item.id === curNav.id, 'theme-item': ${!isDefaultTheme} }" @click="goToPage(item)">
                                {{item.name}}
                            </li>
                            <template slot="content">
                                <ul class="navigation-head-nav">
                                    <li class="nav-item" v-for="headerNavItem in item.children" :key="headerNavItem.id" @click="goToPage(headerNavItem)">
                                        {{headerNavItem.name}}
                                    </li>
                                </ul>
                            </template>
                        </bk-popover>
                    </ol>
                    <bk-popover class="nav-head-right" theme="light navigation-message" :arrow="false" offset="-10, 0" placement="bottom-start" :tippy-options="{ 'hideOnClick': false, appendTo: 'parent' }">
                        <div class="header-user" :class="{ 'theme-style': ${!isDefaultTheme} }">
                            <span>{{ user.username }}</span>
                            <i class="bk-icon icon-down-shape"></i>
                        </div>
                        <template slot="content">
                            <span @click="signOut" class="nav-sign-out">退出</span>
                        </template>
                    </bk-popover>
                </div>
                ${navContent}
            </bk-navigation>
        `
    }

    getLeftRightLayout (navContent, componentProps) {
        const leftMenuKey = 'leftMenuLesscode'
        const { layoutContent } = this
        const sideMenuBackground = layoutContent.themeConfig?.sideMenuBackground || '#182132'
        const sideMenuTheme = layoutContent.themeConfig?.sideMenuTheme || '#3c96ff'
        const isDefaultTheme = sideMenuBackground === '#182132' // 默认主题
        const isWhiteTheme = sideMenuBackground === '#ffffff' // 白色主题
        const isOtherTheme = !isDefaultTheme && !isWhiteTheme // 其他主题

        // 设置导航属性
        let themeColorProps = ''
        if (sideMenuBackground === '#ffffff') { // 白色主题需要设置以下属性
            themeColorProps += `
                \n item-active-color=${sideMenuTheme}
                \n item-active-icon-color=${sideMenuTheme}
                \n item-child-icon-active-color=${sideMenuTheme}
                \n item-default-bg-color=${sideMenuBackground}
                \n item-active-bg-color=${sideMenuTheme}1A
                \n item-hover-color='#63656e'
                \n item-hover-icon-color='#63656e'
                \n item-hover-bg-color='#f5f7fa'
                \n item-default-color='#63656e'
                \n item-default-icon-color='#63656e'
                \n item-child-icon-default-color='#63656e'
                \n sub-menu-open-bg-color='#fafbfd'
              `
        } else if (sideMenuBackground !== '#182132') { // 非默认背景色
            themeColorProps += `
                \n item-active-bg-color=${sideMenuTheme}
                \n item-default-bg-color=${sideMenuBackground}
                \n sub-menu-open-bg-color=${sideMenuBackground}
                \n item-hover-bg-color='#ffffff14'
                \n item-default-color='#ffffff'
                \n item-default-icon-color='#ffffff'
                \n item-child-icon-default-color='#ffffff'
                \n item-child-icon-active-color='#ffffff'
            `
        } else {
            themeColorProps += `
                \n item-default-bg-color=${sideMenuBackground}
                \n item-active-bg-color=${sideMenuTheme}
            `
        }

        this.dataTemplate(leftMenuKey, JSON.stringify(layoutContent.menuList))
        this.dataTemplate('toggleActive', 'false')

        return `
            <bk-navigation ${componentProps} theme-color="${sideMenuBackground}" navigation-type="left-right" need-menu class="bk-layout-custom-component-wrapper" @toggle="v => toggleActive=v" :class="{ 'white-theme': ${isWhiteTheme}, 'other-theme': ${isOtherTheme} }">
                <template slot="side-header">
                    <span class="title-icon">
                        <img src="${layoutContent.logo}" style="width: 28px; height: 28px;">
                    </span>
                    <span class="title-desc" :class="{ 'white-theme-title': ${isWhiteTheme} }">${layoutContent.siteName}</span>
                </template>
                <div class="navigation-header" slot="header">
                    <div class="header-title">
                        {{curNav.name}}
                    </div>
                    <bk-popover class="nav-head-right white-theme" theme="light navigation-message" :arrow="false" offset="-10, 0" placement="bottom-start" :tippy-options="{ 'hideOnClick': false, appendTo: 'parent' }">
                        <div class="header-user">
                            <span>{{ user.username }}</span>
                            <i class="bk-icon icon-down-shape"></i>
                        </div>
                        <template slot="content">
                            <span @click="signOut" class="nav-sign-out">退出</span>
                        </template>
                    </bk-popover>
                </div>
                <bk-navigation-menu
                    slot="menu"
                    :default-active="curNav.id"
                    :toggle-active="toggleActive"
                    :class="{ 'white-theme-menu': ${isWhiteTheme}}"
                    ${themeColorProps}>
                    <bk-navigation-menu-item
                        @click="goToPage(child)"
                        :key="child.id"
                        v-for="child in ${leftMenuKey}"
                        :id="child.id"
                        :icon="child.icon"
                        :has-child="child.children && !!child.children.length">
                        <span>{{child.name}}</span>
                        <div slot="child">
                            <bk-navigation-menu-item
                                @click="goToPage(set)"
                                :key="set.id"
                                v-for="set in child.children"
                                :id="set.id"
                                :class="{ 'white-theme-menu-item': ${isWhiteTheme} && curNav.id !== set.id}">
                                <span>{{set.name}}</span>
                            </bk-navigation-menu-item>
                        </div>
                    </bk-navigation-menu-item>
                </bk-navigation-menu>
                ${navContent}
            </bk-navigation>
        `
    }

    getComplexLayout (navContent, componentProps) {
        const complexMenuKey = 'complexMenuLesscode'
        const curLeftMenuKey = 'leftMenuLesscode'
        const { layoutContent } = this
        const topMenuBackground = layoutContent.themeConfig?.topMenuBackground || '#182132'
        const isDefaultTopTheme = topMenuBackground === '#182132' // 默认主题
        const isWhiteTopTheme = topMenuBackground === '#ffffff' // 白色主题
        const sideMenuBackground = layoutContent.themeConfig?.sideMenuBackground || '#182132'
        const sideMenuTheme = layoutContent.themeConfig?.sideMenuTheme || '#3c96ff'
        const sideThemeColor = sideMenuBackground === '#182132' ? '#2C354D' : sideMenuBackground

        // 设置导航属性
        let themeColorProps = ''
        if (sideMenuBackground === '#ffffff') { // 白色主题需要设置以下属性
            themeColorProps += `
                \n item-active-color=${sideMenuTheme}
                \n item-active-icon-color=${sideMenuTheme}
                \n item-child-icon-active-color=${sideMenuTheme}
                \n item-default-bg-color=${sideMenuBackground}
                \n item-active-bg-color=${sideMenuTheme}1A
                \n item-hover-color='#63656e'
                \n item-hover-icon-color='#63656e'
                \n item-hover-bg-color='#f5f7fa'
                \n item-default-color='#63656e'
                \n item-default-icon-color='#63656e'
                \n item-child-icon-default-color='#63656e'
                \n sub-menu-open-bg-color='#fafbfd'
              `
        } else if (sideMenuBackground !== '#182132') { // 非默认背景色
            themeColorProps += `
                \n item-active-bg-color=${sideMenuTheme}
                \n item-default-bg-color=${sideMenuBackground}
                \n sub-menu-open-bg-color=${sideMenuBackground}
                \n item-hover-bg-color='#ffffff14'
                \n item-hover-color='#ffffff'
                \n item-child-icon-hover-color='#ffffff'
                \n item-hover-icon-color='#ffffff'
                \n item-default-color='#ffffff'
                \n item-default-icon-color='#ffffff'
                \n item-child-icon-default-color='#ffffff'
                \n item-child-icon-active-color='#ffffff'
            `
        } else {
            themeColorProps += `
                \n item-active-bg-color=${sideMenuTheme}
                \n item-default-bg-color='#2c354d'
                \n item-hover-bg-color='#3a4561'
                \n item-hover-color='#ffffff'
                \n item-active-color='#ffffff'
                \n item-default-color='#acb5c6'
                \n item-default-icon-color='#acb5c6'
                \n item-child-icon-default-color='#acb5c6;'
                \n item-child-icon-hover-color='#acb5c6;'
                \n item-active-icon-color='#ffffff'
                \n item-hover-icon-color='#ffffff'
                \n item-child-icon-active-color='#ffffff'
                \n sub-menu-open-bg-color='#272F45'
            `
        }

        this.dataTemplate('toggleActive', 'false')
        this.dataTemplate(complexMenuKey, JSON.stringify(layoutContent.topMenuList))
        this.dataTemplate(curLeftMenuKey, '[]')

        return `
            <bk-navigation ${componentProps} head-theme-color=${topMenuBackground} navigation-type="top-bottom" :need-menu="${curLeftMenuKey}.length > 0" class="bk-layout-custom-component-wrapper" @toggle="v => toggleActive=v" theme-color="${sideThemeColor}" :class="{ 'white-navigation': ${isWhiteTopTheme} }">
                <template slot="side-header">
                    <span class="title-icon">
                        <img src="${layoutContent.logo}" style="width: 28px; height: 28px;">
                    </span>
                    <span class="title-desc" :class="{ 'theme-style': ${!isDefaultTopTheme} }">${layoutContent.siteName}</span>
                </template>
                <div class="navigation-header" slot="header">
                    <ul class="header-nav">
                        <li v-for="(item) in ${complexMenuKey}" :class="{ 'is-complex-active': item.id === curNav.id, 'theme-item': ${!isDefaultTopTheme} }" :key="item.id" theme="light navigation-message" class="is-complex-item" @click="goToPage(item)">
                            {{item.name}}
                        </li>
                    </ul>
                    <bk-popover class="nav-head-right" theme="light navigation-message" :arrow="false" offset="-10, 0" placement="bottom-start" :tippy-options="{ 'hideOnClick': false, appendTo: 'parent' }">
                        <div class="header-user" :class="{ 'theme-style': ${!isDefaultTopTheme} }">
                            <span>{{ user.username }}</span>
                            <i class="bk-icon icon-down-shape"></i>
                        </div>
                        <template slot="content">
                            <span @click="signOut" class="nav-sign-out">退出</span>
                        </template>
                    </bk-popover>
                </div>
                <bk-navigation-menu slot="menu" :default-active="curNav.id" :toggle-active="toggleActive" ${themeColorProps} :class="{ 'white-theme-menu': ${isWhiteTopTheme}}">
                    <bk-navigation-menu-item
                        @click="goToPage(child)"
                        :key="child.id"
                        v-for="child in ${curLeftMenuKey}"
                        :id="child.id"
                        :icon="child.icon"
                        :has-child="child.children && !!child.children.length">
                        <span>{{child.name}}</span>
                        <div slot="child">
                            <bk-navigation-menu-item
                                @click="goToPage(set)"
                                :key="set.id"
                                v-for="set in child.children"
                                :id="set.id"
                                :class="{ 'white-theme-menu-item': ${isWhiteTopTheme} && curNav.id !== set.id}">
                                <span>{{set.name}}</span>
                            </bk-navigation-menu-item>
                        </div>
                    </bk-navigation-menu-item>
                </bk-navigation-menu>
                ${navContent}
            </bk-navigation>
        `
    }

    generateScript () {
        const lifeCycle = typeof this.lifeCycle === 'string' ? JSON.parse(this.lifeCycle) : this.lifeCycle
        const lifeCycleValues = Object.values(lifeCycle)
        const exisLifyCycle = lifeCycleValues.filter(x => x)
        const lifeCircleStr = this.getLifeCycle()
        this.handleUsedVarAndFunc()
        const methodsStr = this.getMethods()
        const computedStr = this.getComputed()

        const importContent = this.getImportContent()
        let scriptContent = `${this.getComponents() ? `${this.getComponents()},` : ''}
                          ${this.pageType === 'projectCode' && (this.usingFuncCodes.length > 0 || exisLifyCycle.length > 0) ? 'mixins: [methodsMixin],' : ''}
                          ${this.getData() ? `${this.getData()},` : ''}
                          ${computedStr}
                          ${this.getWatch()}
                          ${lifeCircleStr}
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

    getWatch () {
        let watch = ''
        if (this.isPCLayout) {
            watch += `watch: {
                '$route' () {
                    this.setNav()
                }
            },`
        }
        return watch
    }

    getComputed () {
        let computed = ''
        // isUseSwiper时，添加bkH5Container的compute属性，获取swiper实例
        if ((['vueCode', 'projectCode'].includes(this.pageType) && this.hasLayOut) || this.projectVariables.length || this.pageComputedVariables.length || this.isUseSwiper) {
            computed += 'computed: {\n'
            if (['vueCode', 'projectCode'].includes(this.pageType) && this.hasLayOut) {
                computed += '...mapGetters([\'user\']),\n'
            }
            this.projectVariables.forEach((variable) => {
                computed += `${variable.variableCode}: {
                    get () {
                        return this.$store.state.variable.${variable.variableCode}
                    },
                    set (val) {
                        this.$store.dispatch('variable/setBkProjectVariable', { code: '${variable.variableCode}', val })
                    }
                },
                `
            })
            this.pageComputedVariables.forEach((variable) => {
                computed += `${variable.variableCode} () {
                    ${variable.defaultValue.all}
                },
                `
            })
            if (this.isUseSwiper) {
                computed += `bkH5Container() {
                    return this.$refs['h5-container'].$swiper
                }`
            }
            computed += '},'
        }
        return computed
    }

    generateCode (v, inFreeLayout = false, inSwiper = false) {
        const len = v.length
        let code = ''
        for (let i = 0; i < len; i++) {
            const item = v[i]
            const { vueDirectives, propDirectives, templateDirectives } = this.getDirectives(item.renderDirectives, item.renderProps, item.componentId)
            const vueDirective = vueDirectives.join(' ')
            const templateDirective = templateDirectives.join(' ')
            const propDirective = propDirectives.join(' ')

            const alignStr = this.getAlignStr(item.renderAlign || {}, inFreeLayout)
            if (templateDirective) code += `\n<template ${templateDirective}>`
            if (item.type === 'render-grid') {
                /* eslint-disable no-unused-vars, indent */
                const { itemClass = '' } = this.getItemStyles(item.componentId, item.renderStyles, item.renderProps, '', '', inFreeLayout)
                code += `
                    ${itemClass
                        ? `\n<div${alignStr}class="bk-layout-row-${this.uniqueKey} ${item.componentId}" ${vueDirective} ${propDirective}>`
                        : `<div class="bk-layout-row-${this.uniqueKey}" ${vueDirective} ${propDirective}>`
                    }
                    ${item.renderSlots && item.renderSlots.default && item.renderSlots.default.map(col => {
                        const { itemClass = '' } = this.getItemStyles(col.componentId, col.renderStyles, col.renderProps)
                        const colAlignStr = this.getAlignStr(col.renderAlign || {}, inFreeLayout)
                        const {
                            vueDirectives: rowVueDirs,
                            propDirectives: rowPropDirs,
                            templateDirectives: rowTempDirs
                        } = this.getDirectives(col.renderDirectives, col.renderProps, col.componentId)
                        let rowCode = ''
                        if (rowTempDirs.join(' ')) rowCode += `\n<template ${rowTempDirs.join(' ')}>`
                        rowCode += `<div class="bk-layout-col-${this.uniqueKey} ${col.componentId}"${colAlignStr} ${rowVueDirs.join(' ')} ${rowPropDirs.join(' ')}>
                            ${col.renderSlots.default.length ? `${this.generateCode(col.renderSlots.default)}` : ''}
                        </div>`
                        if (rowTempDirs.join(' ')) rowCode += '\n</template>'
                        return rowCode
                        }).join('\n')
                    }
                    </div>
                `
            } else if (['free-layout', 'h5-page'].includes(item.type)) { // 此处判断条件在刷数据库后，可改为 item.freeLayoutProperty
                const { itemClass = '' } = this.getItemStyles(item.componentId, item.renderStyles, item.renderProps, '', item.type)
                const freeLayoutCode = `
                    ${itemClass ? `\n<div class="bk-free-layout-${this.uniqueKey} ${item.componentId}" ${vueDirective} ${propDirective}>` : `<div class="bk-free-layout-${this.uniqueKey}" ${vueDirective} ${propDirective}>`}
                        ${this.generateCode(item.renderSlots.default || [], true)}
                    </div>
                `
                code += inSwiper ? `<swiper-slide>${freeLayoutCode}</swiper-slide>\n` : freeLayoutCode
                 /* eslint-enable no-unused-vars, indent */
            } else if (item.type === 'h5-container') {
                this.isUseSwiper = true
                /** 根据renderProps获取swiperOption，用于动态配置swiper */
                let swiperOptionsStr = ''
                for (const [key, value] of Object.entries(item.renderProps)) {
                    swiperOptionsStr += `${key}: `
                    switch (typeof value.renderValue) {
                        case 'string':
                            swiperOptionsStr += `'${value.renderValue}',\n`
                            break
                        case 'boolean':
                            if (key === 'pagination' && value.renderValue === true) {
                                swiperOptionsStr += '{ el: \'.swiper-pagination\' },\n'
                                break
                            }
                            swiperOptionsStr += `${value.renderValue},\n`
                            break
                        case 'number':
                            swiperOptionsStr += `${value.renderValue},\n`
                    }
                }

                this.dataTemplate('swiperOptions', `{
                        direction: 'vertical',
                        on: {
                            init: function () {
                                swiperAni.swiperAnimateCache(this)
                                swiperAni.swiperAnimate(this)
                            },
                            slideChange: function () {
                                swiperAni.swiperAnimate(this)
                            }
                        },
                        ${swiperOptionsStr}}`)
                code += `
                    <swiper style="height: 100%" ref="h5-container" :options="swiperOptions">
                        ${this.generateCode(item.renderSlots.default, false, true)}<div class="swiper-pagination" slot="pagination"></div>
                    </swiper>
                `
            } else {
                if (item.type === 'widget-form-item') item.type = 'bk-form-item'
                code += this.generateComponment(item, vueDirective, propDirective, inFreeLayout)
            }
            if (templateDirective) code += '\n</template>'
        }
        return code
    }

    getItemProps (type, props, compId, directives, slots) {
        const hasProps = props && typeof props === 'object' && Object.keys(props).length > 0
        const dirProps = (directives || []).filter((directive) => (directive.code !== undefined && directive.code !== ''))
        let itemProps = ''
        if (hasProps || slots) {
            itemProps = this.getPropsStr(type, props, compId, dirProps, slots)
        }
        return itemProps
    }

    getPropsStr (type, props, compId, dirProps, slots) {
        let propsStr = ''
        const preCompId = camelCase(compId, { transform: camelCaseTransformMerge })
        // 需配置vmodel的组件
        let modelComId = ''
        const componentType = type
        if (type === 'bk-table') {
            if (props.hasOwnProperty('show-pagination-info') && props.hasOwnProperty('showPaginationInfo')) {
                delete props.showPaginationInfo
            }
        }
        if (props.data?.valueType === 'table-data-source') {
            propsStr += `table-name="${props.data?.payload?.sourceData?.tableName}" bk-data-source-type="${props.data?.payload?.sourceData?.dataSourceType}" :show-operation-column="${props.data?.payload?.sourceData?.showOperationColumn}" `
        }

        for (const i in props) {
            if (dirProps.find((directive) => (directive.prop === i)) && !['remote', 'data-source', 'table-data-source'].includes(props[i].valueType)) continue

            if (i !== 'slots' && i !== 'class') {
                compId = `${preCompId}${camelCase(i, { transform: camelCaseTransformMerge })}`
                if (i === 'value') modelComId = compId

                const { valueType: type, modifiers = [], renderValue, buildInVariableType, payload = {} } = props[i]
                const { sourceData = {}, customVariableCode = '' } = payload
                let { format, code: val } = props[i]
                // format为value，code为空 ， 用renderValue的值
                // format为variable,code为空，把format改为value， 用renderValue的值
                if (!val) {
                    val = renderValue
                    format = 'value'
                }

                // 特殊处理兼容tab的active属性
                if (i === 'active' && componentType === 'bk-tab' && !modifiers.includes('sync')) {
                    modifiers.push('sync')
                }

                let useCustomVariable = false
                let propVar = compId
                if (format !== 'value') {
                    propVar = val
                } else if (buildInVariableType === 'CUSTOM' && customVariableCode) {
                    // 自定义变量代替默认变量名称
                    useCustomVariable = true
                    propVar = customVariableCode
                    val = customVariableCode
                    this.handleUsedVariable('variable', val, global.i18n.t('组件【{{0}}】的【{{1}}】属性', [compId, i]))
                }
                const propName = format !== 'value' && modifiers && modifiers.length ? `${i}.${modifiers.join('.')}` : i
                const curPropStr = `${val === undefined ? '' : ':'}${propName}="${propVar}" `

                if (format !== 'value') {
                    this.handleUsedVariable(format, val, global.i18n.t('组件【{{0}}】的【{{1}}】属性', [compId, i]))
                    propsStr += curPropStr
                    continue
                } else if (i === 'pagination' && ['widget-bk-table', 'widget-el-table'].includes(componentType)) {
                    if (['local', 'remote'].includes(payload.type)) {
                        const paginationStr = Object
                            .keys(payload.val)
                            .reduce((acc, cur) => {
                                const item = payload.val[cur]
                                if (cur === 'count') {
                                    let countVariableName = `${camelCase(compId, { transform: camelCaseTransformMerge })}Count`
                                    if (item.buildInVariableType === 'CUSTOM') {
                                        this.handleUsedVariable('variable', item.customVariableCode, global.i18n.t('组件【{{0}}】的【{{1}}】属性', [compId, i]))
                                        countVariableName = item.customVariableCode
                                    } else {
                                        this.dataTemplate(countVariableName, 0)
                                    }
                                    acc.push(`'${cur}': ${countVariableName}`)
                                } else if (item.format === 'value') {
                                    acc.push(`'${cur}': ${item.val}`)
                                } else {
                                    this.handleUsedVariable(item.format, item.code, global.i18n.t('组件【{{0}}】的【{{1}}】属性', [compId, i]))
                                    acc.push(`'${cur}': ${item.code}`)
                                }
                                return acc
                            }, [])
                            .join(',')
                        propsStr += `:pagination="{ ${paginationStr} }" pagination-type="${payload.type}" `
                    }
                    propsStr += `data-value-type="${props.data.valueType}" `
                    continue
                } else if (type === 'remote' && payload.methodCode) {
                    const curDir = dirProps.find((directive) => (directive.prop === i))
                    const key = (curDir || {}).code || propVar
                    this.remoteMethodsTemplate(key, payload || {})
                    if (!curDir) {
                        !useCustomVariable && this.dataTemplate(propVar, JSON.stringify([]))
                        propsStr += curPropStr
                    }
                    continue
                } else if (type && ['data-source', 'table-data-source', 'select-data-source'].includes(type) && sourceData.tableName) {
                    const curDir = dirProps.find((directive) => (directive.prop === i))
                    const key = (curDir || {}).code || propVar
                    this.dataSourceTemplate(key, sourceData || {})
                    if (!curDir) {
                        !useCustomVariable && this.dataTemplate(propVar, JSON.stringify([]))
                        propsStr += curPropStr
                    }
                    continue
                } else if (type === 'array' || type === 'object' || typeof val === 'object') {
                    if (componentType === 'widget-form' && i === 'rules') {
                        this.handleFormRules(propVar, val)
                    } else {
                        !useCustomVariable && this.dataTemplate(propVar, JSON.stringify(val))
                    }
                    propsStr += curPropStr
                    continue
                } else if (type === 'function') {
                    const [method, params] = this.getMethodByCode(props[i].payload || {})
                    if (method.funcName && method.funcCode) {
                        if (method?.funcParams?.length > 0) {
                            propsStr += `:${propName}="(args) => ${method.funcName}(${this.getFuncParamStr(method, params, global.i18n.t('属性【{{n}}】', { n: i }))}, ...args)"`
                        } else {
                            propsStr += (`:${propName}="${method.funcName}" `)
                        }

                        this.addUsedFunc(method.funcCode)
                    }
                    continue
                } else if (i === 'active' && componentType === 'widget-tab') {
                    this.dataTemplate(propVar, JSON.stringify(val))
                    propsStr += `:active.sync="${propVar}"`
                } else {
                    /** h5容器动画属性的特殊处理, 将数字转为字符串  3 => 3s */
                    if (['swiper-animate-duration', 'swiper-animate-delay'].includes(propName)) {
                        const propValue = val.replace(/^((0\.)?\d+)s?$/, '$1')
                        propsStr += ` ${propName}="${propValue}s"`
                        continue
                    }
                    if (val !== undefined) {
                        const v = (typeof val === 'object' ? JSON.stringify(val).replace(/\"/g, '\'') : val)
                        propsStr += `${typeof val === 'string' ? '' : ':'}${propName}="${v}" `
                    }
                }
            }
        }
        const hasVModel = dirProps.filter(item => item.type === 'v-model').length
        if (type === 'bk-checkbox-group' && !hasVModel) {
            const checkedValue = (slots.default.code || []).filter(c => c.checked === true).map(c => c.value)
            this.dataTemplate(`${compId}Vmodel`, JSON.stringify(checkedValue))
            propsStr += `v-model="${compId}Vmodel"`
        }
        if (type === 'bk-radio-group' && !hasVModel) {
            const checkedItem = (slots.default.code || []).find(c => c.checked === true)
            const checkedValue = (checkedItem && checkedItem.value) || ''
            this.dataTemplate(`${compId}Vmodel`, `'${checkedValue}'`)
            propsStr += `v-model="${compId}Vmodel"`
        }
        // element组件、vant组件添加vmodel
        if (type.startsWith('el-') || type.startsWith('van')) {
            if (!hasVModel && modelComId !== '') {
                const valueType = typeof props['value'].code
                if (valueType !== 'array' && valueType !== 'object') {
                    let vModelValue = props['value'].code.toString()
                    if (valueType === 'string') vModelValue = `'${props['value'].code}'`
                    this.dataTemplate(modelComId, vModelValue)
                }
                propsStr += `v-model="${modelComId}"`
            }
        }
        return propsStr
    }

    // 生成formRules部分
    handleFormRules (propVar, val) {
        const notStringType = ['required', 'validator', 'regex']
        const reg = /,$/gi
        let jsonStr = '{'
        try {
            if (typeof val === 'object' && Object.keys(val).length > 0) {
                for (const i in val) {
                    jsonStr += `${i}: [`
                    if (val[i] && val[i].length) {
                        const funcItems = val[i].filter(item => item.validator)

                        funcItems.map(item => {
                            const [method] = this.getMethodByCode({ methodCode: item.validator })
                            if (method.funcCode) {
                                this.addUsedFunc(method.funcCode)
                            }
                            item.validator = `this.${item.validator}`
                        })
                        val[i].map(rule => {
                            jsonStr += '{'
                            for (const j in rule) {
                                if (notStringType.indexOf(j) === -1) {
                                    jsonStr += `${j}: '${rule[j]}',`
                                } else {
                                    if ((j === 'regex' || j === 'validator') && !rule[j]) {
                                        // 为空则忽略
                                    } else if (j === 'regex' && (!rule[j].startsWith('/') || !rule[j].endsWith('/'))) {
                                        // 为空则忽略
                                    } else {
                                        jsonStr += `${j}: ${rule[j]},`
                                    }
                                }
                            }
                            jsonStr += '},'
                        })
                        jsonStr = jsonStr.replace(reg, '')
                    }
                    jsonStr += '],'
                }
                jsonStr = jsonStr.replace(reg, '')
                jsonStr += '}'
            } else {
                jsonStr = '{}'
            }
        } catch (err) {
            console.log(err, 'ruleError')
            jsonStr = '{}'
        }
        this.dataTemplate(propVar, jsonStr)
    }

    // 合并属性面板样式和自定义样式，并统一转成连字符
    handleRenderStyles (renderStyles) {
        const styles = {}
        if (renderStyles && typeof renderStyles === 'object' && Object.keys(renderStyles).length > 0) {
            if (renderStyles['customStyle']) {
                Object.assign(renderStyles, renderStyles['customStyle'])
                delete renderStyles['customStyle']
            }
            for (const key in renderStyles) {
                if (renderStyles[key]) {
                    Object.assign(styles, { [paramCase(key)]: unitFilter(renderStyles[key]) })
                }
            }
        }
        return styles
    }

    getItemStyles (compId, renderStyles, props, cssNamePrefix = '', componentType, inFreeLayout = false) {
        // 分离class和其它style属性
        let className = compId
        className += (props && props.hasOwnProperty('class') && ` ${props.class.code}`) || '' // 添加原生标签的用户自定义class

        const styles = this.handleRenderStyles(renderStyles)

        const hasStyle = Object.keys(styles).length > 0
        // 有设置class的话，将样式写至<style>
        if (hasStyle) {
            let tmpStr = ''
            for (const i in styles) {
                // 自由布局的组件由父元素来绝对定位，left 和 top 也由父元素控制，因此组件本身的 top 和 left 设置为 0
                if (inFreeLayout && (i === 'top' || i === 'left')) {
                    tmpStr += `${i}: 0px;\n`
                } else if (i === 'height' && componentType === 'h5-page' && this.pageType !== 'previewSingle') { // 模板市场预览(previewSingle)时，非iframe实现，不能使用100vh
                    tmpStr += `${i}: 100vh;\n`
                } else {
                    tmpStr += `${paramCase(i)}: ${unitFilter(styles[i])};\n`
                }
            }

            this.cssStr += compId.startsWith('elIcon') ? `\n.${compId}` : `\n${cssNamePrefix}.${className}`
            this.cssStr += ` {\n${tmpStr}}`
        }

        // const itemStyles = `${(!hasStyle || className) ? '' : `:style='${JSON.stringify(styles)}'`}`
        const itemStyles = ''
        const aniSuffix = (props && props.hasOwnProperty('swiper-animate-effect') && ' ani') || ''
        const itemClass = `${!hasStyle ? `class='bk-layout-component-${this.uniqueKey}'` : `class='bk-layout-component-${this.uniqueKey} ${className + aniSuffix}'`}`

        return { itemStyles, itemClass }
    }

    getItemEvents (events = {}) {
        let eventStr = ''
        if (typeof events === 'object' && Object.keys(events).length) {
            for (const key in events) {
                const event = events[key]
                const [fun, params] = this.getMethodByCode(event)
                if (fun.id && (event.enable === undefined || event.enable)) {
                    let curEventStr = `@${key}="${fun.funcName}" `
                    if (fun?.funcParams?.length > 0) curEventStr = `@${key}="(...args) => ${fun.funcName}(${this.getFuncParamStr(fun, params, global.i18n.t('事件【{{n}}】', { n: key }), false, 'event')}, ...args)" `
                    eventStr += curEventStr
                    this.addUsedFunc(fun.funcCode)
                }
            }
        }
        return eventStr
    }

    handleUsedVariable (valType, val, errMessagePerfix, dataSourceId, dataSourceType) {
        let disPlayVal = val
        switch (valType) {
            case 'value':
                disPlayVal = this.getValue(val)
                break
            case 'variable':
                const variable = this.variableList.find(x => x.variableCode === val)
                // form表单内的v-model绑定值忽略这个判断
                if (!variable && !(errMessagePerfix.indexOf('v-model') > 0 && val.indexOf('.') > 0)) {
                    this.codeErrMessage = global.i18n.t('{{0}}使用了不存在的变量【{{1}}】，请修改后重试', [errMessagePerfix, val])
                }
                if (variable) {
                    this.addUsedVariable(variable)
                }
                break
            case 'expression':
                this.variableList.forEach((variable) => {
                    if (val.includes(variable.variableCode)) {
                        this.addUsedVariable(variable)
                    }
                })
                break
            case 'dataSource':
                disPlayVal = dataSourceId
                this.dataTemplate(dataSourceId, JSON.stringify([]))
                this.dataSourceTemplate(dataSourceId, { tableName: val, dataSourceType })
                break
        }
        return disPlayVal
    }

    getDirectives (renderDirectives, renderProps, componentId) {
        // 过滤
        const exisDirectives = (renderDirectives || []).filter((directive) => (directive.code !== '' && directive.val !== ''))
        const vueDirectives = []
        const templateDirectives = []
        const propDirectives = []
        const id = componentId.replace(/\-(.)/g, x => (x.slice(1)).toUpperCase())

        exisDirectives.forEach((directive) => {
            const { type, modifiers = [], prop = '', format, code: val, dataSourceType } = directive
            const modifierStr = (modifiers || []).map((modifier) => `.${modifier}`).join('')
            const dataSourceId = (componentId + type).replace(/\-(.)/g, x => (x.slice(1)).toUpperCase())
            const disPlayVal = this.handleUsedVariable(format, val, global.i18n.t('组件【{{0}}】的【{{1}}】指令', [componentId, type]), dataSourceId, dataSourceType)
            /** 兼容旧数据，v-model为undefined的情形(v-model不能为undefined) */
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

    renderSlot (type, slots, compId) {
        if (!slots) {
            return ''
        }

        let slotStr = ''
        compId = `${compId}`.replace('-', '')
        compId = `${camelCase(compId, { transform: camelCaseTransformMerge })}Slot`
        const slotKeys = Object.keys(slots)
        slotKeys.forEach((key) => {
            const slot = slots[key]
            const isDefaultSlot = key === 'default'
            compId = compId + key
            slotStr += type === 'p' ? '' : '\n'
            if (!isDefaultSlot) slotStr += `<template slot="${key}">\n`
            if (Array.isArray(slot)) {
                slotStr += this.generateCode(slot)
            } else if (typeof slot === 'object' && slot.componentId) {
                const codeArr = []
                codeArr.push(slot)
                slotStr += this.generateCode(codeArr)
            } else {
                // 兼容code为空的情形
                if (!slot.code) {
                    slot.val = slot.renderValue
                    slot.format = 'value'
                } else {
                    slot.val = slot.code
                }
                slot.name = slot.component
                const render = slotRenderConfig[slot.name] || (() => {})
                const slotRenderParams = []
                let curSlot = slot
                do {
                    const defaultValMap = {
                        '[object Array]': [],
                        '[object Object]': {},
                        '[object Number]': 0,
                        '[object Boolean]': false,
                        '[object String]': ''
                    }
                    const { methodData = {}, sourceData = {}, customVariableCode = '' } = slot.payload || {}
                    const type = Object.prototype.toString.call(slot.val)
                    let disPlayVal = defaultValMap[type] || ''
                    const param = { val: disPlayVal, type: 'variable', payload: slot.payload, valueType: slot.valueType, valueKeys: slot.valueKeys }

                    let slotVar = compId
                    // 自定义变量代替默认变量名称
                    let useCustomVariable = false
                    if (slot.format === 'value' && slot.buildInVariableType === 'CUSTOM' && customVariableCode) {
                        useCustomVariable = true
                        slot.val = customVariableCode
                        slotVar = customVariableCode
                        this.handleUsedVariable('variable', slot.val, global.i18n.t('组件【{{0}}】的【{{1}}】属性', [compId, key]))
                    }

                    if (slot.format !== 'value') {
                        disPlayVal = this.handleUsedVariable(slot.format, slot.val, global.i18n.t('组件【{{0}}】的【{{1}}】属性', [compId, key]))
                    } else if (['remote', 'select-remote'].includes(slot.valueType) && methodData.methodCode) {
                        !useCustomVariable && this.dataTemplate(slotVar, transformToString(disPlayVal))
                        this.remoteMethodsTemplate(slotVar, methodData || {})
                        disPlayVal = slotVar
                    } else if (slot.valueType && ['data-source', 'table-data-source', 'select-data-source'].includes(slot.valueType) && sourceData.tableName) {
                        !useCustomVariable && this.dataTemplate(slotVar, transformToString(disPlayVal))
                        this.dataSourceTemplate(slotVar, sourceData || {})
                        disPlayVal = slotVar
                    } else {
                        if (typeof slot.val === 'object') {
                            !useCustomVariable && this.dataTemplate(slotVar, transformToString(slot.val))
                            disPlayVal = slotVar
                        } else {
                            disPlayVal = slot.val
                            param.type = 'value'
                        }
                    }
                    // table slot 可能会用到fun，需要特殊处理一下。其他情况也可以在slot value 里面加上 methodCode 字段来处理
                    if (Array.isArray(slot.val)) {
                        (slot.val || []).forEach((item) => {
                            const methodCodeList = Array.isArray(item.methodCode) ? item.methodCode : [item.methodCode]
                            methodCodeList.forEach((methodCode) => {
                                if (methodCode) {
                                    this.addUsedFunc(methodCode)
                                }
                            })
                        })
                    }
                    param.val = disPlayVal
                    slotRenderParams.push(param)
                    curSlot = curSlot.renderSlots
                } while (curSlot && Object.keys(curSlot).length > 0)
                slotStr += render(...slotRenderParams)
            }
            if (!isDefaultSlot) slotStr += '\n</template>\n'
        })
        return slotStr
    }

    getData () {
        let data = ''
        if (this.dataStr || this.pageDataVariables.length) {
            this.dataStr.endsWith(',\n') && this.dataStr.substr(0, this.dataStr.length - 2)
            data += `data () {
                ${this.pageDataVariables.length ? `function getInitVariableValue (defaultValue, defaultValueType) {
                    let val = defaultValue.all
                    if (defaultValueType === 1) val = defaultValue[window.BKPAAS_ENVIRONMENT]
                    return val
                }` : ''}
                return {
                    ${this.dataStr}
                }
            }`
        }
        return data
    }

    handleVarInFunc (dirKey, funcCode) {
        if (funcCode) {
            const [curFunc] = this.getMethodByCode(funcCode)
            if (curFunc.id) {
                this.addUsedFunc(funcCode)
            } else {
                this.codeErrMessage = global.i18n.t('函数【{{n}}】不存在，函数执行可能存在异常，请修改后再试', { n: funcCode })
            }
            return `this.${curFunc.funcName}`
        }
        if (dirKey) {
            const variable = this.variableList.find((variable) => (variable.variableCode === dirKey))
            if (variable) {
                this.addUsedVariable(variable)
            } else {
                this.codeErrMessage = global.i18n.t('变量【{{n}}】不存在，函数执行可能存在异常，请修改后再试', { n: dirKey })
            }
            return `this.${dirKey}`
        }
    }

    processFuncBody (code) {
        // 生成源码要删除首行注释和转义尖括号
        const encodeCode = (code || '')
            .replace(
                /(<)(\/?)([^>\r\n]+)(>)/gi,
                (match, p1, p2, p3, p4, offset, string) => `\\${p1}` + `${p2 && `\\${p2}`}` + p3 + `\\${p4}`
            )
            .replace(/^\/\*[\s\S]*?\*\/(\r\n)?/, '')
        return replaceFuncKeyword(encodeCode, (all, first, second, dirKey, funcStr, funcCode) => {
            return this.handleVarInFunc(dirKey, funcCode) || all
        })
    }

    processFuncUrl (str) {
        return replaceFuncParam(str || '', (variableCode) => {
            return `\$\{${this.handleVarInFunc(variableCode)}\}`
        })
    }

    getComplateFuncByCode (methodCode) {
        const [returnMethod] = this.getMethodByCode(methodCode) || {
            id: '',
            funcName: 'emptyFunc',
            previewStr: '',
            vueCodeStr: '',
            funcBody: ''
        }
        const paramsStr = (returnMethod.funcParams || []).join(', ')
        const addFuncStr = (funcBody = '') => {
            const hasAwait = /await\s/.test(funcBody)
            return `${hasAwait ? 'async' : ''} ${returnMethod.funcName} (${paramsStr}) { ${funcBody} }`
        }
        const funcBody = this.processFuncBody(returnMethod.funcBody)
        if (returnMethod.funcType === 1) {
            const remoteParams = (returnMethod.remoteParams || []).join(', ')
            const {
                apiDataString,
                codes
            } = getRemoteFunctionInfo(returnMethod)
            codes.forEach((code) => {
                this.handleVarInFunc(code)
            })
            // 构造 url
            let funcApiUrl = returnMethod.funcApiUrl
            if (returnMethod?.apiChoosePath?.find(path => path.id === 'lesscode-api')) {
                const apiData = this.apiList.find(api => api.code === returnMethod.apiChoosePath[2].code)
                funcApiUrl = apiData?.url || returnMethod.funcApiUrl
            }
            const data = `{
                url: \`${this.processFuncUrl(funcApiUrl)}\`,
                type: '${returnMethod.funcMethod}',
                apiData: ${apiDataString},
                withToken: ${returnMethod.withToken}
            }`
            returnMethod.code = addFuncStr(`return this.$store.dispatch('getApiData', ${data}).then((${remoteParams}) => { ${funcBody} }).catch((err) => { console.error(err) })`)
        } else {
            returnMethod.code = addFuncStr(funcBody)
        }
        return returnMethod
    }

    getMethods () {
        let methods = ''

        if (this.hasLayOut || this.remoteDataStr || (this.usingFuncCodes.length && ['vueCode', 'preview', 'previewSingle'].includes(this.pageType))) {
            methods += 'methods: {'

            // 布局相关的方法
            if (this.isPCLayout) {
                /* eslint-disable indent */
                  methods += `
                    goToPage (item) {
                        if (this.$route.query.id === item.id) return
                        this.setNav(item.id)
                        const originQuery = item.query || ''
                        const queryStr = originQuery[0] === '?' ? originQuery.slice(1) : originQuery
                        const queryArr = queryStr.split('&').filter(v => v)
                        const query = queryArr.reduce((res, item) => {
                            const [key, value = ''] = item.split('=')
                            res[key] = value
                            return res
                        }, { id: item.id })
                        if (item.pageCode && item.pageCode === this.$route.name) {
                            this.$router.push({ path: this.$route.path, query })
                        } else if (item.pageCode && !${JSON.stringify(this.deletePageCodes || [])}.includes(item.pageCode)) {
                            this.$router.push({ name: item.pageCode, query })
                        } else if (item.fullPath) {
                            this.$router.push({ path: item.fullPath, query })
                        } else if (item.link) {
                            window.open(item.link, '_blank')
                        } else {
                            this.$router.push({ path: '${this.uniqueKey}', query })
                        }
                    },
                `
                let setNav = ''
                const pageKey = this.pageType === 'projectCode' ? 'pageCode' : 'pageCode'
                const pageValue = this.pageType === 'projectCode' ? 'this.$route.name' : 'this.$route.query.pageCode'
                switch (this.layoutType) {
                    case 'mobile-bottom':
                        setNav = 'setNav (id) {}'
                        break
                    case 'top-bottom':
                        setNav = `setNav (id) {
                            const itemId = id || this.$route.query.id
                            const name = ${pageValue};
                            (this.topMenuLesscode || []).forEach((topNav) => {
                                const isSameId = itemId && (topNav.id === itemId || (Array.isArray(topNav.children) && topNav.children.find((nav) => (nav.id === itemId))))
                                const isSameName = !itemId && name && (topNav.${pageKey} === name || (Array.isArray(topNav.children) && topNav.children.find((nav) => (nav.${pageKey} === name))))
                                if (isSameId || isSameName) this.curNav = topNav || {}
                            })
                        },`
                        break
                    case 'left-right':
                        setNav = `setNav (id) {
                            const itemId = id || this.$route.query.id
                            const name = ${pageValue};
                            (this.leftMenuLesscode || []).forEach((menu) => {
                                let tempItem
                                if (itemId) {
                                    tempItem = [menu, ...(menu.children || [])].find((child) => (child.id === itemId))
                                } else {
                                    tempItem = [menu, ...(menu.children || [])].find((child) => (child.${pageKey} === name))
                                }
                                if (tempItem) this.curNav = tempItem
                            })
                        },`
                        break
                    case 'complex':
                        setNav = `setNav (id) {
                            const itemId = id || this.$route.query.id
                            const name = ${pageValue};
                            (this.complexMenuLesscode || []).forEach((menu) => {
                                const allMenus = [menu];
                                (menu.children || []).forEach((child) => {
                                    allMenus.push(...[child, ...(child.children || [])])
                                })
                                const tempItem = itemId ? allMenus.find((child) => (child.id === itemId)) : allMenus.find((child) => (child.${pageKey} === name))
                                if (tempItem) {
                                    this.curNav = tempItem
                                    this.leftMenuLesscode = menu.children || []
                                }
                            })
                        },`
                        break
                }

                if (['projectCode', 'vueCode'].includes(this.pageType)) {
                    methods += `signOut () {
                            auth.signOut()
                        },
                    `
                } else {
                    methods += `signOut () {
                        this.$bkMessage({ message: '${global.i18n.t('请部署后使用本功能')}', theme: 'warn' })
                    },
                `
                }

                methods += setNav
            }
            /* eslint-enable indent */

            // 远程数据源方法
            if (this.remoteDataStr) {
                methods += `
                    async initRemoteData () {
                        try {
                            ${this.remoteDataStr}
                        } catch (error) {
                            console.error(error)
                        }
                    },
                `
            }

            // 预览和查看源码，函数写在页面里面
            if (['vueCode', 'preview', 'previewSingle'].includes(this.pageType)) methods += this.methodStrList.map((func) => (func.funcStr)).join(',')

            methods += '},'
        }

        return methods
    }

    getFuncParamStr (method, params, errMessagePerfix, withThis, defaultFormat = 'value') {
        const displayParams = method?.funcParams?.map((paramKey, index) => {
            let param = {
                value: '',
                code: '',
                format: defaultFormat
            }
            if (params?.[index]) {
                param = params[index]
            }
            return param
        }) || []
    
        return displayParams
            ?.reduce((acc, cur, index) => {
                if (cur.format === 'value') {
                    acc.push(this.handleUsedVariable(cur.format, cur.value, errMessagePerfix) || '\'\'')
                } else if (withThis && cur.format === 'variable') {
                    acc.push(`this.${this.handleUsedVariable(cur.format, cur.code, errMessagePerfix)}`)
                } else if (cur.format === 'event') {
                    acc.push(`args[${index}]`)
                } else {
                    acc.push(this.handleUsedVariable(cur.format, cur.code, errMessagePerfix))
                }
                return acc
            }, [])
            .join(', ')
    }

    getLifeCycle () {
        const lifeCycle = typeof this.lifeCycle === 'string' ? JSON.parse(this.lifeCycle) : this.lifeCycle
        const lifeCycleKeys = Object.keys(lifeCycle) || []
        // 生成使用函数的对象
        const lifeCycleStrObj = {}
        lifeCycleKeys.forEach((key) => {
            const funcPayload = lifeCycle[key]
            const [method, params] = this.getMethodByCode(funcPayload)
            lifeCycleStrObj[key] = []
            if (method.id) {
                if (method.funcCode) this.addUsedFunc(method.funcCode)
                lifeCycleStrObj[key].push(`this.${method.funcName}(${this.getFuncParamStr(method, params, global.i18n.t('页面的【{{n}}】生命周期', { n: key }), true)})`)
            }
        })
        if (this.remoteDataStr) {
            if (!lifeCycleStrObj.created) lifeCycleStrObj.created = []
            if (!lifeCycleKeys.includes('created')) lifeCycleKeys.push('created')
            lifeCycleStrObj.created.push('this.initRemoteData()')
        }
        if (this.isPCLayout) {
            if (!lifeCycleStrObj.created) lifeCycleStrObj.created = []
            if (!lifeCycleKeys.includes('created')) lifeCycleKeys.push('created')
            lifeCycleStrObj.created.push('this.setNav()')
        }

        let lifeCycleStr = ''
        lifeCycleKeys.forEach((key) => {
            const curFuncStrList = lifeCycleStrObj[key] || []
            if (curFuncStrList.length > 0) lifeCycleStr += `${key} () {${curFuncStrList.join('\r\n')}},`
        })
        return lifeCycleStr
    }

    getComponents () {
        if (['preview', 'previewSingle'].includes(this.pageType)) return
        let componentStr = ''
        if (this.chartTypeArr && this.chartTypeArr.length) {
            componentStr += 'chart: ECharts,\n'
        }
        if (this.useBkCharts) {
            componentStr += 'bkCharts: bkCharts,\n'
        }
        if (['FORM', 'FLOW'].includes(this.nocodeType)) {
            componentStr += 'ProcessForm,\n'
        }
        if (['FORM_MANAGE', 'FLOW_MANAGE'].includes(this.nocodeType)) {
            componentStr += 'DataManage,\n'
        }
        if (this.isUseSwiper) {
            componentStr += 'Swiper,\n SwiperSlide\n'
        }
        if (!['preview', 'previewSingle'].includes(this.pageType) && this.usingCustomArr && this.usingCustomArr.length) {
            let customStr = ''
            // dev 和 t 环境，npm 包名字前面加了 test- 前缀，生成的变量名字应该去掉 test 前缀
            let forkUsingCustomArr = this.usingCustomArr
            if (process.env.BKPAAS_ENVIRONMENT !== 'prod') {
                forkUsingCustomArr = this.usingCustomArr.map(item => item.replace(/^test\-/, ''))
            }
            for (const i in this.usingCustomArr) {
                customStr += `${camelCase(forkUsingCustomArr[i], { transform: camelCaseTransformMerge })},\n`
            }
            componentStr += customStr
        }
        if (componentStr) {
            componentStr.endsWith(',\n') && componentStr.substr(0, componentStr.length - 2)
            componentStr = `components: {
                  ${componentStr}
              }`
        }
        return componentStr
    }

    getImportContent () {
        let importStr = ''

        // preview 模板preview(previewSingle)不需要引入，已经全局引入
        if (['preview', 'previewSingle'].includes(this.pageType)) return importStr

        if (this.isUseElementComponentLib) {
            importStr = `
                /**
                 * ${global.i18n.t('请先安装 {{0}} 组件库、{{1}} 复合组件库以及 {{2}} 组件库', ['bk-magic-vue', 'bkui-vue-complex', 'element-ui'])}
                 * bk-magic-vue ${global.i18n.t('组件库')}: https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/install
                 * bkui-vue-complex ${global.i18n.t('复合组件库')}: https://github.com/TencentBlueKing/lesscode-comp
                 * element-ui ${global.i18n.t('组件库')}: https://element.eleme.cn/#/zh-CN/component/installation
                 *
                 * ${global.i18n.t('如果页面使用了远程函数，单独使用本页面，需要确保项目 store 下有相应的方法，后端有相应的转发接口')}
                 */

                `
        } else {
            importStr = `
                /**
                 * ${global.i18n.t('请先安装 {{0}} 组件库、{{1}} 复合组件库', ['bk-magic-vue', 'bkui-vue-complex'])}}
                 * bk-magic-vue ${global.i18n.t('组件库')}: https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/install
                 * bkui-vue-complex ${global.i18n.t('复合组件库')}: https://github.com/TencentBlueKing/lesscode-comp
                 *
                 * ${global.i18n.t('如果页面使用了远程函数，单独使用本页面，需要确保项目 store 下有相应的方法，后端有相应的转发接口')}
                 */

                `
        }

        if (this.isUseSwiper) {
            importStr += `
                /**
                 * ${global.i18n.t('请先安装 Swiper 相关依赖')}: npm install swiper@5.2.0 vue-awesome-swiper@4.1.1
                 */
            `
            importStr += `
                import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
                import 'swiper/css/swiper.css'
                import * as swiperAni from '@/common/swiper.animate.min.js'
                import '@/css/animate.min.css'`
        }

        if (this.useBkCharts) {
            importStr += `
                /**
                 * ${global.i18n.t('请先安装 bk-charts 相关依赖')}: npm install @blueking/bkcharts
                 */
            `
            importStr += 'const bkCharts = require(\'@/components/bkCharts\')\n'
        }

        if (this.chartTypeArr && this.chartTypeArr.length) {
            importStr += `/**
                * ${global.i18n.t('请先安装 echarts 相关依赖')}: npm install echarts vue-echarts
                * ${global.i18n.t('更多使用请参考：')}https://github.com/ecomfe/vue-echarts#usage
                */
                const ECharts = require('vue-echarts/components/ECharts.vue')
                require('echarts/lib/component/tooltip')
                require('echarts/lib/component/title')
                require('echarts/lib/component/legend')
            `
            for (const i in this.chartTypeArr) {
                importStr += `require('echarts/lib/chart/${this.chartTypeArr[i]}')\n`
            }
        }
        if (['FORM', 'FLOW'].includes(this.nocodeType)) {
            importStr += 'import ProcessForm from \'@/components/flow-form-comp/process-form\'\n'
        }
        if (['FORM_MANAGE', 'FLOW_MANAGE'].includes(this.nocodeType)) {
            importStr += 'import DataManage from \'@/components/flow-form-comp/data-manage\'\n'
        }
        if (this.hasLayOut && ['projectCode', 'vueCode'].includes(this.pageType)) {
            if (this.pageType === 'vueCode') {
                importStr += `/**
                    * ${global.i18n.t('请在项目 store 里存入用户相关信息')}
                    * ${global.i18n.t('请在项目 common 里完善退出登陆相关方法')}
                    */
                `
            }
            importStr += 'import { mapGetters } from \'vuex\'\n'
            importStr += 'import auth from \'@/common/auth\'\n'
        }
        if (!['preview', 'previewSingle'].includes(this.pageType) && this.usingCustomArr && this.usingCustomArr.length) {
            // dev 和 t 环境，npm 包名字前面加了 test- 前缀，生成的变量名字应该去掉 test 前缀
            let forkUsingCustomArr = this.usingCustomArr
            if (process.env.BKPAAS_ENVIRONMENT !== 'prod') {
                forkUsingCustomArr = this.usingCustomArr.map(item => item.replace(/^test\-/, ''))
            }
            for (const i in this.usingCustomArr) {
                importStr += `const ${camelCase(forkUsingCustomArr[i], { transform: camelCaseTransformMerge })} = require('${this.npmConf.scopename}/${this.usingCustomArr[i]}')\n`
            }
        }
        const lifeCycle = typeof this.lifeCycle === 'string' ? JSON.parse(this.lifeCycle) : this.lifeCycle
        const lifeCycleValues = Object.values(lifeCycle)
        const exisLifyCycle = lifeCycleValues.filter(x => x)
        if (this.pageType === 'projectCode' && (this.usingFuncCodes.length > 0 || exisLifyCycle.length > 0)) {
            importStr += 'import methodsMixin from \'@/mixins/methods-mixin\'\n'
        }
        return importStr
    }

    dataTemplate (key, value) {
        this.dataStr += `'${key}': ${value},\n`
    }

    remoteMethodsTemplate (key, payload, chartType = false) {
        const [method, params] = this.getMethodByCode(payload)
        if (method.id) {
            if (chartType) {
                this.remoteDataStr += key.endsWith('options')
                    ? `const ${key}Remote = await this.${method.funcName}(${this.getFuncParamStr(method, params, global.i18n.t('远程函数【{{n}}】', { n: method.funcName }), true)})\nthis.$set(this, '${key}', ${key}Remote)\n`
                    : `const ${key}Remote = await this.${method.funcName}(${this.getFuncParamStr(method, params, global.i18n.t('远程函数【{{n}}】', { n: method.funcName }), true)})\nObject.assign(this.${key}, ${key}Remote)\n`
            } else {
                this.remoteDataStr += `this.${key} = await this.${method.funcName}(${this.getFuncParamStr(method, params, global.i18n.t('远程函数【{{n}}】', { n: method.funcName }), true)})\n`
            }
        }
        // 处理chartRemote
        if (method.funcCode) this.addUsedFunc(method.funcCode)
    }

    dataSourceTemplate (key, sourceData) {
        const hashId = uuid(4)
        this.remoteDataStr += `const ${key}Source${hashId} = await this.$http.get('/data-source/user/tableName/${sourceData.tableName}?bkDataSourceType=${sourceData.dataSourceType}')\nthis.${key} = ${key}Source${hashId}.data.list || []\n`
    }

    generateCharts (item) {
        const isECharts = !!item.name.startsWith('chart-')
        const type = isECharts ? item.name.replace('chart-', '') : item.name.replace('bk-charts-', '')
        /** echarts和bkchart目前覆盖方式不同，因此需要区别处理，之后优化echart可以统一处理 */
        this.dataTemplate(item.componentId, JSON.stringify(item.renderProps.options.code))
        if (item.renderProps.remoteOptions && item.renderProps.remoteOptions.payload && item.renderProps.remoteOptions.payload.methodCode) {
            this.remoteMethodsTemplate(isECharts ? item.componentId : `${item.componentId}options`, item.renderProps.remoteOptions.payload || {}, true)
        }
        /** eCharts相关图表需要引入对应的依赖 */
        if (this.chartTypeArr.indexOf(type) === -1 && isECharts) {
            this.chartTypeArr.push(type)
        }
    }

    generataNocodePage () {
        if (!this.nocodeType) return
        const { config = {}, fields = [], formIds = {}, serviceId = 0, tableName = '', formId = 0, flowDeployed = true, versionId = 0, content = '' } = this.nocodePayload
        const componentType = nocodeTypeComponentMap[this.nocodeType]
        let propsStr = `type="${this.nocodeType}"`
        const key = this.uniqueKey
        switch (this.nocodeType) {
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
                this.dataTemplate(`field${key}`, JSON.stringify(fields))
                propsStr += ` view-type="${this.pageType}" :fields="field${key}" table-name="${tableName || ''}" :form-id="${formId || 0}"`
                break
            case 'FLOW':
                this.dataTemplate(`field${key}`, JSON.stringify(fields))
                propsStr += ` view-type="${this.pageType}" :fields="field${key}" table-name="${tableName || ''}" :form-id="${formId || 0}" :service-id="${serviceId || 0}" :version-id="${versionId || 0}" :flow-deployed="${flowDeployed}"`
                break
            case 'FORM_MANAGE':
            case 'FLOW_MANAGE':
                this.dataTemplate(`config${key}`, JSON.stringify(config))
                this.dataTemplate(`formIds${key}`, typeof formIds === 'object' ? JSON.stringify(formIds) : formIds)
                propsStr += ` view-type="${this.pageType}" :config="config${key}" :form-ids="formIds${key}"  :service-id="${serviceId || 0}" :version-id="${versionId || 0}"`
                break
            default:
                break
        }
        return `
            <${componentType} ${propsStr} ></${componentType}>
        `
    }
}

module.exports = {
    getPageData (params) {
        const pageCode = new PageCode(params)
        return {
            code: pageCode.getCode(),
            methodStrList: pageCode.methodStrList || [],
            codeErrMessage: pageCode.codeErrMessage || ''
        }
    }
}
