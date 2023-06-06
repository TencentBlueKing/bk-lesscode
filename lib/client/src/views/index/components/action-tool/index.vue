<template>
    <div class="action-tool-list">
        <save-as-template v-if="iamNoResourcesPerm[$IAM_ACTION.manage_template[0]]" />
        <clear-canvas />
        <code-and-json />
        <quick-operation />
        <canvas-guide />
        <ai v-if="isAiAvailable" />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import SaveAsTemplate from './components/save-as-template'
    import ClearCanvas from './components/clear-canvas'
    import CodeAndJson from './components/code-and-json'
    import QuickOperation from './components/quick-operation'
    import CanvasGuide from './components/canvas-guide'
    import Ai from './components/ai.vue'

    export default {
        components: {
            SaveAsTemplate,
            ClearCanvas,
            CodeAndJson,
            QuickOperation,
            CanvasGuide,
            Ai
        },
        computed: {
            ...mapGetters(['iamNoResourcesPerm']),
            ...mapGetters('ai', ['isAiAvailable'])
        }
    }
</script>
<style lang="postcss" scoped>
    .action-tool-list{
        display: flex;
        align-items: center;
        height: 100%;
    }
</style>
