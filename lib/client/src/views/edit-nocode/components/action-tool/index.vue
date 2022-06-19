<template>
    <div class="action-tool-list">
        <save v-if="!hideSave" :custom="customSave" @save="$emit('save', $event)" />
        <preview />
        <clear v-if="!hideClear" />
    </div>
</template>
<script>
    import Save from './components/save'
    import Preview from '@/views/index/components/action-tool/components/preview'
    import Clear from './components/clear'

    export default {
        components: {
            Save,
            Preview,
            Clear
        },
        props: {
            customSave: Boolean,
            hideSave: Boolean,
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
