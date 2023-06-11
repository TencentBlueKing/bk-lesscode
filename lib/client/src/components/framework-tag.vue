<template>
    <div class="app-com-version" :style="{ background: bgColor }">
        {{ framework || 'vue2' }}
    </div>
</template>

<script>
    export default {
        name: 'BkLesscodeFrameworkTag',
        props: {
            framework: {
                type: String
            },
            bgColor: {
                type: String,
                default: '#F0F1F5'
            }
        }
    }
</script>

<style lang="postcss" scoped>

.app-com-version {
    height: 20px;
    font-size: 12px;
    text-align: left;
    line-height: 20px;
    background: #F0F1F5;
    text-align: center;
    margin-left: 10px;
    border-radius: 11px;
    padding: 0 8px;
    line-height: 20px;
    display: inline-block;
}

</style>
