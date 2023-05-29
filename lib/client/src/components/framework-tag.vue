<template>
    <div>
        <div class="app-com-version" :style="{ background: bgColor }">
            {{ framework || 'vue2' }}
        </div>
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
    color: #63656E;
    text-align: left;
    line-height: 20px;
    background: #F0F1F5;
    text-align: center;
    margin-left: 10px;
    margin-top: 5px;
    border-radius: 11px;
    padding: 0 8px;
    line-height: 20px;
    display: inline-block;
}

.app-com-version:hover {
    height: 20px;
    font-size: 12px;
    color: #233CA7;
    text-align: left;
    line-height: 20px;
    background: #F0F5FF;
    text-align: center;
    border-radius: 11px;
    padding: 0 8px;
    line-height: 20px;
    display: inline-block;
}

</style>
