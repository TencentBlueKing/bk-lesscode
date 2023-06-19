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
    color: #979BA5;
    background: #FFF;
    border-radius: 2px;
    font-size: 12px;
    line-height: 18px;
    white-space: nowrap;
    display: inline-block;
    padding: 2px 5px;
    display: inline-block;
    transform: scale(0.83, 0.83);
}

</style>
