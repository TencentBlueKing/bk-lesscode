<template>
    <section class="field-properties-panel">
        <section class="panel-head">
            <span class="element-id">{{ fieldData.id }}</span>
            <div class="actions">
                <i v-bk-tooltips="$t('删除')" class="bk-drag-icon bk-drag-delet mr5"></i>
                <i v-bk-tooltips="$t('复制id')" class="bk-drag-icon bk-drag-copy" @click="handleCopyId"></i>
            </div>
        </section>
        <div class="panel-content">
            <Setter :field="fieldData" :data-source="dataSource" @change="handleChange" />
        </div>
    </section>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import LC from '@/element-materials/core'
    import { execCopy } from '@/common/util'
    import Setter from '@/form-engine/setter/index'

    export default {
        name: 'field-properties-panel',
        components: {
            Setter
        },
        data () {
            return {
                fieldData: {},
                dataSource: {}
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
                if (activeElement) {
                    this.fieldData = activeElement.elementData
                    this.dataSource = activeElement.componentData.renderProps.dataSource.code
                }
            },
            handleCopyId () {
                execCopy(this.fieldData.id)
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
    @import "@/css/mixins/scroller";

    .field-properties-panel {
        height: 100%;
    }
    .panel-head {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 20px;
        height: 42px;
        border-bottom: 1px solid #dcdee5;
        .element-id {
            margin-right: 10px;
            max-width: 230px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .actions {
            display: inline-flex;
            align-items: center;
            & > i {
                cursor: pointer;
                &:hover {
                    color: #3a84ff;
                }
            }
        }
    }
    .panel-content {
        height: calc(100% - 42px);
        overflow: auto;
        @mixin scroller;
    }
</style>
