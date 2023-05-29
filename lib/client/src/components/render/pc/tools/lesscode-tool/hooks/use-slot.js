import Vue from 'vue'
import {
    ref,
    getCurrentInstance,
    onBeforeUnmount
} from 'bk-lesscode-render'
import _ from 'lodash'
import LC from '@/element-materials/core'
import { messageWarn } from '@/common/bkmagic'

const baseStyles = {
    position: 'absolute',
    zIndex: 100000002
}

const getSlotInhertStyles = (text, $el) => {
    const styles = {}
    let paddingTop = 0
    let paddingRight = 0
    let paddingBottom = 0
    let paddingLeft = 0
    let backgroundColor = '#fff'
    const search = elNode => {
        if (!elNode || elNode.textContent !== text) {
            return
        }
        const {
            paddingTop: cPaddingTop,
            paddingRight: cPaddingRight,
            paddingBottom: cPaddingBottom,
            paddingLeft: cPaddingLeft,
            backgroundColor: cBackgroundColor
        } = document.defaultView.getComputedStyle(elNode)

        if (cBackgroundColor !== 'rgba(0, 0, 0, 0)') {
            backgroundColor = cBackgroundColor
        }

        paddingTop += parseInt(cPaddingTop, 10)
        paddingRight += parseInt(cPaddingRight, 10)
        paddingBottom += parseInt(cPaddingBottom, 10)
        paddingLeft += parseInt(cPaddingLeft, 10)

        if (elNode.innerHTML === text) {
            const {
                font,
                fontWeight,
                color,
                textAlign,
                whiteSpace,
                wordBreak
            } = document.defaultView.getComputedStyle(elNode)
            Object.assign(styles, {
                font,
                fontWeight,
                color,
                textAlign,
                whiteSpace,
                wordBreak
            })
            return
        }
        
        elNode.children.forEach(childrenNode => search(childrenNode))
    }
    search($el)
    return Object.assign({}, styles, {
        paddingTop: `${paddingTop}px`,
        paddingRight: `${paddingRight}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        backgroundColor
    })
}

const getContainer = () => document.body.querySelector('#drawTarget')

export default function () {
    const { proxy } = getCurrentInstance()

    const slotUpdateKey = ref(Math.random())

    const computedState = () => {
        const state = {
            show: false,
            disabled: true,
            tips: '',
            key: slotUpdateKey.value
        }
        if (!proxy.activeComponentData || !proxy.activeComponentData.material) {
            return state
        }
        const slotConfig = proxy.activeComponentData.material.slots
        if (slotConfig
            && slotConfig.default
            && slotConfig.default.type) {
            state.show = slotConfig.default.type.includes('text') || slotConfig.default.type.includes('textarea')
            state.tips = proxy.$t('编辑文字')

            // slot default format 配置成 variable 或者 expression 不支持编辑
            const slotDefault = proxy.activeComponentData.slot.default
            state.disabled = ['variable', 'expression'].includes(slotDefault.format)
            if (slotDefault.format === 'variable') {
                state.tips = proxy.$t('文字来源于变量不支持编辑')
            } else if (slotDefault.format === 'expression') {
                state.tips = proxy.$t('文字来源于表达式不支持编辑')
            }
        }
        
        return state
    }
    
    const handleEdit = () => {
        const disabledEditComponents = ['divider']
        const activeComponent = LC.getActiveNode()
        if (disabledEditComponents.includes(activeComponent.name)) return // 部分组件不支持画布内编辑

        const state = computedState()
        if (!state.show) {
            return
        }
        if (state.disabled && state.tips) {
            messageWarn(state.tips)
            return
        }
        document.body.click()
        const $container = getContainer()
        const slotConfig = proxy.activeComponentData.material.slots
        const slotCode = proxy.activeComponentData.slot.default.code

        let vm = null
        const wrapperStyles = {
            display: 'none'
        }
        const inputStyles = {}

        const calcPosition = () => {
            const {
                top: containerTop,
                left: containerLeft
            } = $container.getBoundingClientRect()
            setTimeout(() => {
                const {
                    top,
                    left,
                    width,
                    height
                } = proxy.activeComponentData.$elm.getBoundingClientRect()
           
                Object.assign(wrapperStyles, baseStyles, {
                    display: 'block',
                    top: `${top - containerTop}px`,
                    left: `${left - containerLeft}px`,
                    width: `${width}px`,
                    height: `${height}px`
                })

                Object.assign(inputStyles,
                    {
                        width: '100%',
                        height: '100%',
                        border: '1px solid #3A84FF',
                        borderRadius: '2px'
                    },
                    getSlotInhertStyles(vm.value, proxy.activeComponentData.$elm))
                
                vm && vm.$forceUpdate()
            })
        }

        const isTextarea = slotConfig.default.type.includes('textarea')

        calcPosition()
        
        vm = new Vue({
            data () {
                return {
                    value: slotCode,
                    wrapperStyles,
                    inputStyles
                }
            },
            mounted () {
                setTimeout(() => {
                    this.$refs.input.focus()
                })
                LC.addEventListener('update', calcPosition)
            },
            beforeDestroy () {
                LC.removeEventListener('update', calcPosition)
            },
            methods: {
                handleInputChange: _.throttle(function (event) {
                    const value = event.target.value
                    proxy.activeComponentData.setSlot('default', LC.utils.genSlotFormatValue({
                        code: value,
                        component: 'text',
                        format: 'value',
                        renderValue: value,
                        valueType: 'text'
                    }))
                    this.value = value
                }, 100),
                handleTextareaChange: _.throttle(function (event) {
                    const value = event.target.value
                    proxy.activeComponentData.setSlot('default', LC.utils.genSlotFormatValue({
                        code: value,
                        component: 'text',
                        format: 'value',
                        payload: {},
                        renderValue: value,
                        valueType: 'textarea'
                    }))
                    this.value = value
                }, 100),
                handleBlur () {
                    if (vm.$el.parentNode === $container) {
                        vm.$el.parentNode.removeChild(vm.$el)
                    }
                    
                    vm.$destroy()
                }
            },
            render () {
                const renderInput = () => {
                    if (isTextarea) {
                        return (
                            <textarea
                                ref="input"
                                value={this.value}
                                style={this.inputStyles}
                                spellcheck={false}
                                resizeable={false}
                                onBlur={this.handleBlur}
                                onInput={this.handleTextareaChange} />
                        )
                    }
                    return (
                        <input
                            ref="input"
                            value={this.value}
                            style={this.inputStyles}
                            spellcheck={false}
                            onBlur={this.handleBlur}
                            onInput={this.handleInputChange} />
                    )
                }
                return (
                    <div style={this.wrapperStyles}>
                        {renderInput()}
                    </div>
                )
            }
        })
        vm.$mount()
        $container.appendChild(vm.$el)
    }

    LC.addEventListener('componentDbclick', handleEdit)
    onBeforeUnmount(() => {
        LC.removeEventListener('componentDbclick', handleEdit)
    })
}
