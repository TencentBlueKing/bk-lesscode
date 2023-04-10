<template>
    <div class="page-setting-container">
        <!-- 基本配置 -->
        <group
            class="setting-group"
            :show-border-top="true"
            group-name="基本配置">
            <template>
                <section>
                    <div class="setting-label">
                        <span>页面名称</span>：
                    </div>
                    <div class="setting-content">
                        <bk-input :value="pageDetail.pageName" />
                    </div>
                </section>
                <section>
                    <div class="setting-label">
                        <span>页面ID</span>：
                    </div>
                    <div class="setting-content">
                        <bk-input :value="pageDetail.id" disabled />
                    </div>
                </section>
            </template>
        </group>

        <page-route-setting />
        <page-style-setting />
    </div>
</template>

<script>
    import Group from '@/components/ui/group'
    import PageRouteSetting from './children/page-route-setting'
    import PageStyleSetting from './children/page-style-setting'
    import { defineComponent, reactive, ref, computed } from '@vue/composition-api'
    import store from '@/store'

    export default defineComponent({
        components: {
            Group,
            PageRouteSetting,
            PageStyleSetting
        },
        setup () {
            const pageDetail = computed(() => {
                return store.getters['page/pageDetail']
            })

            return {
                pageDetail
            }
        }
    })
</script>

<style lang="postcss">
</style>
