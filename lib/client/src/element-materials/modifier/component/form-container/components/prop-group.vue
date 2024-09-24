<template>
    <div class="prop-group">
        <section class="group-header" @click="open = !open">
            <span class="title">{{ title }}</span>
            <i :class="['bk-icon icon-angle-down arrow-icon', { closed: !open }]"></i>
        </section>
        <section v-show="open" class="prop-content">
            <slot></slot>
        </section>
    </div>
</template>
<script>
    export default {
        name: 'propGroup',
        props: {
            title: String
        },
        data () {
            return {
                open: true
            }
        }
    }
</script>
<style lang="postcss" scoped>
.prop-group {
    border-bottom: 1px solid #dde4eb;
}
.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    cursor: pointer;
    padding: 0 12px;
    .arrow-icon {
        font-size: 24px;
        color: #63656e;
        transition: all .1s .linear;
        &.closed {
            transform: rotate(-90deg);
        }
    }
    .title {
        font-size: 12px;
        font-weight: 700;
        color: #313238;
    }
}
.prop-content {
    padding: 8px 12px 16px;
}
</style>
