<template>
  <div class="data-manage-container-element">
        <div class="tabs-wrapper">
            <bk-tab :active.sync="activePanel" :label-height="24">
                <bk-tab-panel
                    v-for="panel in panels"
                    :key="panel.name"
                    :name="panel.name"
                    :label="panel.label" />
            </bk-tab>
        </div>
        <div class="setting-container">
            <component :is="settingComp" :element-data="elementData" @change="handleChange" />
        </div>
  </div>
</template>
<script>
    import LC from '@/element-materials/core'
    import Events from './events'
    import Perms from './perms'
    import Properties from './properties'
    import cloneDeep from 'lodash.clonedeep'

    export default {
        name: 'data-manage-container-element',
        data () {
            return {
                panels: [
                    { name: 'properties', label: this.$t('属性') },
                    { name: 'events', label: this.$t('事件') },
                    { name: 'perms', label: this.$t('权限') }
                ],
                compMap: {
                    events: Events,
                    perms: Perms,
                    properties: Properties
                },
                activePanel: 'properties',
                componentData: null,
                elementData: null
            }
        },
        computed: {
            settingComp () {
                const active = this.activePanel || 'properties'
                return this.compMap[active]
            }
        },
        created () {
            this.activeElementUpdateCallback()
            LC.addEventListener('activeElementUpdate', this.activeElementUpdateCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('activeElementUpdate', this.activeElementUpdateCallback)
            })
        },
        methods: {
            activeElementUpdateCallback () {
                const activeElement = LC.getActiveElement()
                if (activeElement) {
                    const { componentData, elementData } = activeElement
                    if (this.elementData?.id !== elementData.id) {
                        this.activePanel = 'properties'
                    }
                    this.componentData = componentData
                    this.elementData = elementData
                }
            },
            handleChange (elementData) {
                const propKey = elementData.type === 'formDataButton' ? 'buttons' : 'tableRowActions'
                const propData = cloneDeep(this.componentData.renderProps[propKey])
                const index = propData.code.findIndex(item => item.id === elementData.id)
                if (index > -1) {
                    propData.code.splice(index, 1, elementData)
                    propData.renderValue = cloneDeep(propData.code)
                    this.elementData = elementData
                    this.componentData.setProp(propKey, propData)
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .data-manage-container-element {
        height: 100%;
    }
    .tabs-wrapper {
        margin: 10px 0;
        padding: 0 12px;
    }
    .bk-tab {
        padding: 4px;
        background: #f0f1f5;
        border-radius: 2px;
        >>> .bk-tab-section {
            display: none;
        }
        >>> .bk-tab-header {
            background: #f0f1f5;
            background-image: none !important;
            border: none;
            .bk-tab-label {
                font-size: 12px;
            }
            .bk-tab-label-item {
                border: none !important;
            }
        }
        >>>.bk-tab-label-wrapper {
            .bk-tab-scroll-controller {
                height: 33px !important;
                background: #f5f7fa;
                color: #979ba5;
                &:hover {
                    background: #eaebf0;
                    color: #63656e;
                }
            }
            .bk-tab-label-item {
                min-width: unset;
                &.active {
                    color: #64656e;
                }
            }
        }
    }
    .setting-container {
        height: calc(100% - 94px);
        overflow: auto;
    }
    .empty-tips {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
</style>
