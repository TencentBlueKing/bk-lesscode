<template>
    <div class="mobile-empty-layout-wrapper mobile-layout-wrapper" ref="layout">
        <slot />
    </div>
</template>
<script>
    import { defineComponent } from '@vue/composition-api'
    import useComponentAction from '../component-action-use'
    export default defineComponent({
        setup () {
            const layoutName = 'mobileEmptyLayout'
            const pageSetting = useComponentAction(false, layoutName, 'MOBILE')
            return {
                pageSetting
            }
        }
    })
</script>

<style lang="postcss" scoped>
.mobile-empty-layout-wrapper {
    height: 100%;
}
</style>
