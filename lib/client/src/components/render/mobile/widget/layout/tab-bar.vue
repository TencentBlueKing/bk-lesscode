<template>
    <div class="mobile-tabbar-layout-wrapper mobile-layout-wrapper" ref="layout">
        <slot />
        <van-tabbar route>
            <div class="tabbar-item-wrapper"
                :class="{ selected: isTabbarSelected }"
                @click.stop="componentClickHandler">
                <van-tabbar-item replace v-for="menu in curTemplateData.menuList"
                    :key="menu.id"
                    :to="menu.fullPath"
                    :icon="menu.icon">{{menu.name}}</van-tabbar-item>
            </div>
        </van-tabbar>
    </div>
</template>
<script>
    import { defineComponent } from '@vue/composition-api'
    import useComponentAction from '../component-action-use'
    export default defineComponent({
        setup () {
            const layoutName = 'mobileBottomMenu'
            const { isSelectedRef, componentClickHandler, curTemplateData } = useComponentAction(false, layoutName, 'MOBILE')
            return {
                isTabbarSelected: isSelectedRef,
                componentClickHandler,
                curTemplateData
            }
        }
    })
</script>

<style lang="postcss" scoped>
.mobile-tabbar-layout-wrapper {
    height: 100%;
    .van-tabbar {
        position: absolute;
    }
    .tabbar-item-wrapper {
        width: 100%;
        display: flex;
        box-sizing: content-box;
        border: 1px  solid transparent;
        z-index: 2;
        cursor: pointer;
        &:hover {
            border: 1px dashed #3a84ff;
        }
        &.selected {
            border: 1px solid #3a84ff;
        }
        .van-tabbar-item {
            pointer-events: none;
        }
    }
}
</style>
