<template>
    <div class="properties-setting">
        <render-prop
            :config="{ propertyDisplayName: $t('文本'), type: 'Text', val: elementData.name }"
            @change="handleUpdate('name', $event)">
        </render-prop>
        <render-prop
            v-for="item in propsConfig"
            :key="item.propertyDisplayName"
            :config="item"
            @change="handleUpdate('prop', $event)">
        </render-prop>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import getMaterial from '@/element-materials/core/static/get-material.js'
    import RenderProp from './components/render-prop.vue'

    export default {
        name: 'PropertiesSetting',
        components: {
            RenderProp
        },
        props: {
            elementData: Object
        },
        computed: {
            propsConfig () {
                const props = getMaterial('bk-button').props
                return Object.keys(props).map(key => {
                    const config = { propertyDisplayName: key, ...props[key] }
                    if (key in this.elementData.props) {
                        config.val = this.elementData.props[key].val
                    }
                    return config
                })
            }
        },
        methods: {
            handleUpdate (type, config) {
                const elementData = cloneDeep(this.elementData)
                if (type === 'name') {
                    elementData.name = config.val
                } else {
                    elementData.props[config.propertyDisplayName] = config
                }
                this.$emit('change', elementData)
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
