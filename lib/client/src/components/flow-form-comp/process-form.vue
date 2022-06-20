<template>
    <section>
        {{ type }}
        {{ fields }}
    </section>

</template>

<script>
    export default {
        props: {
            type: {
                type: String,
                required: 'true'
            },
            fields: {
                type: Array,
                default: () => ([])
            }
        }
    }
</script>
