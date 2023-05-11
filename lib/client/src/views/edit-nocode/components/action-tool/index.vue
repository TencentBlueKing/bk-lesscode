<template>
    <div class="action-tool-list">
        <show-function v-if="!hideFunc" />
        <div class="func-split-line" />
        <save
            :custom="customSave"
            :custom-loading="customLoading"
            :disabled="disabled"
            :tips="disabledTips"
            @save="$emit('save', $event)" />
        <preview v-if="!hidePreview" :disabled="disabled" :tips="disabledTips" />
        <clear :disabled="disabled" :tips="disabledTips" />
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
            customLoading: Boolean,
            disabled: Boolean,
            disabledTips: String,
            hidePreview: Boolean,
            hideFunc: Boolean,
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
