import cssModule from './index.postcss?module'
import {
    ref,
    reactive,
    toRefs,
    h,
    toolTips
} from 'bk-lesscode-render'
import useComponentActive from '../hooks/use-component-active'
import useShowMenu from '../hooks/use-show-menu'
import useResize from './hooks/use-resize'
import useAutoHeight from './hooks/use-auto-height'
import useFullWidth from './hooks/use-full-width'
import useAutoWidth from './hooks/use-auto-width'
import { isFreeLayoutProperty } from '@/element-materials/core/helper/utils.js'

const baseStyles = {
    position: 'absolute',
    zIndex: 100000002
}

const hideStyles = {
    display: 'none'
}

const halfDotSize = 8
const actionBtnSize = 24
const actionBtnOffset = 8

export default {
    setup () {
        const state = reactive({
            dotWidthStyles: hideStyles,
            dotHeightStyles: hideStyles,
            dotBothStyles: hideStyles,
            fullWidthStyles: hideStyles,
            autoHeightStyles: hideStyles
        })

        const resizeRef = ref()
        const tipRef = ref()

        /**
         * @desc 选中状态
         * @param { Node } componentData
         */
        const showActive = (componentData = {}) => {
            state.dotWidthStyles = hideStyles
            state.dotHeightStyles = hideStyles
            state.dotBothStyles = hideStyles
            state.fullWidthStyles = hideStyles
            state.autoHeightStyles = hideStyles
            if (!componentData.componentId) {
                return
            }

            // 解析styles配置，是否支持width、height配置
            const styleConfig = componentData.material.styles || []
            // 如果是图表类型，也需要支持拖拽大小
            const isChartType = componentData?.type === 'chart' || componentData?.type === 'bk-charts'
            let resizeWidthEnabel = false
            let resizeHeightEnable = false
            if (isChartType) {
                resizeWidthEnabel = true
                resizeHeightEnable = true
            } else {
                styleConfig.forEach(styleItem => {
                    if (styleItem === 'size') {
                        resizeWidthEnabel = true
                        resizeHeightEnable = true
                        return
                    }
                    if (styleItem.name === 'size') {
                        if (styleItem.include) {
                            resizeWidthEnabel = styleItem.include.includes('width')
                            resizeHeightEnable = styleItem.include.includes('height')
                        }
                        if (styleItem.exclude) {
                            resizeWidthEnabel = !styleItem.exclude.includes('width')
                            resizeHeightEnable = !styleItem.exclude.includes('height')
                        }
                    }
                })
            }

            const {
                top: containerTop,
                left: containerLeft,
                right: containerRight
            } = document.body.querySelector('#drawTarget').getBoundingClientRect()
            const {
                top,
                left,
                right,
                width,
                height
            } = componentData.$elm.getBoundingClientRect()

            const dotBaseStyle = Object.assign({}, baseStyles)

            if (resizeWidthEnabel) {
                state.dotWidthStyles = Object.assign({}, dotBaseStyle, {
                    top: `${top - containerTop + height / 2 - halfDotSize}px`,
                    left: `${right - halfDotSize - containerLeft}px`,
                    cursor: 'col-resize'
                })
                // 图表类型不需要显示
                if (!isChartType) {
                    // 100% 宽度按钮的位置
                    let fullWidthBtnLeft = right - containerLeft + actionBtnOffset
                    if (right + 20 >= containerRight) {
                        fullWidthBtnLeft = right - containerLeft - (actionBtnSize + actionBtnOffset)
                    }
                    state.fullWidthStyles = Object.assign({}, dotBaseStyle, {
                        top: `${top - containerTop + height / 2 - actionBtnSize / 2}px`,
                        left: `${fullWidthBtnLeft}px`
                    })
                }
            }
            if (resizeHeightEnable) {
                state.dotHeightStyles = Object.assign({}, dotBaseStyle, {
                    top: `${top + height - halfDotSize - containerTop}px`,
                    left: `${left - containerLeft + width / 2 - halfDotSize}px`,
                    cursor: 'row-resize'
                })
                // 高度自适应的按钮
                // free-layout 不支持该功能，必须给定 height、 图表类型也不需要
                if (!isFreeLayoutProperty(componentData.type) && !isChartType) {
                    state.autoHeightStyles = Object.assign({}, dotBaseStyle, {
                        top: `${top + height - containerTop + actionBtnOffset}px`,
                        left: `${left - containerLeft + width / 2 - actionBtnSize / 2}px`
                    })
                }
            }

            if (resizeWidthEnabel && resizeHeightEnable) {
                state.dotBothStyles = Object.assign({}, dotBaseStyle, {
                    top: `${top - containerTop + height - halfDotSize}px`,
                    left: `${left - containerLeft + width - halfDotSize}px`,
                    cursor: 'nwse-resize'
                })
            }
        }

        const { activeComponentData } = useComponentActive(showActive)

        const {
            size,
            tipStyles,
            handleResizeWidth,
            handleResizeHeight,
            handleResizeBoth
        } = useResize()

        // 显示快捷面板
        const handleShowMenu = useShowMenu()

        const handleAutoHeight = useAutoHeight()

        const handleFullWidth = useFullWidth()

        const handleAutoWidth = useAutoWidth()

        return {
            ...toRefs(state),
            size,
            tipStyles,
            activeComponentData,
            resizeRef,
            tipRef,
            handleResizeWidth,
            handleResizeHeight,
            handleResizeBoth,
            handleShowMenu,
            handleAutoHeight,
            handleFullWidth,
            handleAutoWidth
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderAchors = () => {
            return [
                { style: self.dotWidthStyles, handler: self.handleResizeWidth },
                { style: self.dotHeightStyles, handler: self.handleResizeHeight },
                { style: self.dotBothStyles, handler: self.handleResizeBoth }
            ].map(item => {
                return h({
                    component: 'div',
                    class: cssModule['achor'],
                    style: item.style,
                    on: {
                        mousedown: item.handler
                    }
                })
            })
        }

        const renedrTipRef = () => {
            return h({
                component: 'div',
                ref: 'tipRef',
                style: self.tipStyles,
                children: [
                    `${self.size.width} x ${self.size.height}`
                ]
            })
        }

        const renderModifyWidth = () => {
            return h({
                component: 'div',
                class: cssModule['width-actions'],
                style: self.fullWidthStyles,
                children: [
                    h({
                        component: 'div',
                        class: [cssModule['btn'], cssModule['auto-width']],
                        directives: [{
                            name: toolTips,
                            value: {
                                content: '宽度随内容自适应',
                                placement: 'right'
                            }
                        }],
                        on: {
                            click: self.handleAutoWidth
                        },
                        children: [
                            h({
                                component: 'i',
                                class: 'bk-drag-icon bk-drag-xiangxiazishiying'
                            })
                        ]
                    }),
                    h({
                        component: 'div',
                        class: cssModule['btn'],
                        directives: [{
                            name: toolTips,
                            value: {
                                content: '宽度撑满',
                                placement: 'right'
                            }
                        }],
                        on: {
                            click: self.handleFullWidth
                        },
                        children: [
                            h({
                                component: 'i',
                                class: 'bk-drag-icon bk-drag-zuoyouchengkai'
                            })
                        ]
                    })
                ]
            })
        }

        const renderModifyHeight = () => {
            return h({
                component: 'div',
                class: cssModule['btn'],
                style: self.autoHeightStyles,
                directives: [{
                    name: toolTips,
                    value: {
                        content: '高度随内容自适应',
                        placement: 'bottom'
                    }
                }],
                on: {
                    click: self.handleAutoHeight
                },
                children: [
                    h({
                        component: 'i',
                        class: 'bk-drag-icon bk-drag-xiangxiazishiying'
                    })
                ]
            })
        }

        return h({
            component: 'div',
            ref: 'resizeRef',
            on: {
                click (event) {
                    event.stopPropagation()
                },
                contextmenu: self.handleShowMenu
            },
            children: [
                ...renderAchors(),
                renedrTipRef(),
                renderModifyWidth(),
                renderModifyHeight()
            ]
        })
    }
}
