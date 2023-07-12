<template>
    <div class="page-setting-container">
        <!-- 基本配置 -->
        <style-layout
            :title="$t('基本配置')">
            <template>
                <style-item :name="$t('页面名称')" type="vertical">
                    <bk-input :value="pageDetail.pageName" @change="updatePageDetail('pageName', $event)" />
                </style-item>
                <style-item :name="$t('页面ID')" type="vertical">
                    <bk-input :value="pageDetail.id" disabled />
                </style-item>
            </template>
        </style-layout>

        <page-route-setting />
        <page-style-setting />
    </div>
</template>

<script>
    import StyleLayout from '@/element-materials/modifier/component/styles/layout/index'
    import StyleItem from '@/element-materials/modifier/component/styles/layout/item'
    import PageRouteSetting from './children/page-route-setting'
    import PageStyleSetting from './children/page-style-setting'
    import { defineComponent, computed } from '@vue/composition-api'
    import store from '@/store'
    import LC from '@/element-materials/core'

    export default defineComponent({
        components: {
            StyleLayout,
            StyleItem,
            PageRouteSetting,
            PageStyleSetting
        },
        setup () {
            const pageDetail = computed(() => {
                return store.getters['page/pageDetail']
            })
            
            const updatePageDetail = (key, val) => {
                // 页面配置修改，标记画布资源被修改
                LC.triggerEventListener('updateCanvas', true)
                const setPageDetail = { [key]: val }
                store.commit('page/updatePageDetail', setPageDetail)
            }

            return {
                pageDetail,
                updatePageDetail
            }
        }
    })
</script>

<style lang="postcss">
</style>
