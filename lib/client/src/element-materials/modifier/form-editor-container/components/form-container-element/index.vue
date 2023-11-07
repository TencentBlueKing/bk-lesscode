<template>
    <section class="form-container-element">
        <Setter :field="fieldData" :data-source="dataSource" :list="fields" @change="handleChange" />
    </section>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import LC from '@/element-materials/core'
    import Setter from '@/form-engine/setter/index'

    export default {
        name: 'form-container-element',
        components: {
            Setter
        },
        data () {
            return {
                fieldData: {},
                dataSource: {},
                fields: []
            }
        },
        mounted () {
            this.updateCallBack ()
            LC.addEventListener('activeElementUpdate', this.updateCallBack)
        },
        beforeDestroy () {
            LC.removeEventListener('activeElementUpdate', this.updateCallBack)
        },
        methods: {
            updateCallBack () {
                const activeElement = LC.getActiveElement()
                if (activeElement?.componentData.type === 'widget-form-container') {
                    this.fieldData = activeElement.elementData
                    this.dataSource = activeElement.componentData.renderProps.dataSource.code
                    this.fields = activeElement.componentData.renderProps.fields.code
                }
            },
            handleChange (property, val) {
                this.fieldData.configure[property] = val

                const { componentData } = LC.getActiveElement()
                if (componentData) {
                    const fields = cloneDeep(componentData.renderProps.fields)
                    const index = fields.code.findIndex(item => item.id === this.fieldData.id)
                    if (index > -1) {
                        fields.code.splice(index, 1, this.fieldData)
                        fields.renderValue = cloneDeep(fields.code)
                    }
                    componentData.setProp('fields', { ...fields })
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .form-container-element {
        height: 100%;
    }
</style>
