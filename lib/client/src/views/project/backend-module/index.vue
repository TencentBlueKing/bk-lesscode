<template>
    <layout
        class="api-manage"
        v-bkloading="{ isLoading }"
        :init-width="320"
    >
        <module-category
            slot="left"
            ref="apiCategory"
            :module-change="handleModuleChange"
        />
        <module-content :module-code="currentModule">
            {{currentModule}}
        </module-content>
    </layout>
</template>

<script>
    import Layout from '@/components/ui/layout'
    import ModuleCategory from './children/category.vue'
    import ModuleContent from './children/backend.vue'

    import { defineComponent, ref } from '@vue/composition-api'
    
    export default defineComponent({
        components: {
            Layout,
            ModuleCategory,
            ModuleContent
        },
        setup () {
            const isLoading = ref(false)

            const currentModule = ref('')

            const handleModuleChange = (moduleCode) => {
                currentModule.value = moduleCode
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
    .api-manage {
        height: calc(100vh - 120px);
    }
</style>
