<template>
    <section class="bkform-engine-setter-form-item">
        <section class="bkform-engine-setter-title">{{ title }}</section>
        <section class="bk-form-engine-setter-content">
            <slot></slot>
        </section>
    </section>
</template>
<script>
    export default {
        name: '',
        props: {
            title: {
                type: String,
                default: ''
            },
            desc: {
                type: String,
                default: ''
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .bkform-engine-setter-title {
        margin: 6px 0;
        line-height: 20px;
        font-size: 12px;
        color: #63656e;
    }
</style>
