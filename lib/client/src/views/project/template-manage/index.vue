<template>
    <section>
        <bk-alert style="margin: 16px 24px 0 16px;" type="info" :title="$t('模板来源：在页面画布中可将局部内容或将整个页面存为模板')" closable></bk-alert>
        <layout class="template-manage" :init-width="320">
            <render-category ref="category" slot="left" @on-change="handleCategoryChange" />
            <render-template v-if="categoryId" :category-id="categoryId" :refresh-category="updateCategory" />
        </layout>
    </section>
</template>
<script>
    import Layout from '@/components/ui/layout'
    import RenderCategory from './components/render-category'
    import RenderTemplate from './components/render-template'

    export default {
        name: '',
        components: {
            Layout,
            RenderCategory,
            RenderTemplate
        },
        data () {
            return {
                categoryId: 0
            }
        },
        methods: {
            handleCategoryChange (category) {
                this.categoryId = category
            },
            updateCategory () {
                this.$refs.category.refresh()
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .template-manage {
        height: calc(100vh - 163px);
    }
</style>
