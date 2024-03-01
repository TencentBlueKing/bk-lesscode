<template>
    <article class="backend-home">
        <template v-if="currentModule.id">
            <render-header :current-module="currentModule" :project-id="projectId"></render-header>
            <render-nodes ref="renderNodes" :module-id="currentModule.id" :project-id="projectId"></render-nodes>
        </template>
        <div v-else style="padding-top: 20%">
            <empty-status :empty-text="$t('请先在左侧创建模块')" :part="false" />
        </div>
    </article>
</template>

<script>
    import RenderHeader from './components/render-header.vue'
    import RenderNodes from './components/render-nodes.vue'

    // 兼容各浏览器的hidden属性
    let hidden, visibilityChange
    if (typeof document.hidden !== "undefined") { 
        hidden = "hidden"
        visibilityChange = "visibilitychange"
    } else if (typeof document.msHidden !== "undefined") { 
        hidden = "msHidden"
        visibilityChange = "msvisibilitychange"
    } else if (typeof document.webkitHidden !== "undefined") { 
        hidden = "webkitHidden"
        visibilityChange = "webkitvisibilitychange"; 
    }

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
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },
        mounted () {
            document.addEventListener(visibilityChange, this.handleVisibilityChange)
        },
        beforeDestroyed () {
            document.removeEventListener(visibilityChange, this.handleVisibilityChange)
        },
        methods: {
            handleVisibilityChange () {
                if (document[hidden]) {
                    console.log("页面不可见")
                } else {
                    console.log("页面可见")
                    this.$nextTick(() => {
                        this.$store.commit('saasBackend/setStateProperty', { key: 'needUpdate', value: true })
                    })
                }
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
