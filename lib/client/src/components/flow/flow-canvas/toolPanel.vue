<template>
    <div class="tool-panel-container">
        <div v-bk-tooltips.left="'放大'" class="tool-item" @click="onZoomIn" title="放大">
            <i class="bk-drag-icon bk-drag-plus-circle"></i>
        </div>
        <div v-bk-tooltips.left="'缩小'" class="tool-item" @click="onZoomOut" title="缩小">
            <i class="bk-drag-icon bk-drag-minus-circle"></i>
        </div>
        <!-- <div v-bk-tooltips.top="'复位'" class="tool-item" @click="onResetPosition" title="复位">
            <i class="bk-drag-icon bk-drag-filliscreen"></i>
        </div> -->
        <div v-bk-tooltips.left="'全屏'" class="tool-item" @click="onZoomOut" title="全屏">
            <i class="bk-drag-icon bk-drag-filliscreen-line"></i>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'ToolPanel',
        props: {},
        data () {
            return {}
        },
        methods: {
            onZoomIn () {
                this.$emit('onZoomIn')
            },
            onZoomOut () {
                this.$emit('onZoomOut')
            },
            onResetPosition () {
                this.$emit('onResetPosition')
            }
        }
    }
</script>
<style lang="postcss" scoped>
.tool-panel-container {
    /* padding: 6px 0; */
    .tool-item {
    padding: 0 10px;
    line-height: 36px;
    font-size: 16px;
    color: #63656e;
    text-align: center;
    cursor: pointer;
        &:hover {
            color: #3a84ff;
            background: #e1e3e6;
        }
    }
}
</style>
