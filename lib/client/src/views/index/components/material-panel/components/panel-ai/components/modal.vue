<template>
    <section
        class="ai-modal"
        :style="{
            top: modalPosition.top + 'px',
            bottom: modalPosition.bottom + 'px',
            left: modalPosition.left + 'px',
            right: modalPosition.right + 'px'
        }"
    >
        <header class="ai-modal-header" @mousedown.stop="handleMoveStart">
            <span>
                <i class="bk-drag-icon bk-drag-ai" />
                {{ $t('小鲸') }}
            </span>

            <span>
                <i
                    v-if="isFullTopBottom"
                    v-bk-tooltips="{ content: $t('向下收缩'), distance: 20 }"
                    class="ai-header-tool bk-drag-icon bk-drag-shangxiajuhe"
                    @click="handleUnFullTopBottom"
                ></i>
                <i
                    v-else
                    v-bk-tooltips="{ content: $t('向上扩展'), distance: 20 }"
                    class="ai-header-tool bk-drag-icon bk-drag-shangxialashen-2"
                    @click="handleFullTopBottom"
                ></i>
                
                <i
                    v-bk-tooltips="{ content: $t('清空聊天记录'), distance: 20 }"
                    class="ai-header-tool bk-drag-icon bk-drag-saoba"
                    @click="handleClear"
                ></i>
                <i
                    v-bk-tooltips="{ content: $t('关闭'), distance: 20 }"
                    class="ai-header-tool bk-drag-icon bk-drag-shanchu-2"
                    @click="handleClose"
                ></i>
            </span>
        </header>
        <slot></slot>
        <span class="drag-line left" @mousedown.stop="handleLeftDragStart"></span>
        <span class="drag-line right" @mousedown.stop="handleRightDragStart"></span>
        <span class="drag-line top" @mousedown.stop="handleTopDragStart"></span>
        <span class="drag-line bottom" @mousedown.stop="handleBottomDragStart"></span>
        <span class="drag-line top-right-corner" @mousedown.stop="handleTopRightDragStart"></span>
    </section>
</template>

