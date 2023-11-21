<template>
    <component
        :is="com"
        :template-data="curTemplateData" />
</template>
<script>
    import { mapGetters } from 'vuex'
    import LC from '@/element-materials/core'
    import ComponentModifier from './component'
    import TemplateModifier from './template'
    import PageModifier from './page'
    import FormEditorContainerModifier from './form-editor-container' // 表单编辑器分类下，容器中元素的属性配置，目前包括表单容器和数据管理容器

    const comMap = {
        template: TemplateModifier,
        component: ComponentModifier,
        page: PageModifier,
        FormEditorContainer: FormEditorContainerModifier
    }

    export default {
        name: 'element-modifier',
        data () {
            return {
                panel: 'page',
                templateInfo: {}
            }
        },
        computed: {
            ...mapGetters('drag', [
                'curTemplateData'
            ]),
            activeNode () {
                return LC.getActiveNode()
            },
            com () {
                if (comMap.hasOwnProperty(this.panel)) {
                    return comMap[this.panel]
                }
                return ComponentModifier
            }
        },
        watch: {
            // template没有指定面板，展示component修改器
            curTemplateData (curTemplateData) {
                this.changePanel()
            }
        },
        created () {
            const activeCallback = () => {
                this.panel = 'component'
            }
            const activeClearCallback = () => {
                this.changePanel()
            }
            const activeElementUpdateCallback = () => {
                const activeElement = LC.getActiveElement()
                if (activeElement) {
                    this.panel = 'FormEditorContainer'
                } else {
                    this.changePanel()
                }
            }
            LC.addEventListener('active', activeCallback)
            LC.addEventListener('activeClear', activeClearCallback)
            LC.addEventListener('activeElementUpdate', activeElementUpdateCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('active', activeCallback)
            })
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('activeClear', activeClearCallback)
            })
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('activeElementUpdate', activeElementUpdateCallback)
            })
        },
        methods: {
            changePanel () {
                if (this.curTemplateData.panelActive) {
                    this.panel = 'template'
                } else if (LC.getActiveNode()?.componentId) {
                    this.panel = 'component'
                } else {
                    this.panel = 'page'
                }
            }
        }
    }
</script>
