<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <section
        v-if="directiveList.length"
        class="directive-home">
        <h3 class="directive-tip">
            <bk-alert type="info" :title="$t('编辑函数时，可以使用 lesscode.指令值，必须通过编辑器自动补全功能选择对应属性指令值，来获取或者修改当前页面中配置了指令的组件属性值')"></bk-alert>
        </h3>
        <ul>
            <li
                v-for="(directive, index) in directiveList"
                :key="index"
                class="directive-item">
                <variable-select
                    :options="directive"
                    :value="lastDirectiveMap[genDirectiveKey(directive)]"
                    :readonly="isAttachToForm"
                    @change="value => handleVariableFormatChange(directive, value)">
                    <template v-slot:title>
                        <span
                            v-bk-tooltips="{
                                content: directive.tips && $t(directive.tips(lastDirectiveMap[genDirectiveKey(directive)])),
                                disabled: !directive.tips,
                                width: 290
                            }"
                            :class="{
                                'under-line': directive.tips,
                                'directive-label': true
                            }">
                            {{ getLabel(directive) }}
                            <span class="directive-tip">
                                {{ getTips(directive) }}
                            </span>
                        </span>
                    </template>
                    <bk-input
                        :value="lastDirectiveMap[genDirectiveKey(directive)].code"
                        @change="(val) => handleCodeChange(directive, val)"
                        clearable />
                </variable-select>
            </li>
        </ul>
    </section>
</template>

