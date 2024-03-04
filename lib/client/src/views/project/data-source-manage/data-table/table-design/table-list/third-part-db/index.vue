<template>
    <layout class="data-manage-main">
        <aside class="table-list" slot="left">
            <render-aside
                ref="renderAsideRef"
                :data-base-info="dataBaseInfo"
                @choose-data-base="handleChooseDataBase"
            />
        </aside>
        <section class="data-main">
            <render-main
                :data-base-info="dataBaseInfo"
                @update="handleUpdate"
            />
        </section>
    </layout>
</template>

<script>
    import Layout from '@/components/ui/layout.vue'
    import RenderAside from './components/render-aside.vue'
    import RenderMain from './components/render-main.vue'
  
    export default {
        components: {
            Layout,
            RenderAside,
            RenderMain
        },

        data () {
            return {
                dataBaseInfo: {}
            }
        },

        methods: {
            handleChooseDataBase (dataBaseInfo) {
                this.dataBaseInfo = dataBaseInfo
            },

            handleUpdate (dataBase) {
                this.handleChooseDataBase(dataBase)
                this.$refs.renderAsideRef.getThirdPartDB()
            }
        }
    }
</script>

<style lang="postcss" scoped>
  .data-manage-main {
    height: calc(100% - 96px);
  }
  .data-main {
    height: 100%;
  }
</style>
