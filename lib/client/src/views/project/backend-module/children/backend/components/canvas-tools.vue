<template>
    <div class="canvas-tools">
        <li @click="zoom(0.1)">
            <i class="bk-drag-icon bk-drag-plus-circle"
                v-bk-tooltips="{
                    content: '放大',
                    placements: ['left']
                }">
            </i>
        </li>
        <li @click="zoom(-0.1)">
            <i class="bk-drag-icon bk-drag-minus-circle"
                v-bk-tooltips="{
                    content: '缩小',
                    placements: ['left']
                }">
            </i>
        </li>
        <!-- <li @click="zoomTo(1)">
            <i class="bk-drag-icon bk-drag-undo"
                v-bk-tooltips="{
                    content: '恢复默认大小',
                    placements: ['left']
                }">
            </i>
        </li> -->
        <li @click="fit">
            <i class="bk-drag-icon bk-drag-zuoyouchengman"
                v-bk-tooltips="{
                    content: '自适应展示所有节点',
                    placements: ['left']
                }">
            </i>
        </li>
        <li @click="align">
            <i class="bk-drag-icon bk-drag-undo"
                v-bk-tooltips="{
                    content: '重置视图',
                    placements: ['left']
                }">
            </i>
        </li>
    </div>
</template>

<script>
    import { ref, defineComponent } from '@vue/composition-api'
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
            const zoom = function (val = 0.1) {
                if (val) {
                    props.graphZoom(val)
                }
            }

            const zoomTo = function (val = 1) {
                props.graphZoomTo(val)
            }

            const fit = function () {
                props.graphFit()
            }

            const align = function () {
                props.graphZoomTo(1)
                props.graphAlign()
            }
            
            return {
                zoom,
                zoomTo,
                fit,
                align
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