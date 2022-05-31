<template>
    <div class="go-back-icon-wrapper">
        <i class="bk-drag-icon bk-drag-arrow-back" @click="$router.push({ name: 'flowList' })"></i>
    </div>
</template>
<script>
    export default {
        name: 'BackBtn'
    }
</script>
<style lang="postcss" scoped>
    i {
        font-size: 13px;
        color: #3a84ff;
        cursor: pointer;
    }
</style>
