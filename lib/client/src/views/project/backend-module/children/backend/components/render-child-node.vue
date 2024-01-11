<template>
    <section class="child-node" @click="handleShowCode">
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
        <i v-if="node.status === 'failed'" class="bk-icon icon-close-circle tail-icon"></i>
        <i v-if="node.status === 'success'" class="bk-icon icon-check-circle tail-icon"></i>
        <svg v-if="node.status === 'running'" aria-hidden="true" width="14" height="14" class="loading-icon tail-icon">
            <use xlink:href="#bk-drag-loading-2"></use>
        </svg>
        <bk-sideslider
            :is-show.sync="isShowCode"
            :quick-close="true"
            :width="960"
            :title="title"
            transfer
        >
            <div slot="content">
                <monaco
                    height="calc(100vh - 114px)"
                    value="console.log(233)"
                    :options="{ language: 'sql' }">
                </monaco>
            </div>
            <template #footer>
                <bk-button theme="primary" class="confirm-button">{{ confirmTxt }}</bk-button>
                <bk-button>{{ cancelTxt }}</bk-button>
            </template>
        </bk-sideslider>
    </section>
</template>

<script>
    import monaco from '@/components/monaco.vue'

    export default {
        inject: ['getNode'],
        components: {
            monaco
        },
        data () {
            return {
                node: {},
                isShowCode: false,
                title: window.i18n.t('编辑源码信息'),
                confirmTxt: window.i18n.t('保存并执行'),
                cancelTxt: window.i18n.t('取消')
            }
        },
        mounted () {
            const node = this.getNode()
            this.node = node.getData()
            node.on('change:data', ({ current }) => {
                this.node = current
            })
        },
        methods: {
            handleShowCode () {
                // this.isShowCode = true
            }
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
    cursor: pointer;
}
.bk-drag-yuanma {
    font-size: 16px;
    margin: 0 13px 0 12px;
}
.node-name {
    display: inline-block;
    font-size: 12px;
    width: 150px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.tail-icon {
    font-size: 14px;
    margin-right: 17px;
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
.confirm-button {
    margin: 0 10px 0 15px;
}
</style>
