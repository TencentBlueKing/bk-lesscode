<template>
    <article class="backend-home">
        <template v-if="currentModule.id">
            <render-header :current-module="currentModule"></render-header>
            <render-nodes ref="renderNodes" :module-id="currentModule.id"></render-nodes>
        </template>
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
            currentModule: {
                type: Object,
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
