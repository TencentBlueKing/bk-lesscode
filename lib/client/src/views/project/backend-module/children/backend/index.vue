<template>
    <article class="backend-home">
        <render-header :module-code="moduleCode"></render-header>
        <render-nodes></render-nodes>
    </article>
</template>

<script>
    import RenderHeader from './components/render-header.vue'
    import RenderNodes from './components/render-nodes.vue'

    export default {
        components: {
            RenderHeader,
            RenderNodes
        },

        props: {
            moduleCode: {
                type: String,
                required: true
            }
        }
    }
</script>

<style lang="postcss" scoped>
  .backend-home {
    height: 100%;
    width: 100%;
  }
</style>
