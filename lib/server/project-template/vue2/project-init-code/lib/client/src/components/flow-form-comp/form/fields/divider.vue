<template>
    <div class="divider">
        <bk-divider :align="field.deviderAttr.align" :color="field.deviderAttr.color">
            {{field.default}}
        </bk-divider>
    </div>
</template>
<script>
    export default {
        name: 'Divider',
        props: {
            field: {
                type: Object,
                default: () => ({})
            }
        }
    }
</script>
