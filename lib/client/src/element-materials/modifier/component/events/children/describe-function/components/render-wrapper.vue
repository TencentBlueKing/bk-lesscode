<template>
    <section class="render-wrapper">
        <i class="bk-icon icon-close-line panel-minus" @click="handleDelete"></i>
        <slot></slot>
    </section>
</template>

<script>
    export default {
        methods: {
            handleDelete () {
                this.$emit('delete')
            }
        }
    }
</script>

<style lang="postcss" scoped>
.render-wrapper {
    background: #FFFFFF;
    position: relative;
    padding: 16px 12px;
    &:hover {
      box-shadow: 0 2px 4px 0 #0000001a;
      .panel-minus {
        display: block;
      }
    }
}
.panel-minus {
    position: absolute;
    cursor: pointer;
    right: 2px;
    top: 2px;
    font-size: 12px;
    display: none;
    scale: 0.8333;
}
</style>
