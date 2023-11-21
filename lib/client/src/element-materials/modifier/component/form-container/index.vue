<template>
  <div v-if="show" class="form-container-modifier">
    <data-source
        :value="propsData.dataSource.code"
        @change="handleChange('dataSource', $event)"
        @updateFields="handleUpdateFields"/>
    <row-layout :value="propsData.rowLayout.code" @change="handleChange('rowLayout', $event)"/>
    <operate-actions :value="propsData.actions.code" @change="handleChange('actions', $event)" />
  </div>
</template>
<script>
    import LC from '@/element-materials/core'
    import dataSource from './components/data-source.vue'
    import rowLayout from './components/row-layout.vue'
    import operateActions from './components/operate-actions.vue'

    export default {
        name: 'FormContainerProps',
        components: {
            dataSource,
            rowLayout,
            operateActions
        },
        data () {
            return {
                show: false,
                propsData: {},
                activeNode: null
            }
        },
        created () {
            const activeNode = LC.getActiveNode()
            if (activeNode.type === 'widget-form-container') {
                this.show = true
                this.propsData = activeNode.renderProps
                this.activeNode = activeNode
            }
        },
        methods: {
            handleChange (key, val) {
                this.propsData[key].code = val
                this.propsData[key].renderValue = val
                this.activeNode.setProp(key, this.propsData[key])
            },
            handleUpdateFields (list) {
                this.activeNode.setProp('fields', {
                    ...this.propsData['fields'],
                    code: list,
                    renderValue: list
                })
            }
        }
    }
</script>
