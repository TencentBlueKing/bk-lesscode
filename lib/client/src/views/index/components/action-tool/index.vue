<template>
    <div class="action-tool-list">
        <show-function />
        <div class="func-split-line" />
        <save-canvas />
        <preview />
        <save-as-template v-if="iamNoResourcesPerm[$IAM_ACTION.manage_template[0]]" />
        <clear-canvas />
        <quick-operation />
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    import SaveCanvas from './components/save-canvas'
    import Preview from './components/preview'
    import SaveAsTemplate from './components/save-as-template'
    import ClearCanvas from './components/clear-canvas'
    import ShowFunction from './components/show-function'
    import QuickOperation from './components/quick-operation'

    export default {
        components: {
            SaveCanvas,
            Preview,
            SaveAsTemplate,
            ClearCanvas,
            ShowFunction,
            QuickOperation
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
    .func-split-line {
        height: 22px;
        width: 1px;
        margin-left: 5px;
        background-color: #dcdee5;
    }
</style>
