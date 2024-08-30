<template>
    <div class="canvas-tools">
        <li v-for="tool in toolList" :key="tool.icon" @click="tool.func">
            <i :class="tool.icon"
                v-bk-tooltips="{
                    content: tool.tips,
                    placements: ['left']
                }">
            </i>
        </li>
        <li @click="screenItem.func">
            <i :class="screenItem.icon"
                v-bk-tooltips="{
                    content: screenItem.tips,
                    placements: ['left']
                }">
            </i>
        </li>
    </div>
</template>

<script>
    import screenfull from 'screenfull'
    import { ref, defineComponent, computed, onMounted, onBeforeUnmount } from '@vue/composition-api'
    
    export default defineComponent({
        props: {
            graphZoom: {
                type: Function,
                default: () => {}
            },
            graphZoomTo: {
                type: Function,
                default: () => {}
            },
            graphFit: {
                type: Function,
                default: () => {}
            },
            graphAlign: {
                type: Function,
                default: () => {}
            }
        },
        setup (props) {
            const toolList = [
                {
                    icon: 'bk-drag-icon bk-drag-plus-circle',
                    tips: '放大',
                    func: () => {
                        props.graphZoom(0.1)
                    }
                },
                {
                    icon: 'bk-drag-icon bk-drag-minus-circle',
                    tips: '缩小',
                    func: () => {
                        props.graphZoom(-0.1)
                    }
                },
                {
                    icon: 'bk-drag-icon bk-drag-zuoyouchengman',
                    tips: '自适应展示所有节点',
                    func: props.graphFit
                },
                {
                    icon: 'bk-drag-icon bk-drag-undo',
                    tips: '重置视图',
                    func: () => {
                        props.graphZoomTo(1)
                        props.graphAlign()
                    }
                }
            ]

            const screenItem = ref({
                icon: 'bk-drag-icon bk-drag-filliscreen-line',
                tips: '全屏',
                func: () => {
                    handleScreenfull()
                }
            })

            onMounted(() => {
                if (screenfull.isEnabled) {
                    screenfull.on('change', () => {
                        screenItem.value = screenfull.isFullscreen ?
                        {
                            icon: 'bk-drag-icon bk-drag-un-full-screen-2',
                            tips: '取消全屏',
                            func: () => {
                                screenfull.exit()
                            }
                        } : {
                            icon: 'bk-drag-icon bk-drag-filliscreen-line',
                            tips: '全屏',
                            func: () => {
                                handleScreenfull()
                            }
                        }
                    })
                }
            })

            onBeforeUnmount(() => {
                if (screenfull.isEnabled) {
                    screenfull.off('change', () => {})
                }
            })
            
            const handleScreenfull  = function () {
                const el = document.querySelector('.render-nodes-wrapper')
                if (!screenfull.isEnabled) {
                    this.$bkMessage({
                        message: this.$t('浏览器不支持全屏'),
                        theme: 'error'
                    })
                    return false
                }
                screenfull.request(el)
            }
            
            return {
                toolList,
                screenItem
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .canvas-tools {
        z-index: 10;
        position: absolute;
        right: 0;
        top: 35%;
        width: 48px;
        background: #FFFFFF;
        box-shadow: 0 2px 4px 0 #0000001a;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        align-items: center;
        padding-top: 16px;
        li {
            cursor: pointer;
            margin-bottom: 16px;
            &:hover {
                color: #3A84FF;
            }
        }
    }
</style>