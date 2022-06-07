<template>
    <div>
        <layout-setting v-if="editType === 'LAYOUT'" :template-data="curTemplateData" />
        <form-setting v-else :field="field" :list="list" @update="$emit('update', $event)" />
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
            }
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
