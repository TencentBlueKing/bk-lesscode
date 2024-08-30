<template>
    <section class="child-node">
        <i class="bk-drag-icon bk-drag-yuanma"></i>
        <span class="node-name"
            v-bk-tooltips="{
                content: node.name,
                maxWidth: 300,
                placements: ['top'],
                delay: [100, 0]
            }"
        >
            {{ node.name }}
        </span>
        <i v-if="node.status === 'fail'" class="bk-icon icon-close-circle tail-icon"></i>
        <i v-if="node.status === 'success'" class="bk-icon icon-check-circle tail-icon"></i>
        <svg v-if="node.status === 'running'" aria-hidden="true" width="14" height="14" class="loading-icon tail-icon">
            <use xlink:href="#bk-drag-loading-2"></use>
        </svg>
    </section>
</template>

<script>
    export default {
        inject: ['getNode'],
        data () {
            return {
                node: {}
            }
        },
        mounted () {
            const node = this.getNode()
            this.node = node.getData()
            node.on('change:data', ({ current }) => {
                this.node = current
            })
        }
    }
</script>
<style lang="postcss" scoped>
    .child-node {
        height: 100%;
        width: 100%;
        background-color: #fff;
        box-shadow: 0 2px 4px 0 #1919290d;
        border-radius: 4px;
        display: flex;
        align-items: center;
        padding: 0 16px 0 14px;
        color: #63656E;
    }
    .bk-drag-yuanma {
        font-size: 16px;
    }
    .node-name {
        display: inline-block;
        font-size: 12px;
        width: 150px;
        margin-left: 12px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .tail-icon {
        font-size: 14px;
        &.icon-close-circle {
            color: #EA3636;
        }
        &.icon-check-circle {
            color: #1CAB88;
        }
        &.loading-icon {
            fill: #3a84ff;
            animation: icon-loading 1.5s linear infinite;
        }
    }
</style>
