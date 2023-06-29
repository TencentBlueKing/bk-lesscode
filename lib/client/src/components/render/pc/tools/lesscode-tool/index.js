import cssModule from './index.postcss?module'
import store from '@/store'
import {
    reactive,
    toRefs,
    ref,
    onMounted,
    h,
    toolTips
} from 'bk-lesscode-render'
import useActiveParent from './hooks/use-active-parent'
import useSaveTemplate from './hooks/use-save-template'
import useCopyPaste from './hooks/use-copy-paste'
import useRemove from './hooks/use-remove'
import useShowMenu from '../hooks/use-show-menu'
import useComponentActive from '../hooks/use-component-active'
import useComponentHover from '../hooks/use-component-hover'
import useSlot from './hooks/use-slot'
import _ from 'lodash'
import { miniLimited } from 'shared/util.js'
import LC from '@/element-materials/core'

const hideStyles = {
    display: 'none'
}

const activeZIndex = 100000000
const hoverZIndex = 100000001

const toolPositionHeight = 22

export default {
    setup () {
        const platform = store.getters['page/platform']

        const toolContainer = platform === 'MOBILE' ? '#mobileDrawContent' : '#drawTarget'

        const state = reactive({
            hoverStyles: hideStyles,
            activeStyles: hideStyles
        })

        const initStyle = reactive({
            activeScrollTop: 0,
            activeTop: 0,
            hoverTop: 0,
            hoverScrollTop: 0
        })

        const minimalTop = 7.5

        const hoverRef = ref()
        const activeRef = ref()
        const componentToolRef = ref()

        // 选中父级容器组件
        const handleSelectParent = useActiveParent()
        // 复制粘贴
        const handleCopyPaste = useCopyPaste()
        // 保存模板
        const handleSaveTemplate = useSaveTemplate()
        // 删除组件
        const handleRemove = useRemove()
        // 显示快捷面板
        const handleShowMenu = useShowMenu()
        // 编辑slot文字
        useSlot()

        const scrollHandleGenerator = (type) => {
            return _.throttle(() => {
                const keyMap = type === 'active' ? ['activeTop', 'activeScrollTop', 'activeStyles'] : ['hoverTop', 'hoverScrollTop', 'hoverStyles']
                const container = document.body.querySelector('.bk-lesscode-mobile-layout-wrapper')
                const calculateActiveTop = `${parseInt(initStyle[keyMap[0]]) - (container.scrollTop - initStyle[keyMap[1]])}px`
                state[keyMap[2]].top = miniLimited(calculateActiveTop, minimalTop) + 'px'
            }, 50)
        }

        const getFixStyle = (componentData) => {
            return componentData.isInteractiveComponent
                ? {
                    top: '-20px',
                    left: '-20px'
                }
                : {}
        }
        
        // 移动端页面滚动，需要动态调整标签位置
        const mobileScrollHandler = scrollHandleGenerator('active')

        const mobileHoverScrollHandler = scrollHandleGenerator('hover')

        /**
         * @desc acitve状态
         * @param { Node } componentData
         */
        const { activeComponentData } = useComponentActive((componentData) => {
            const mobileContainer = document.body.querySelector('.bk-lesscode-mobile-layout-wrapper')
            if (!componentData || !componentData.componentId) {
                state.activeStyles = hideStyles
                mobileContainer?.removeEventListener('scroll', mobileScrollHandler)
                return
            }
            if (componentData === hoverComponentData.value) {
                state.hoverStyles = hideStyles
            }
            const {
                top: containerTop,
                right: containerRight,
                left: containerLeft
            } = document.body.querySelector(toolContainer).getBoundingClientRect()

            const {
                top,
                left,
                right
            } = componentData.$elm.getBoundingClientRect()

            const {
                width: toolsWidth
            } = activeRef.value.getBoundingClientRect()

            let realLeft = left - containerLeft
            if (left + toolsWidth > containerRight) {
                realLeft = right - toolsWidth - containerLeft
            }
            state.activeStyles = {
                position: 'absolute',
                top: `${top - containerTop - toolPositionHeight}px`,
                left: `${realLeft}px`,
                zIndex: activeZIndex,
                ...getFixStyle(componentData)
            }

            initStyle.activeTop = state.activeStyles.top
            initStyle.activeScrollTop = mobileContainer?.scrollTop

            mobileContainer?.addEventListener('scroll', mobileScrollHandler)
        })

        /**
         * @desc hover状态
         * @param { Node } componentData
         */
        const { hoverComponentData } = useComponentHover((componentData) => {
            const mobileContainer = document.body.querySelector('.bk-lesscode-mobile-layout-wrapper')
            if (!componentData
                || !componentData.componentId
                || componentData === activeComponentData.value) {
                state.hoverStyles = hideStyles
                mobileContainer?.removeEventListener('scroll', mobileHoverScrollHandler)
                return
            }

            const {
                top: containerTop,
                left: containerLeft
            } = document.body.querySelector(toolContainer).getBoundingClientRect()
            const {
                top,
                left
            } = componentData.$elm.getBoundingClientRect()
            
            state.hoverStyles = {
                position: 'absolute',
                top: `${top - containerTop - toolPositionHeight}px`,
                left: `${left - containerLeft}px`,
                zIndex: hoverZIndex,
                ...getFixStyle(componentData)
            }

            initStyle.hoverTop = state.hoverStyles.top
            initStyle.hoverScrollTop = mobileContainer?.scrollTop

            mobileContainer?.addEventListener('scroll', mobileHoverScrollHandler)
        })
        /**
         * @desc 鼠标hover点击状态
         */
        const handlerHoverClick = (event) => {
            event.stopPropagation()
            LC.clearMenu()
            hoverComponentData.value.active()
        }

        /** transfer dom 防止移动端overflow: hidden导致的无法显示问题 */
        onMounted(() => {
            const wrapper = document.querySelector(toolContainer)
            wrapper.append(componentToolRef.value)
        })
        
        return {
            ...toRefs(state),
            initStyle,
            hoverComponentData,
            activeComponentData,
            hoverRef,
            activeRef,
            componentToolRef,
            handleSaveTemplate,
            handleSelectParent,
            handleCopyPaste,
            handleRemove,
            handleShowMenu,
            handlerHoverClick
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderHover = () => {
            return h({
                component: 'div',
                class: cssModule['tools-hover'],
                style: self.hoverStyles,
                children: [
                    h({
                        component: 'div',
                        class: cssModule['button'],
                        on: {
                            click: self.handlerHoverClick
                        },
                        children: [
                            self.hoverComponentData.componentId
                        ]
                    })
                ]
            })
        }

        const renderActive = () => {
            const renderComponentId = () => {
                if (!self.activeComponentData.componentId) return ''

                return h({
                    component: 'span',
                    class: [cssModule['button'], cssModule['comp-id-button']],
                    directives: [{
                        name: toolTips,
                        value: {
                            content: self.activeComponentData.componentId,
                            placement: 'top-start'
                        }
                    }],
                    children: [
                        h({
                            component: 'i',
                            class: [
                                'bk-drag-icon',
                                self.activeComponentData.material.icon
                            ]
                        }),
                        self.activeComponentData.componentId
                    ]
                })
            }

            const renderTools = () => {
                const tools = [
                    {
                        handler: self.handleSaveTemplate,
                        icon: 'bk-drag-icon bk-drag-templateline',
                        tips: self.$t('存为模板'),
                        condition: true
                    },
                    {
                        handler: self.handleSelectParent,
                        icon: 'bk-drag-icon bk-drag-xuanzhongfuji',
                        tips: self.$t('选中父级'),
                        condition: !self.activeComponentData?.parentNode?.root
                    },
                    {
                        handler: self.handleCopyPaste,
                        icon: 'bk-drag-icon bk-drag-copy',
                        tips: self.$t('复制并粘贴到当前元素后面'),
                        condition: self.activeComponentData.componentId && !self.activeComponentData.isInteractiveComponent
                    },
                    {
                        handler: self.handleRemove,
                        icon: 'bk-drag-icon bk-drag-delet',
                        tips: self.$t('删除'),
                        condition: true
                    }
                ]
                return tools.map((tool) => {
                    if (!tool.condition) return ''

                    return h({
                        component: 'div',
                        class: cssModule['button'],
                        on: {
                            click: tool.handler
                        },
                        children: [
                            h({
                                component: 'i',
                                class: tool.icon,
                                directives: [{
                                    name: toolTips,
                                    value: {
                                        content: tool.tips,
                                        placement: 'top-start'
                                    }
                                }]
                            })
                        ]
                    })
                })
            }

            return h({
                component: 'div',
                ref: 'activeRef',
                class: cssModule['tools-active'],
                style: self.activeStyles,
                on: {
                    click (event) {
                        event.stopPropagation()
                    },
                    contextmenu: self.handleShowMenu
                },
                children: [
                    renderComponentId(),
                    ...renderTools()
                ]
            })
        }

        return h({
            component: 'div',
            ref: 'componentToolRef',
            children: [
                renderHover(),
                renderActive()
            ]
        })
    }
}
