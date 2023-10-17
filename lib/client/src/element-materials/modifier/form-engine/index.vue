<template>
  <section class="form-engine-modifier">
    <field-properties />
  </section>
</template>
<script>
    import fieldProperties from './components/field-properties.vue'

    export default {
        name: 'form-engine-modifier',
        components: {
            fieldProperties
        }
    }
</script>
<style lang="postcss" scoped>
    .form-engine-modifier {
        height: 100%;
    }
</style>