<template>
    <div class="action-tool-list">
        <!-- <save v-if="!hideSave" :custom="customSave" @save="$emit('save', $event)" />
        <preview v-if="!hidePreview" /> -->
        <clear v-if="!hideClear" />
        <code-and-json v-if="!hideJson" />
    </div>
</template>
<script>
    import CodeAndJson from './components/code-and-json'
    import Clear from './components/clear'

    export default {
        components: {
            Clear,
            CodeAndJson
        },
        props: {
            customSave: Boolean,
            hideJson: Boolean,
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
</style>
