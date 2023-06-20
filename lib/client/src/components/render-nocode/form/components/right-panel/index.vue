<template>
    <div class="right-panel">
        <layout-setting v-if="editType === 'LAYOUT'" :template-data="curTemplateData" />
        <page-setting v-else-if="!field.type && pageDetail.id" />
        <form-setting v-else :is-from-flow="isFromFlow" :field="field" :list="list" :disabled="disabled" @update="$emit('update', $event)" />
    </div>
</template>

<script>
    import FormSetting from './form-setting'
    import LayoutSetting from '@/element-materials/modifier/template'
    import PageSetting from '@/element-materials/modifier/page'
    import { mapGetters } from 'vuex'
    export default {
        components: {
            FormSetting,
            LayoutSetting,
            PageSetting
        },
        props: {
            isFromFlow: Boolean,
            field: {
                type: Object,
                default: () => ({})
            },
            list: {
                type: Array,
                default: () => []
            },
            disabled: Boolean
        },
        data () {
            return {
                editType: 'FORM'
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            ...mapGetters('drag', ['curTemplateData'])
        },
        watch: {
            // template没有指定面板，则展示form属性面板
            curTemplateData (curTemplateData) {
                if (curTemplateData.panelActive) {
                    this.editType = 'LAYOUT'
                } else {
                    this.editType = 'FORM'
                }
            }
        }
    }
</script>

<style lang="postcss" scoped>
.right-panel{
  height: 100%;
  overflow: hidden;
}
</style>
