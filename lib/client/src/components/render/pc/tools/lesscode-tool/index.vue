<template>
    <div ref="componentToolRef">
        <div
            ref="hoverRef"
            :class="$style['tools-hover']"
            :style="hoverStyles">
            <div :class="$style['button']">
                {{ hoverComponentData.componentId }}
            </div>
        </div>
        <div
            ref="activeRef"
            :class="$style['tools-active']"
            :style="activeStyles"
            @click.stop=""
            @contextmenu.stop="handleShowMenu">
            <div
                v-if="activeComponentData.componentId"
                v-bk-tooltips.top-start="activeComponentData.componentId"
                :class="[$style['button'], $style['comp-id-button']]">
                <i class="bk-drag-icon" :class="activeComponentData.material.icon" />
                {{ activeComponentData.componentId }}
            </div>
            <div
                :class="$style['button']"
                @click="handleSaveTemplate">
                <i class="bk-drag-icon bk-drag-template-fill" v-bk-tooltips.top-start="'存为模板'" />
            </div>
            <div
                v-if="activeComponentData.parentNode && !activeComponentData.parentNode.root"
                :class="$style['button']"
                @click="handleSelectParent">
                <i class="bk-drag-icon" :class="activeComponentData.parentNode.material.icon || 'bk-drag-grid'" v-bk-tooltips.top-start="'选中父级'" />
            </div>
            <div
                v-if="activeComponentData.componentId && !activeComponentData.isInteractiveComponent"
                :class="$style['button']"
                @click="handleCopyPaste">
                <i class="bk-drag-icon  bk-drag-copy" v-bk-tooltips.top-start="'复制粘贴'" />
            </div>
            <div
                :class="$style['button']"
                @click="handleRemove">
                <i class="bk-drag-icon bk-drag-delet" v-bk-tooltips.top-start="'删除'" />
            </div>
        </div>
    </div>
</template>
<script>
    import store from '@/store'
    import {
        reactive,
        toRefs,
        ref,
        onMounted
    } from '@vue/composition-api'
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
                    const container = document.body.querySelector('.mobile-layout-wrapper')
                    const calculateActiveTop = `${parseInt(initStyle[keyMap[0]]) - (container.scrollTop - initStyle[keyMap[1]])}px`
                    state[keyMap[2]].top = miniLimited(calculateActiveTop, minimalTop) + 'px'
                }, 50)
            }
            
            // 移动端页面滚动，需要动态调整标签位置
            const mobileScrollHandler = scrollHandleGenerator('active')

            const mobileHoverScrollHandler = scrollHandleGenerator('hover')

            /**
             * @desc acitve状态
             * @param { Node } componentData
             */
            const { activeComponentData } = useComponentActive((componentData) => {
                const mobileContainer = document.body.querySelector('.mobile-layout-wrapper')
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
                    zIndex: activeZIndex
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
                const mobileContainer = document.body.querySelector('.mobile-layout-wrapper')
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
                    zIndex: hoverZIndex
                }

                initStyle.hoverTop = state.hoverStyles.top
                initStyle.hoverScrollTop = mobileContainer?.scrollTop

                mobileContainer?.addEventListener('scroll', mobileHoverScrollHandler)
            })

            /** transfer dom 防止移动端overflow: hidden导致的无法显示问题 */
            onMounted(() => {
                const wrapper = document.querySelector(toolContainer)
                wrapper.append(componentToolRef.value)
            })
            
            return {
                ...toRefs(state),
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
                initStyle
            }
        }
    }
</script>
<style lang="postcss" module>
    .tools-active,
    .tools-hover{
        position: absolute;
        display: flex;
        padding-bottom: 4px;
        user-select: none;
    }
    .tools-active{
        .button{
            background: #3A84FF;
            cursor: pointer;
        }
    }
    .tools-hover{
        .button{
            background: #A3C5FD;
        }
    }
    .comp-id-button {
        width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .button{
        flex: 0 0 auto;
        height: 20px;
        padding: 0 3px;
        margin-right: 4px;
        font-size: 12px;
        line-height: 20px;
        text-align: center;
        border-radius: 2px;
        color: #fff;
        text-align: center;
        pointer-events: all;
        &.disabled{
            background-color: #dcdee5;
            color: #fff;
            cursor: not-allowed;
        }
        &:hover{
            background: #1964E1;
        }
    }
</style>
