<template>
    <section>
        {{ type }}
        {{ config }}
        {{ formIds }}
        {{ serviceId }}
    </section>

</template>

<script>
    export default {
        props: {
            type: {
                type: String,
                required: 'true'
            },
            config: {
                type: Object,
                default: () => ({})
            },
            formIds: {
                type: [Object, Number],
                required: true
            },
            serviceId: {
                type: Number,
                default: 0
            }
        }
    }
</script>
