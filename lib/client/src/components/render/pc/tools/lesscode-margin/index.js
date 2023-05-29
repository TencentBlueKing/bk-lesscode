import cssModule from './index.postcss?module'
import {
    reactive,
    toRefs,
    h
} from 'bk-lesscode-render'
import useComponentActive from '../hooks/use-component-active'
import useMargin from './hooks/use-margin'
import { isFreeLayoutProperty } from '@/element-materials/core/helper/utils.js'

const baseStyles = {
    position: 'absolute',
    zIndex: 100000002
}

const hideStyles = {
    display: 'none'
}

const halfBtnSize = 8

export default {
    setup () {
        const state = reactive({
            btnTopStyles: hideStyles,
            btnLeftStyles: hideStyles
        })

        const { activeComponentData } = useComponentActive((componentData = {}) => {
            state.btnTopStyles = hideStyles
            state.btnLeftStyles = hideStyles
            if (!componentData.componentId
                || isFreeLayoutProperty(componentData.parentNode.type)) {
                return
            }
            const {
                top: containerTop,
                left: containerLeft
            } = document.body.querySelector('#drawTarget').getBoundingClientRect()
            const {
                top,
                left,
                width,
                height
            } = componentData.$elm.getBoundingClientRect()

            const btnBaseStyle = Object.assign({}, baseStyles)

            state.btnTopStyles = Object.assign({}, btnBaseStyle, {
                top: `${top - containerTop - halfBtnSize}px`,
                left: `${left - containerLeft + width / 2 - halfBtnSize}px`,
                cursor: 'ns-resize'
            })
            state.btnLeftStyles = Object.assign({}, btnBaseStyle, {
                top: `${top - containerTop + height / 2 - halfBtnSize}px`,
                left: `${left - containerLeft - halfBtnSize}px`,
                cursor: 'ew-resize'
            })
        })

        const {
            margin,
            tipTopStyles,
            tipLeftStyles,
            handleMarginTop,
            handleMarginLeft
        } = useMargin()

        return {
            ...toRefs(state),
            margin,
            activeComponentData,
            tipTopStyles,
            tipLeftStyles,
            handleMarginTop,
            handleMarginLeft
        }
    },

    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            on: {
                click (event) {
                    event.stopPropagation()
                }
            },
            children: [
                h({
                    component: 'div',
                    class: cssModule['achor-top'],
                    style: self.btnTopStyles,
                    on: {
                        mousedown: self.handleMarginTop
                    },
                    children: [
                        h({
                            component: 'i',
                            class: 'bk-drag-icon bk-drag-zuoyouchengkai'
                        }),
                        h({
                            component: 'div',
                            class: cssModule['tip-top'],
                            style: self.tipTopStyles,
                            children: [
                                self.margin.top
                            ]
                        })
                    ]
                }),
                h({
                    component: 'div',
                    class: cssModule['achor-left'],
                    style: self.btnLeftStyles,
                    on: {
                        mousedown: self.handleMarginLeft
                    },
                    children: [
                        h({
                            component: 'i',
                            class: 'bk-drag-icon bk-drag-zuoyouchengkai'
                        }),
                        h({
                            component: 'div',
                            class: cssModule['tip-left'],
                            style: self.tipLeftStyles,
                            children: [
                                self.margin.left
                            ]
                        })
                    ]
                })
            ]
        })
    }
}
