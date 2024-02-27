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

    import { defineComponent, ref, computed, onBeforeMount } from '@vue/composition-api'
    import { useStore } from '@/store'
    
    export default defineComponent({
        components: {
            Layout,
            ModuleCategory,
            ModuleContent
        },
        setup () {
            const store = useStore()

            const isLoading = ref(false)
            const currentModule = ref({})

            const projectDetail = computed(() => {
                return store.getters['project/currentProject']
            })

            const handleModuleChange = (moduleItem) => {
                currentModule.value = moduleItem
            }

            onBeforeMount(() => {
                store.dispatch('saasBackend/checkSaasPerm', {
                    appCode: projectDetail?.value?.appCode,
                    createUser: projectDetail?.value?.createUser
                })
            })

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
        height: 100%;
    }
</style>