<script>
    import {
        ref,
        computed,
        onBeforeMount,
        onBeforeUnmount
    } from '@vue/composition-api'

    export default {
        emits: ['clear', 'close'],
        
        setup (_, { emit }) {
            // window尺寸
            const windowSize = {
                height: window.innerHeight,
                width: window.innerWidth
            }
            // 移动和拖拽数据
            const target = {}
            // 位置最小限制
            const minLimit = {
                top: 104,
                bottom: 0,
                left: 102,
                right: 0
            }
            // 尺寸最小限制
            const sizeLimit = {
                height: 500,
                width: 294
            }
            // 模块位置
            const modalPosition = ref({
                top: windowSize.height - sizeLimit.height - 100,
                bottom: 0,
                left: 102,
                right: windowSize.width - sizeLimit.width - 270
            })

            const isFullTopBottom = computed(() => {
                return modalPosition.value.top <= minLimit.top && modalPosition.value.bottom <= minLimit.bottom
            })

            // 移动 modal 相关方法
            const handleMoveStart = (event) => {
                target.isMove = true
                target.type = 'move'
                target.clientX = event.clientX
                target.clientY = event.clientY
            }

            const handleRightDragStart = (event) => {
                target.isMove = true
                target.type = 'rightDrag'
                target.clientX = event.clientX
            }

            const handleLeftDragStart = (event) => {
                target.isMove = true
                target.type = 'leftDrag'
                target.clientX = event.clientX
            }

            const handleTopDragStart = (event) => {
                target.isMove = true
                target.type = 'topDrag'
                target.clientY = event.clientY
            }

            const handleBottomDragStart = (event) => {
                target.isMove = true
                target.type = 'bottomDrag'
                target.clientY = event.clientY
            }
            
            const handleTopRightDragStart = (event) => {
                target.isMove = true
                target.type = 'topRightDrag'
                target.clientY = event.clientY
                target.clientX = event.clientX
            }

            // 结束
            const handleMouseUp = () => {
                target.isMove = false
            }

            const updateModalPosition = (x, y) => {
                if (['move', 'leftDrag'].includes(target.type)) {
                    modalPosition.value.left += x
                }
                if (['move', 'rightDrag'].includes(target.type)) {
                    modalPosition.value.right -= x
                }
                if (['move', 'topDrag'].includes(target.type)) {
                    modalPosition.value.top += y
                }
                if (['move', 'bottomDrag'].includes(target.type)) {
                    modalPosition.value.bottom -= y
                }
                if (['topRightDrag'].includes(target.type)) {
                    modalPosition.value.right -= x
                    modalPosition.value.top += y
                }
            }

            const processBoundary = (x, y) => {
                const {
                    top,
                    bottom,
                    left,
                    right
                } = modalPosition.value
                // 最小高宽检查 && 最小值检测
                if (windowSize.width - left - right < sizeLimit.width || left < minLimit.left || right < minLimit.right) {
                    if (['move', 'leftDrag'].includes(target.type)) {
                        modalPosition.value.left -= x
                    }
                    if (['move', 'rightDrag', 'topRightDrag'].includes(target.type)) {
                        modalPosition.value.right += x
                    }
                }
                if (windowSize.height - top - bottom < sizeLimit.height || top < minLimit.top || bottom < minLimit.bottom) {
                    if (['move', 'topDrag', 'topRightDrag'].includes(target.type)) {
                        modalPosition.value.top -= y
                    }
                    if (['move', 'bottomDrag'].includes(target.type)) {
                        modalPosition.value.bottom += y
                    }
                }
            }

            // 处理移动modal，缩放modal
            const handleMouseMove = (event) => {
                if (!target.isMove) return
                // 拖拽禁止选中文字
                event.preventDefault()
                // 赋值
                const x = event.clientX - target.clientX
                const y = event.clientY - target.clientY
                // 更新值
                updateModalPosition(x, y)
                // 修正边界数据
                processBoundary(x, y)
                // 更新 target
                target.clientX = event.clientX
                target.clientY = event.clientY
            }

            // 屏幕大小发生变化
            const handleResize = () => {
                // 重置数据
                windowSize.height = window.innerHeight
                windowSize.width = window.innerWidth
                // 重置位置
                modalPosition.value = {
                    top: windowSize.height - sizeLimit.height - 100,
                    bottom: 0,
                    left: 102,
                    right: windowSize.width - sizeLimit.width - 270
                }
            }

            // 工具方法
            const handleFullTopBottom = () => {
                modalPosition.value.top = minLimit.top
                modalPosition.value.bottom = minLimit.bottom
            }

            const handleUnFullTopBottom = () => {
                modalPosition.value.top = windowSize.height - sizeLimit.height
                modalPosition.value.bottom = minLimit.bottom
            }

            const handleClear = () => {
                emit('clear')
            }

            const handleClose = () => {
                emit('close')
            }

            onBeforeMount(() => {
                window.addEventListener('mousemove', handleMouseMove, true)
                window.addEventListener('mouseup', handleMouseUp)
                window.addEventListener('resize', handleResize)
            })

            onBeforeUnmount(() => {
                window.removeEventListener('mousemove', handleMouseMove, true)
                window.removeEventListener('mouseup', handleMouseUp)
                window.removeEventListener('resize', handleResize)
            })

            return {
                modalPosition,
                isFullTopBottom,
                handleMoveStart,
                handleRightDragStart,
                handleLeftDragStart,
                handleTopDragStart,
                handleBottomDragStart,
                handleTopRightDragStart,
                handleFullTopBottom,
                handleUnFullTopBottom,
                handleClear,
                handleClose
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .ai-modal {
        position: fixed;
        display: flex;
        flex-direction: column;
        z-index: 999999;
        background: #F5F7FA;
        box-shadow: 0 2px 30px 8px #0000001a;
        border-radius: 8px 8px 2px 2px;
    }
    .ai-modal-header {
        min-height: 48px;
        background-image: linear-gradient(267deg, #2DD1F4 0%, #1482FF 95%);
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        font-size: 16px;
        color: #fff;
        cursor: move;
        .bk-drag-ai {
            font-size: 22px;
            margin-right: 2px;
        }
        .ai-header-tool {
            display: inline-block;
            width: 24px;
            height: 24px;
            font-size: 17px;
            line-height: 24px;
            margin-right: 10px;
            cursor: pointer;
            &:last-child {
                margin-right: 0;
            }
            &:hover {
                background-color: rgba(250,250,250,.2);
                border-radius: 2px;
            }
        }
    }
    .drag-line {
        position: absolute;
        cursor: e-resize;
        &.left {
            top: 0;
            bottom: 0;
            left: 0;
            width: 5px;
        }
        &.right {
            top: 0;
            bottom: 0;
            right: 0;
            width: 5px;
            
        }
        &.top-right-corner {
            top: 0px;
            right: 0px;
            cursor: sw-resize;
            width: 10px;
            height: 10px;
        }
        &.top {
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            cursor: n-resize;
        }
        &.bottom {
            bottom: 0;
            left: 0;
            right: 0;
            height: 5px;
            cursor: n-resize;
        }
    }
</style>
