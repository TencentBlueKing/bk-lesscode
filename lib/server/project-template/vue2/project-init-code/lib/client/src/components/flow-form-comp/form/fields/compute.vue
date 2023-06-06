<!-- 计算控件 -->
<template>
    <div>
        {{ value }}
    </div>
</template>

<script>
    export default {
        name: 'BkLesscodeComput',
        props: {
            value: {
                type: String,
                default: '--'
            }
        }
    }
</script>
