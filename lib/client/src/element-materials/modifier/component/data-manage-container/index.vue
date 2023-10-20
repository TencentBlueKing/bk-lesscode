<template>
    <div v-if="show" class="data-manage-container-modifier">
        <prop-group title="数据源">
            <section class="data-source">
                <span class="g-prop-sub-title g-mt8 g-mb6">数据表</span>
                <bk-select size="small"></bk-select>
            </section>
        </prop-group>
    </div>
</template>
<script>
    import LC from '@/element-materials/core'
    import propGroup from '../form-container/components/prop-group.vue'

    export default {
        name: 'dataManageContainerProps',
        components: {
          propGroup
        },
        computed: {
            show () {
                const activeNode = LC.getActiveNode()
                return activeNode.type === 'widget-data-manage-container'
            }
        }
    }
</script>
