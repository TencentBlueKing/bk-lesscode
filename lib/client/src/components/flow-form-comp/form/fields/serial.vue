<!-- 自动编号 -->
<template>
    <div>
        {{ value }}
    </div>
</template>

<script>
    export default {
        name: 'BkLesscodeSerial',
        props: {
            value: {
                type: String,
                default: '--'
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
