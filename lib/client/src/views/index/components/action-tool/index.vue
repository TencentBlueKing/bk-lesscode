<template>
    <div class="action-tool-list">
        <save-as-template v-if="iamNoResourcesPerm[$IAM_ACTION.manage_template[0]]" />
        <clear-canvas />
        <code-and-json />
        <show-function />
        <show-variable />
        <quick-operation />
        <canvas-guide />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import SaveAsTemplate from './components/save-as-template'
    import ClearCanvas from './components/clear-canvas'
    import CodeAndJson from './components/code-and-json'
    import ShowFunction from './components/show-function'
    import ShowVariable from './components/show-variable'
    import QuickOperation from './components/quick-operation'
    import CanvasGuide from './components/canvas-guide'

    export default {
        components: {
            SaveAsTemplate,
            ClearCanvas,
            CodeAndJson,
            ShowFunction,
            ShowVariable,
            QuickOperation,
            CanvasGuide
        },
        computed: {
            ...mapGetters(['iamNoResourcesPerm'])
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
