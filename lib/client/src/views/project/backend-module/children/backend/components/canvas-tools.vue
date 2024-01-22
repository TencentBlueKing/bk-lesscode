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
        <li @click="zoomTo(1)">
            <i class="bk-drag-icon bk-drag-undo"
                v-bk-tooltips="{
                    content: '恢复默认大小',
                    placements: ['left']
                }">
            </i>
        </li>
        <!-- <li @click="zoom(-0.2)">
            <i class="bk-drag-icon bk-drag-feature-conversion"></i>
        </li> -->
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
            }
        },
        setup (props) {
            const zoom = function (val = 0.2) {
                if (val) {
                    props.graphZoom(val)
                }
            }

            const zoomTo = function (val = 1) {
                props.graphZoomTo(val)
            }
            
            return {
                zoom,
                zoomTo
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .canvas-tools {
        z-index: 10;
        position: absolute;
        right: 0;
        top: 40%;
        width: 48px;
        /* height: 220px; */
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