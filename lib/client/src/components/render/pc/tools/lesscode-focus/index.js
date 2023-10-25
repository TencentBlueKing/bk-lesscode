import {
    reactive,
    toRefs,
    h
} from 'bk-lesscode-render'
import useComponentActive from '../hooks/use-component-active'
import useComponentHover from '../hooks/use-component-hover'
import useCheckFormEngine from '../lesscode-tool/hooks/use-check-form-engine'

const baseStyles = {
    position: 'absolute',
    zIndex: 100000001,
    borderWidth: '0px',
    borderColor: '#3a84ff',
    pointer: 'none'
}

const hideStyles = {
    display: 'none'
}

export default {
    setup () {
        const state = reactive({
            hoverTopStyles: {},
            hoverRightStyles: {},
            hoverBottomStyles: {},
            hoverLeftStyles: {},
            activeTopStyles: {},
            activeRightStyles: {},
            activeBottomStyles: {},
            activeLeftStyles: {},
            resizeStyles: {}
        })

        /**
         * @desc 鼠标hover状态
         * @param { Node } componentData
         */
        const showHover = (componentData = {}) => {
            if (!componentData.componentId
                || componentData === activeComponentData.componentId) {
                state.hoverTopStyles = hideStyles
                state.hoverRightStyles = hideStyles
                state.hoverBottomStyles = hideStyles
                state.hoverLeftStyles = hideStyles
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

            const borderColor = useCheckFormEngine(componentData.type) ? '#6c5ce8' : '#3a84ff'

            const hoverBaseStyle = Object.assign({}, baseStyles, {
                borderStyle: 'dashed'
            })
            
            state.hoverTopStyles = Object.assign({}, hoverBaseStyle, {
                top: `${top - containerTop}px`,
                left: `${left - containerLeft}px`,
                width: `${width}px`,
                borderBottomWidth: '1px',
                borderColor
            })
            state.hoverRightStyles = Object.assign({}, hoverBaseStyle, {
                top: `${top - containerTop}px`,
                left: `${left + width - 1 - containerLeft}px`,
                height: `${height}px`,
                borderLeftWidth: '1px',
                borderColor
            })
            state.hoverBottomStyles = Object.assign({}, hoverBaseStyle, {
                top: `${top + height - 1 - containerTop}px`,
                left: `${left - containerLeft}px`,
                width: `${width}px`,
                borderTopWidth: '1px',
                borderColor
            })
            state.hoverLeftStyles = Object.assign({}, hoverBaseStyle, {
                top: `${top - containerTop}px`,
                left: `${left - containerLeft}px`,
                height: `${height}px`,
                borderRightWidth: '1px',
                borderColor
            })
        }
        /**
         * @desc 选中状态
         * @param { Node } componentData
         */
        const showActive = (componentData = {}) => {
            if (!componentData.componentId) {
                state.activeTopStyles = hideStyles
                state.activeRightStyles = hideStyles
                state.activeBottomStyles = hideStyles
                state.activeLeftStyles = hideStyles
                return
            }
            if (componentData.componentId === hoverComponentData.value.componentId) {
                state.hoverTopStyles = hideStyles
                state.hoverRightStyles = hideStyles
                state.hoverBottomStyles = hideStyles
                state.hoverLeftStyles = hideStyles
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

            const borderColor = useCheckFormEngine(componentData.type) ? '#6c5ce8' : '#3a84ff'

            const activeBaseStyle = Object.assign({}, baseStyles, {
                borderStyle: 'solid'
            })
            
            state.activeTopStyles = Object.assign({}, activeBaseStyle, {
                top: `${top - containerTop}px`,
                left: `${left - containerLeft}px`,
                width: `${width}px`,
                borderBottomWidth: '1px',
                borderColor
            })
            state.activeRightStyles = Object.assign({}, activeBaseStyle, {
                top: `${top - containerTop}px`,
                left: `${left + width - 1 - containerLeft}px`,
                height: `${height}px`,
                borderLeftWidth: '1px',
                borderColor
            })
            state.activeBottomStyles = Object.assign({}, activeBaseStyle, {
                top: `${top + height - 1 - containerTop}px`,
                left: `${left - containerLeft}px`,
                width: `${width}px`,
                borderTopWidth: '1px',
                borderColor
            })
            state.activeLeftStyles = Object.assign({}, activeBaseStyle, {
                top: `${top - containerTop}px`,
                left: `${left - containerLeft}px`,
                height: `${height}px`,
                borderRightWidth: '1px',
                borderColor
            })
        }

        const { hoverComponentData } = useComponentHover(showHover)
        const { activeComponentData } = useComponentActive(showActive)

        return {
            ...toRefs(state)
        }
    },
    render (render) {
        h.init(render)

        const renderStyles = () => {
            return [
                {
                    role: 'hover',
                    styles: [
                        this.hoverTopStyles,
                        this.hoverRightStyles,
                        this.hoverBottomStyles,
                        this.hoverLeftStyles
                    ]
                },
                {
                    role: 'active',
                    styles: [
                        this.activeTopStyles,
                        this.activeRightStyles,
                        this.activeBottomStyles,
                        this.activeLeftStyles
                    ]
                }
            ].map((item) => {
                return h({
                    component: 'div',
                    attrs: {
                        role: item.role
                    },
                    children: item.styles.map(style => h({
                        component: 'div',
                        style
                    }))
                })
            })
        }

        return h({
            component: 'div',
            children: renderStyles()
        })
    }
}
