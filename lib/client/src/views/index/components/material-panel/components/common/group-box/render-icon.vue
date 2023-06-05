<template>
    <div class="render-drag-icon-item inline">
        <bk-icon
            v-if="data.type === 'bk-icon'"
            :type="data.icon" />
        <i
            v-else
            :class="data.icon" />
    </div>
</template>
<script>
    export default {
        name: '',
        props: {
            data: Object
        }
    }
</script>

<style lang="postcss" scoped>
    .render-drag-icon-item{
        width: 36px;
        height: 36px;
        margin-right: 4px;
        margin-bottom: 4px;
        background-color: #fafbfd;
        color: #979ba5;
        text-align: center;
        font-size: 16px;
        line-height: 36px;
        cursor: pointer;
        &:hover{
            background: #3a84ff;
            color: #fff;
        }
    }
</style>
