<template>
    <div @click.stop="">
        <div
            :class="$style['achor-top']"
            :style="btnTopStyles"
            @mousedown="handleMarginTop">
            <i class="bk-drag-icon bk-drag-zuoyouchengkai" />
            <div
                :class="$style['tip-top']"
                :style="tipTopStyles">
                {{ margin.top }}
            </div>
        </div>
        <div
            :class="$style['achor-left']"
            :style="btnLeftStyles"
            @mousedown="handleMarginLeft">
            <i class="bk-drag-icon bk-drag-zuoyouchengkai" />
            <div
                :class="$style['tip-left']"
                :style="tipLeftStyles">
                {{ margin.left }}
            </div>
        </div>
    </div>
</template>
<script>
    import {
        reactive,
        toRefs
    } from '@vue/composition-api'
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
        }
    }
</script>
<style lang="postcss" module>
    .achor-top,
    .achor-left{
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 15px;
        width: 15px;
        cursor: pointer;
    }
    .achor-top{
        :global(.bk-drag-icon){
            transform: rotateZ(90deg);
        }
    }
    .tip-top,
    .tip-left{
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #ff9700;
    }
    .tip-top{
        left: 7px;
        bottom: 7px;
        border-left: 1px solid #ff9700;
    }
    .tip-left{
        top: -10px;
        right: 7px;
        border-bottom: 1px solid #ff9700;
    }
</style>
