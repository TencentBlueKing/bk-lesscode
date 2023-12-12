<template>
    <div>{{moduleCode}}</div>
</template>

<script>
    import { defineComponent } from '@vue/composition-api'

    export default defineComponent({
        props: {
            moduleCode: {
                type: String,
                required: true
            }
        },
        setup() {

        }
    })
</script>