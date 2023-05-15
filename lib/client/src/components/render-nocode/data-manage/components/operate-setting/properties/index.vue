<template>
    <div class="properties-setting">
        <render-prop
            :config="{ propertyDisplayName: $t('文本'), type: 'Text', val: selectedComp.data.name }"
            @change="handleUpdateName">
        </render-prop>
        <render-prop
            v-for="item in propsConfig"
            :key="item.propertyDisplayName"
            :config="item"
            @change="handleValChange">
        </render-prop>
    </div>
</template>
<script>
    import { mapState, mapMutations } from 'vuex'
    import { cloneDeep } from 'lodash'
    import getMaterial from '@/element-materials/core/static/get-material.js'
    import RenderProp from './components/render-prop.vue'

    export default {
        name: 'PropertiesSetting',
        components: {
            RenderProp
        },
        data () {
            return {}
        },
        computed: {
            ...mapState('nocode/dataManage', ['activeNode', 'selectedComp', 'pageConfig']),
            propsConfig () {
                const props = getMaterial('bk-button').props
                return Object.keys(props).map(key => {
                    const config = { propertyDisplayName: key, ...props[key] }
                    if (key in this.selectedComp.data.props) {
                        config.val = this.selectedComp.data.props[key].val
                    }
                    return config
                })
            }
        },
        methods: {
            ...mapMutations('nocode/dataManage', ['setPageConfig']),
            handleUpdateName (config) {
                if (!config.val) {
                    return
                }
                const pageConfig = cloneDeep(this.pageConfig)
                const compList = (this.activeNode ? pageConfig[this.activeNode] : pageConfig)
                const comp = compList[this.selectedComp.type].find(item => item.id === this.selectedComp.data.id)
                comp.name = config.val
                this.setPageConfig(pageConfig)
            },
            handleValChange (config) {
                const pageConfig = cloneDeep(this.pageConfig)
                const compList = (this.activeNode ? pageConfig[this.activeNode] : pageConfig)
                const comp = compList[this.selectedComp.type].find(item => item.id === this.selectedComp.data.id)
                comp.props[config.propertyDisplayName] = config
                this.setPageConfig(pageConfig)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .properties-setting {
        margin: 0 10px;
        padding-bottom: 20px;
    }
</style>
