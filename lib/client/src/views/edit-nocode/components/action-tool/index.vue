<template>
    <div class="action-tool-list">
        <clear v-if="!hideClear" :disabled="disabled" :tips="disabledTips" />
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
            hideJson: Boolean,
            hideClear: Boolean,
            disabled: Boolean,
            disabledTips: String
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
