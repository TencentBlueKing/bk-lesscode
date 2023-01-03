<template>
    <div class="action-tool-list">
        <show-function v-if="!hideFunc" />
        <div class="func-split-line" />
        <save v-if="!hideSave" :custom="customSave" @save="$emit('save', $event)" />
        <preview v-if="!hidePreview" />
        <clear v-if="!hideClear" />
    </div>
</template>
<script>
    import Save from './components/save'
    import Preview from '@/views/index/components/action-tool/components/preview'
    import Clear from './components/clear'
    import ShowFunction from '@/views/index/components/action-tool/components/show-function'

    export default {
        components: {
            Save,
            Preview,
            Clear,
            ShowFunction
        },
        props: {
            customSave: Boolean,
            hideSave: Boolean,
            hidePreview: Boolean,
            hideFunc: Boolean,
            hideClear: Boolean
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
        background-color: #dcdee5;
        height: 22px;
        margin-left: 5px;
        width: 1px;
    }
</style>
