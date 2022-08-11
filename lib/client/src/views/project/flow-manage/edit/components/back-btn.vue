<template>
    <div class="go-back-icon-wrapper">
        <i class="bk-drag-icon bk-drag-arrow-back" @click="handleBackClick"></i>
    </div>
</template>
<script>
    export default {
        name: 'BackBtn',
        props: {
            fromPageList: Boolean
        },
        methods: {
            handleBackClick () {
                if (this.fromPageList) {
                    this.$router.push({ name: 'pageList' })
                } else {
                    this.$router.push({ name: 'flowList' })
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    i {
        font-size: 13px;
        color: #3a84ff;
        cursor: pointer;
    }
</style>
