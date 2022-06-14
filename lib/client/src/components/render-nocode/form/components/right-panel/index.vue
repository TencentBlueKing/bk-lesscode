<template>
    <div class="right-panel">
        <layout-setting v-if="editType === 'LAYOUT'" :template-data="curTemplateData" />
        <form-setting v-else :field="field" :list="list" :disabled="disabled" @update="$emit('update', $event)" />
    </div>
</template>

<script>
    import FormSetting from './form-setting'
    import LayoutSetting from '@/element-materials/modifier/template'
    import { mapGetters } from 'vuex'
    export default {
        components: {
            FormSetting,
            LayoutSetting
        },
        props: {
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