<script>
    import _ from 'lodash'
    import LC from '@/element-materials/core'
    import variableSelect from '@/components/variable/variable-select'

    const camelize = str => str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')

    const optionDirectives = [
        {
            type: 'v-if',
            prop: '',
            format: 'variable',
            formatInclude: ['variable', 'expression'], // v-if 支持配置（变量、表达式）
            code: '',
            valueTypeInclude: ['boolean'],
            renderValue: true,
            tips () {
                return window.i18n.t('基于数据的真假性，来控制是否【渲染】该组件（通过控制是否绘制 DOM 元素来工作）')
            }
        },
        {
            type: 'v-show',
            prop: '',
            format: 'variable',
            formatInclude: ['variable', 'expression'], // v-show 支持配置（变量、表达式）
            code: '',
            valueTypeInclude: ['boolean'],
            renderValue: true,
            tips () {
                return window.i18n.t('基于数据的真假性，来控制是否【显示】该组件（通过设置内联样式的 display CSS 属性来工作）')
            }
        }
    ]

    export default {
        name: 'modifier-directives',
        components: {
            variableSelect
        },
        data () {
            return {
                isAttachToForm: false,
                directiveList: [],
                lastDirectiveMap: {}
            }
        },
        created () {
            this.currentComponentNode = LC.getActiveNode()
            const {
                componentId,
                material,
                renderDirectives,
                renderProps
            } = this.currentComponentNode

            this.id = camelize(componentId)

            // 解析组件 directive 配置
            const propConfig = material.props || {}
            const directiveConfig = material.directives || []
            const directiveList = directiveConfig.reduce((result, directiveConfig) => {
                const {
                    type,
                    prop,
                    format,
                    code,
                    tips
                } = directiveConfig
                if (propConfig[prop]) {
                    let propConfigType = propConfig[directiveConfig.prop].type
                    // text类型也绑定string类型变量
                    if (propConfig[directiveConfig.prop].type === 'text') {
                        propConfigType = 'string'
                    }
                    if (typeof propConfig[directiveConfig.prop].type === 'function') {
                        propConfigType = propConfig[directiveConfig.prop].type(renderProps)
                    }
                    // 解析对应 prop 配置的值类型、默认值
                    const valueTypeInclude = Array.isArray(propConfigType) ? propConfigType : [propConfigType]
                    const renderValue = propConfig[directiveConfig.prop].val
                    if (type === 'v-bind') {
                        result.push({
                            type: 'v-bind',
                            prop,
                            format: format,
                            formatInclude: ['variable'], // v-bind 支持配置（变量）
                            code: code,
                            valueTypeInclude,
                            renderValue,
                            tips: tips
                        })
                    } else if (type === 'v-model') {
                        result.push({
                            type: 'v-model',
                            prop,
                            format: 'variable',
                            formatInclude: ['variable', 'expression'], // v-bind 支持配置（变量）
                            code: '',
                            valueTypeInclude,
                            renderValue,
                            tips () {
                                return window.i18n.t('双向绑定：该指令绑定变量后，通过输入改变组件的值会同步改变变量的值，该变量的值变化也会影响组件的值')
                            }
                        })
                    }
                }
                if (type === 'v-html' && prop === 'slots') {
                    result.push({
                        type: 'v-html',
                        prop,
                        format: 'value',
                        formatInclude: ['value', 'variable', 'expression'],
                        code: '',
                        tips: tips
                    })
                }
                if (type === 'v-bkloading') {
                    result.push({
                        type,
                        format: 'variable',
                        formatInclude: ['variable', 'expression'],
                        valueTypeInclude: ['boolean'],
                        code: '',
                        tips () {
                            return window.i18n.t('通过传入 boolean 数据，来控制是否展示 loading 效果')
                        }
                    })
                }
                return result
            }, [])

            // 公共 v-for
            directiveList.unshift(
                {
                    type: 'v-for',
                    prop: '',
                    format: 'variable',
                    formatInclude: ['value', 'variable', 'dataSource', 'expression'],
                    code: '',
                    valueTypeInclude: ['array'],
                    renderValue: 1,
                    tips: (dir) => {
                        return dir.code
                            ? window.i18n.t('可以使用以下规则给组件的属性或者指令赋值（当前组件的 v-if 和 v-show 指令不能使用）：')
                                + '<br>' + window.i18n.t('如果需要基于 v-for 指令的 index 给每个组件单独赋值，可以使用【{0}Index】为表达式赋值', [this.id])
                                + '<br>' + window.i18n.t('如果需要基于 v-for 指令的值给每个组件单独赋值。可以使用如下规则')
                                + '<br> 1. ' + window.i18n.t('当输入的值为数组、数字或者对象时，请使用【{0}Item】为表达式赋值', [this.id])
                                + '<br> 2. ' + window.i18n.t('当输入的值为数组且数组子项为对象时，请使用【{0}Item.对象key】为表达式赋值', [this.id])
                                + '<br> 3. ' + window.i18n.t('当输入的值为数据表时，请使用【{0}Item.表字段名】为表达式赋值', [this.id])
                            : window.i18n.t('可以使用 v-for 指令，渲染多个组件')
                    }
                }
            )
            // 公共 v-bk-tooltips
            directiveList.push(
                {
                    type: 'v-bk-tooltips',
                    format: 'value',
                    formatInclude: ['value', 'variable', 'expression'],
                    valueTypeInclude: ['string'],
                    code: '',
                    tips () {
                        return window.i18n.t('当鼠标指向页面元素时给出简单的提示，需传入提示的字符串')
                    }
                }
            )
            
            // 目前bk-dialog与bk-sidesslider不支持v-if和v-show
            if (![
                'bk-dialog',
                'bk-sideslider'
            ].includes(this.currentComponentNode.type)) {
                directiveList.push(...optionDirectives)
            }
            this.directiveList = Object.freeze(directiveList)

            // directives 默认配置解析
            const lastDirectiveMap = directiveList.reduce((result, directive) => {
                const {
                    type,
                    prop,
                    format,
                    code,
                    renderValue
                } = directive
                result[this.genDirectiveKey(directive)] = {
                    type,
                    prop,
                    format,
                    code,
                    renderValue
                }
                return result
            }, {})

            // 同步用户配置
            renderDirectives.forEach((directive) => {
                const directiveKey = this.genDirectiveKey(directive)
                if (lastDirectiveMap[directiveKey]) {
                    // fix: 错误数据格式转换，表达式类型的 format 保存成了 value
                    const isFixedExpressionFormat = directive.format === 'value'
                        && /[^\.\=><]+[\.\=><\']+[^\.\=><\']+/.test(directive.code)
                    Object.assign(lastDirectiveMap[directiveKey], {
                        format: isFixedExpressionFormat ? 'expression' : directive.format,
                        code: directive.code
                    })
                }
            })
            this.lastDirectiveMap = Object.freeze(lastDirectiveMap)
            
            this.checkAttachToFrom()
        },
        methods: {
            genDirectiveKey (directive) {
                return `${directive.type}${directive.prop ? ':' + directive.prop : ''}`
            },
            /**
             * @desc 检测是否是 widget-form 的子节点
             */
            checkAttachToFrom () {
                this.isAttachToForm = false
                let parentNode = this.currentComponentNode.parentNode
                while (parentNode) {
                    if (parentNode.type === 'widget-form') {
                        this.isAttachToForm = true
                    }
                    parentNode = parentNode.parentNode
                }
            },
            /**
             * @desc directive 显示 label
             * @param { Boolean } Object
             * @returns { String }
             */
            getLabel (directive) {
                const {
                    type,
                    modifiers = [],
                    prop = ''
                } = directive
                let res = ''
                switch (type) {
                    case 'v-model':
                    case 'v-html':
                    case 'v-for':
                        res = type
                        break
                    default:
                        const modifierStr = (modifiers || []).map((modifier) => `.${modifier}`).join('')
                        res = `${type}${prop ? `:${prop}` : ''}${modifierStr}`
                        break
                }
                return res
            },
            /**
             * 获取指令提示
             */
            getTips (directive) {
                const {
                    type
                } = directive
                let res = ''
                switch (type) {
                    case 'v-for':
                        const lastDirective = this.lastDirectiveMap[this.genDirectiveKey(directive)]
                        res = lastDirective.code ? `（${this.id}Item, ${this.id}Index）` : ''
                        break
                    default:
                        res = ''
                        break
                }
                return res
            },
            /**
             * @desc format 切换（值、变量、表达式）
             * @param { Object } directive
             * @param { Object } variableSelectData
             */
            handleVariableFormatChange (directive, variableSelectData) {
                const {
                    format,
                    renderValue,
                    code,
                    dataSourceType,
                    thirdPartDBName
                } = variableSelectData

                const directiveKey = this.genDirectiveKey(directive)

                this.lastDirectiveMap = Object.freeze({
                    ...this.lastDirectiveMap,
                    [directiveKey]: {
                        type: directive.type,
                        prop: directive.prop,
                        format,
                        code,
                        renderValue,
                        dataSourceType,
                        thirdPartDBName
                    }
                })
                this.triggleUpdate()
            },

            /**
             * @desc format = value 时 code 改变
             * @param { Object } directive
             * @param { String } value
             */
            handleCodeChange (directive, value) {
                const directiveKey = this.genDirectiveKey(directive)
                this.lastDirectiveMap = Object.freeze({
                    ...this.lastDirectiveMap,
                    [directiveKey]: {
                        ...this.lastDirectiveMap[directiveKey],
                        code: value,
                        renderValue: value
                    }
                })
                this.triggleUpdate()
            },

            triggleUpdate: _.throttle(function () {
                this.currentComponentNode.setRenderDirectives(Object.values(this.lastDirectiveMap))
            }, 60)
        }
    }
</script>

<style lang='postcss' scoped>
    .directive-home {
        margin: 0 10px;
    }
    .directive-item {
        /deep/ .header {
            height: 40px;
            font-size: 12px;
            font-weight: bold;
            color: #313238;
        }
        &.bk-form-item {
            margin: 0 !important;
        }
    }
    .directive-tip {
        margin: 10px 0 0;
        padding: 0;
        font-size: 12px;
        font-weight: normal;
    }
    
    .directive-label {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        line-height: 20px;
        max-width: calc(100% - 80px);
    }
    .under-line {
        border-bottom: 1px dashed #979ba5;
        cursor: pointer;
    }
</style>
