<template>
    <div class="item">
        <div
            class="item-text"
            v-bk-tooltips="{
                placement: 'bottom',
                content: item.tips,
                disabled: !item.tips
            }"
            @click="item.func">
            <i :class="item.icon"></i>
        </div>
        <slot />
    </div>
</template>
<script>
    export default {
        props: {
            item: {
                type: Object,
                required: true
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .item {
        display: flex;
        font-size: 12px;
        height: 100%;
        cursor: pointer;
        &:hover {
            background-color: #e1ecff;
            color: #3a84ff;
        }
        .item-text{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 52px;
            i {
                font-size: 16px;
            }
        }
    }
</style>
