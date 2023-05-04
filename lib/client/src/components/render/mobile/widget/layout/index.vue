<template>
    <component :is="component">
        <slot />
    </component>
</template>
<script>
    import tabBar from './tab-bar.vue'
    import emptyLayout from './empty-layout.vue'
    import store from '@/store'

    const componentMap = {
        'mobile-bottom': tabBar,
        'mobile-empty': emptyLayout
    }
    export default {
        components: {
            tabBar
        },
        computed: {
            pageLayout () {
                return store.getters['layout/pageLayout']
            },
            component () {
                const type = this.pageLayout?.layoutType
                if (!componentMap[type]) {
                    return emptyLayout
                }
                return componentMap[type]
            }
        }
    }
</script>
<style lang="postcss" scoped>
.mobile-layout-wrapper {
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
