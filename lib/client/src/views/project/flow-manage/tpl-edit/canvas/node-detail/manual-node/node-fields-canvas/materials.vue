<template>
    <div class="field-materials-panel">
        <search-box
            placeholder="控件名称"
            :list="searchList"
            @on-change="handleSearch" />
        <section class="materials-container">
            <formEngineMaterial :list="widgetList" />
        </section>
    </div>
</template>
<script>
    import { defineComponent, ref } from '@vue/composition-api';
    import searchBox from '@/views/index/components/material-panel/components/common/search-box/index'
    import renderComponent from '@/views/index/components/material-panel/components/common/group-box/render-component'
    import formEngineMaterial from '@/form-engine/material/index.vue'
    import materialsConfig from '@/form-engine/material/materials'


    export default defineComponent({
        name: 'FieldMaterialsPanel',
        components: {
            searchBox,
            renderComponent,
            formEngineMaterial
        },
        setup (props, { emit }) {
            const configList = materialsConfig.map(item => {
                const config = { ...item }
                if (['description', 'divider', 'computed', 'auto-counting'].includes(config.type)) {
                    config.disabled = true
                }
                return config
            })
            const searchList = ref([...configList])
            const widgetList = ref([...configList])

            const handleSearch = (val) => {
                if (val) {
                    widgetList.value = val.type === 'widget-form-container' ? [] : [val]
                } else {
                    widgetList.value = [...configList]
                }
            }

            return {
                widgetList,
                searchList,
                handleSearch
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .field-materials-panel {
        height: 100%;
        .search-box {
            padding: 6px 12px;
        }
    }
    .materials-container {
        height: calc(100% - 44px);
        overflow-y: auto;
    }
</style>
