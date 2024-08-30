<template>
    <article>
        <header>
            <render-header>{{ $t('数据源管理') }}</render-header>
            <div class="g-page-tab">
                <div
                    class="tab-item"
                    :class="{ active: activePage === 'data-source' }"
                    @click="togglePage('data-source')"
                >{{ $t('内置数据库') }}</div>
                <div
                    class="tab-item"
                    :class="{ active: activePage === 'thirdPartDB' }"
                    @click="togglePage('thirdPartDB')"
                >{{ $t('第三方数据库') }}</div>
            </div>
        </header>

        <component :is="activePage"></component>
    </article>
</template>

<script lang="ts">
    import { defineComponent, ref, onBeforeMount } from '@vue/composition-api'
    import renderHeader from '../../common/header'
    import dataSource from './list/index.vue'
    import thirdPartDB from './third-part-db/index.vue'
    import router from '@/router'

    export default defineComponent({
        components: {
            renderHeader,
            dataSource,
            thirdPartDB
        },

        setup () {
            const activePage = ref<string>('data-source')

            const togglePage = (val: string): void => {
                activePage.value = val
                router.replace({
                    query: {
                        tab: val
                    }
                })
            }

            onBeforeMount(() => {
                if (router?.currentRoute?.query?.tab) {
                    activePage.value = router.currentRoute.query.tab
                }
            })

            return {
                activePage,
                togglePage
            }
        }
    })
</script>
