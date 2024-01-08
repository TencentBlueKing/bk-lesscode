<template>
    <layout
        class="saas-backend-manage"
        v-bkloading="{ isLoading }"
        :init-width="320"
    >
        <module-category
            slot="left"
            ref="apiCategory"
            :module-change="handleModuleChange"
        />
        <module-content :current-module="currentModule">
        </module-content>
    </layout>
</template>

<script>
    import Layout from '@/components/ui/layout'
    import ModuleCategory from './children/category.vue'
    import ModuleContent from './children/backend/index.vue'

    import { defineComponent, ref } from '@vue/composition-api'
    
    export default defineComponent({
        components: {
            Layout,
            ModuleCategory,
            ModuleContent
        },
        setup () {
            const isLoading = ref(false)

            const currentModule = ref({})

            const handleModuleChange = (moduleItem) => {
                currentModule.value = moduleItem
            }

            return {
                isLoading,
                currentModule,
                handleModuleChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .saas-backend-manage {
        height: calc(100vh - 104px);
    }
</style>
