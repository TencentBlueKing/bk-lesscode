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

    const comMap = {
        template: TemplateModifier,
        component: ComponentModifier,
        page: PageModifier
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
            LC.addEventListener('active', activeCallback)
            LC.addEventListener('activeClear', activeClearCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('active', activeCallback)
            })
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('activeClear', activeClearCallback)
            })
        },
        methods: {
            changePanel () {
                if (this.curTemplateData.panelActive) {
                    this.panel = 'template'
                } else if (this.aciveNode?.componentId) {
                    this.panel = 'component'
                } else {
                    this.panel = 'page'
                }
            }
        }
    }
</script>
